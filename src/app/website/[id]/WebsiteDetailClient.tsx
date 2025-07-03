"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportModal } from "@/components/ui/report-modal";
import CommentList from "@/components/comment/CommentList";
import RatingList from "@/components/rating/RatingList";
import BookmarkButton from "@/components/bookmark/BookmarkButton";
import { 
  Globe, 
  Heart, 
  Eye, 
  ExternalLink, 
  Star, 
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Flag
} from "lucide-react";
import { motion } from "framer-motion";
import { Website, WebsiteCategory, Technology } from "@/types/website";
import { User as UserType } from "@/types/user";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { trackWebsiteView, likeWebsite, checkUserLiked } from "@/lib/social";
import { useRouter } from "next/navigation";

interface PageParams {
  params: Promise<{ id: string }>;
}

const categoryLabels = {
  [WebsiteCategory.ECOMMERCE]: "E-ticaret",
  [WebsiteCategory.PORTFOLIO]: "Portfolio", 
  [WebsiteCategory.BLOG]: "Blog",
  [WebsiteCategory.CORPORATE]: "Kurumsal",
  [WebsiteCategory.LANDING]: "Landing Page",
  [WebsiteCategory.DASHBOARD]: "Dashboard",
  [WebsiteCategory.SOCIAL]: "Sosyal Medya",
  [WebsiteCategory.EDUCATIONAL]: "Eğitim",
  [WebsiteCategory.NEWS]: "Haber",
  [WebsiteCategory.OTHER]: "Diğer"
};

const technologyLabels = {
  [Technology.REACT]: "React",
  [Technology.VUE]: "Vue.js",
  [Technology.ANGULAR]: "Angular",
  [Technology.NEXTJS]: "Next.js",
  [Technology.NUXTJS]: "Nuxt.js",
  [Technology.SVELTE]: "Svelte",
  [Technology.NODEJS]: "Node.js",
  [Technology.PYTHON]: "Python",
  [Technology.PHP]: "PHP",
  [Technology.JAVA]: "Java",
  [Technology.CSHARP]: "C#",
  [Technology.RUBY]: "Ruby",
  [Technology.TAILWIND]: "Tailwind CSS",
  [Technology.BOOTSTRAP]: "Bootstrap",
  [Technology.BULMA]: "Bulma",
  [Technology.CHAKRA]: "Chakra UI",
  [Technology.MONGODB]: "MongoDB",
  [Technology.MYSQL]: "MySQL",
  [Technology.POSTGRESQL]: "PostgreSQL",
  [Technology.FIREBASE]: "Firebase",
  [Technology.SUPABASE]: "Supabase",
  [Technology.WORDPRESS]: "WordPress",
  [Technology.WEBFLOW]: "Webflow",
  [Technology.SHOPIFY]: "Shopify",
  [Technology.REACT_NATIVE]: "React Native",
  [Technology.FLUTTER]: "Flutter"
};

// Helper function to safely convert Firestore timestamp to Date
const convertFirestoreDate = (timestamp: unknown): Date => {
  if (!timestamp) return new Date();
  if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp) {
    return new Date((timestamp as { seconds: number }).seconds * 1000);
  }
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp as string | number);
};

export default function WebsiteDetailClient({ params }: PageParams) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [website, setWebsite] = useState<Website | null>(null);
  const [websiteOwner, setWebsiteOwner] = useState<UserType | null>(null);
  const [relatedWebsites, setRelatedWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        setLoading(true);
        
        // Check if Firebase is available
        if (!db) {
          console.error('Firebase not initialized');
          setLoading(false);
          return;
        }
        
        // Get website data
        const websiteDoc = await getDoc(doc(db, 'websites', resolvedParams.id));
        
        if (!websiteDoc.exists()) {
          router.push('/404');
          return;
        }

        const websiteData = { id: websiteDoc.id, ...websiteDoc.data() } as Website;
        setWebsite(websiteData);
        setLikesCount(websiteData.likes || 0);

        // Track view
        await trackWebsiteView(resolvedParams.id, user?.uid);

        // Get website owner (check both ownerId and userId for compatibility)
        const ownerUserId = websiteData.ownerId || (websiteData as Website & { userId?: string }).userId;
        if (ownerUserId) {
          const ownerDoc = await getDoc(doc(db!, 'users', ownerUserId));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            setWebsiteOwner({
              uid: ownerDoc.id,
              email: ownerData.email || '',
              displayName: ownerData.displayName,
              photoURL: ownerData.photoURL,
              isPremium: ownerData.isPremium || false,
              createdAt: convertFirestoreDate(ownerData.createdAt),
              lastLoginAt: convertFirestoreDate(ownerData.lastLoginAt),
              bio: ownerData.bio,
              website: ownerData.website,
              location: ownerData.location,
              social: ownerData.social
            } as UserType);
          }
        }

        // Check if user liked this website
        if (user?.uid) {
          const liked = await checkUserLiked(resolvedParams.id, user.uid);
          setIsLiked(liked);
        }

        // Get related websites (same category, excluding current)
        const relatedQuery = query(
          collection(db!, 'websites'),
          where('category', '==', websiteData.category),
          where('status', '==', 'approved'),
          limit(4)
        );
        
        const relatedSnapshot = await getDocs(relatedQuery);
        const related = relatedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Website))
          .filter(site => site.id !== resolvedParams.id)
          .slice(0, 3);
        
        setRelatedWebsites(related);

      } catch (error) {
        console.error('Error fetching website data:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();
  }, [resolvedParams.id, user?.uid, router]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLiking || !website) return;
    
    setIsLiking(true);
    
    try {
      const result = await likeWebsite(website.id, user.uid);
      
      if (result.success) {
        setIsLiked(result.liked);
        setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Open external website
  const handleVisitWebsite = () => {
    if (website) {
      window.open(website.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Loading Header */}
        <div className="relative bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-20 bg-muted rounded-full animate-pulse"></div>
              <div className="h-8 w-px bg-border"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Loading */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card Loading */}
              <div className="animate-pulse">
                <div className="h-64 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-0 shadow-xl shadow-black/5"></div>
              </div>
              
              {/* Preview Card Loading */}
              <div className="animate-pulse">
                <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-0 shadow-xl shadow-black/5"></div>
              </div>
            </div>
            
            {/* Sidebar Loading */}
            <div className="space-y-6">
              {/* Owner Card Loading */}
              <div className="animate-pulse">
                <div className="h-48 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-0 shadow-lg shadow-black/5"></div>
              </div>
              
              {/* Related Card Loading */}
              <div className="animate-pulse">
                <div className="h-64 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-0 shadow-lg shadow-black/5"></div>
              </div>
            </div>
          </div>
          
          {/* Bottom Cards Loading */}
          <div className="mt-12 space-y-8">
            <div className="animate-pulse">
              <div className="h-96 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-0 shadow-xl shadow-black/5"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-64 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-0 shadow-xl shadow-black/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
              <ExternalLink className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Website bulunamadı
            </h1>
            <p className="text-muted-foreground mb-6">
              Aradığınız website mevcut değil veya kaldırılmış olabilir.
            </p>
            <Button 
              onClick={() => router.push('/explore')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Keşfete Dön
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-white/50 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <div className="h-8 w-px bg-border" />
            <p className="text-sm text-muted-foreground">Website Detayı</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Website Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-xl shadow-black/5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        {website.title}
                      </CardTitle>
                      {website.isPremium && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          Premium
                        </div>
                      )}
                      {website.featured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                          🔥 Öne Çıkan
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{(website.views || 0).toLocaleString()}</span>
                        <span className="text-xs">görüntüleme</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500'}`} />
                        <span className="font-medium">{likesCount.toLocaleString()}</span>
                        <span className="text-xs">beğeni</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-xs">{convertFirestoreDate(website.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-medium">
                        {categoryLabels[website.category]}
                      </Badge>
                      {website.technologies.slice(0, 5).map((tech) => (
                        <Badge key={tech} variant="secondary" className="bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-colors">
                          {technologyLabels[tech]}
                        </Badge>
                      ))}
                      {website.technologies.length > 5 && (
                        <Badge variant="secondary" className="bg-muted">
                          +{website.technologies.length - 5} daha
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <CardDescription className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
                  {website.description}
                </CardDescription>

                <div className="flex flex-wrap items-center gap-3">
                  <BookmarkButton
                    websiteId={website.id}
                    variant="bookmark"
                    size="lg"
                    showText={true}
                  />
                  
                  <Button
                    onClick={handleLike}
                    disabled={isLiking}
                    variant={isLiked ? "default" : "outline"}
                    size="lg"
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      isLiked 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg' 
                        : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Beğenildi' : 'Beğen'}
                  </Button>
                  
                  <Button
                    onClick={handleVisitWebsite}
                    size="lg"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website&apos;yi Ziyaret Et
                  </Button>

                  {user && user.uid !== website.ownerId && (
                    <ReportModal
                      targetType="website"
                      targetId={website.id}
                      targetTitle={website.title}
                    >
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                        <Flag className="h-4 w-4 mr-2" />
                        Bildir
                      </Button>
                    </ReportModal>
                  )}
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Website Preview */}
          {website.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="group overflow-hidden border-0 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    <Image
                      src={website.imageUrl} 
                      alt={website.title}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    {/* Overlay for better interactivity */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Preview indicator */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      <ExternalLink className="h-3 w-3 inline mr-1" />
                      Önizleme
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Website Owner */}
          {websiteOwner && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg shadow-black/5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                    Website Sahibi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage src={websiteOwner.photoURL || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {websiteOwner.displayName?.charAt(0) || websiteOwner.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">
                        {websiteOwner.displayName || 'Anonim Kullanıcı'}
                      </h3>
                      {websiteOwner.isPremium && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 mt-1">
                          ⭐ Premium Üye
                        </Badge>
                      )}
                    </div>
                  </div>

                  {websiteOwner.bio && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {websiteOwner.bio}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    {websiteOwner.location && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full">
                          <MapPin className="h-4 w-4 text-red-600" />
                        </div>
                        <span>{websiteOwner.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Katılma: {websiteOwner.createdAt.toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  {websiteOwner.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      onClick={() => window.open(websiteOwner.website, '_blank')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Kişisel Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Related Websites */}
          {relatedWebsites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg shadow-black/5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
                    Benzer Websiteler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedWebsites.map((relatedSite, index) => (
                    <motion.div
                      key={relatedSite.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-200 hover:shadow-md"
                      onClick={() => router.push(`/website/${relatedSite.id}`)}
                    >
                      {relatedSite.imageUrl && (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <Image
                            src={relatedSite.imageUrl} 
                            alt={relatedSite.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{relatedSite.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                            <Eye className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">{(relatedSite.views || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                            <Heart className="h-3 w-3 text-red-600" />
                            <span className="font-medium">{(relatedSite.likes || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Rating Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12"
      >
        <RatingList websiteId={website.id} />
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12"
      >
        <CommentList websiteId={website.id} />
      </motion.div>
      </div>
    </div>
  );
} 