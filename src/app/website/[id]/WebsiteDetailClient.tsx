"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportModal } from "@/components/ui/report-modal";
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Website bulunamadı</h1>
        <Button onClick={() => router.push('/explore')}>
          Keşfete Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Website Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{website.title}</CardTitle>
                      {website.isPremium && (
                        <Star className="h-6 w-6 text-yellow-500 fill-current" />
                      )}
                      {website.featured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                          Öne Çıkan
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{(website.views || 0).toLocaleString()} görüntüleme</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{likesCount.toLocaleString()} beğeni</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{convertFirestoreDate(website.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">
                        {categoryLabels[website.category]}
                      </Badge>
                      {website.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {technologyLabels[tech]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <CardDescription className="text-base">
                  {website.description}
                </CardDescription>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={handleLike}
                    disabled={isLiking}
                    variant={isLiked ? "default" : "outline"}
                    className={`flex items-center gap-2 ${isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Beğenildi' : 'Beğen'}
                  </Button>
                  
                  <Button
                    onClick={handleVisitWebsite}
                    className="flex items-center gap-2"
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
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
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
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={website.imageUrl} 
                      alt={website.title}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover"
                    />
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Website Sahibi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={websiteOwner.photoURL || ''} />
                      <AvatarFallback>
                        {websiteOwner.displayName?.charAt(0) || websiteOwner.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {websiteOwner.displayName || 'Anonim Kullanıcı'}
                      </h3>
                      {websiteOwner.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          Premium Üye
                        </Badge>
                      )}
                    </div>
                  </div>

                  {websiteOwner.bio && (
                    <p className="text-sm text-muted-foreground">
                      {websiteOwner.bio}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {websiteOwner.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{websiteOwner.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Katılma: {websiteOwner.createdAt.toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  {websiteOwner.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(websiteOwner.website, '_blank')}
                    >
                      <Globe className="h-3 w-3 mr-2" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benzer Websiteler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedWebsites.map((relatedSite) => (
                    <div
                      key={relatedSite.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => router.push(`/website/${relatedSite.id}`)}
                    >
                      {relatedSite.imageUrl && (
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={relatedSite.imageUrl} 
                            alt={relatedSite.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{relatedSite.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{(relatedSite.views || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{(relatedSite.likes || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 