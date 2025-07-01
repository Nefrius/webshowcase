"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Star, 
  Eye, 
  Heart, 
  ArrowLeft,
  ExternalLink,
  User as UserIcon
} from "lucide-react";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { Website } from "@/types/website";
import WebsiteCard from "@/components/website/WebsiteCard";

interface PageParams {
  params: Promise<{ userId: string }>;
}

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

export default function PublicProfilePage({ params }: PageParams) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalViews: 0,
    totalLikes: 0
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        // Check if Firebase is available
        if (!db) {
          console.error('Firebase not initialized');
          setLoading(false);
          return;
        }
        
        // Get user data
        const userDoc = await getDoc(doc(db!, 'users', resolvedParams.userId));
        
        if (!userDoc.exists()) {
          router.push('/404');
          return;
        }

        const userData = userDoc.data();
        const mappedUser: User = {
          uid: userDoc.id,
          email: userData.email || '',
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          isPremium: userData.isPremium || false,
          role: userData.role || 'user',
          createdAt: convertFirestoreDate(userData.createdAt),
          lastLoginAt: convertFirestoreDate(userData.lastLoginAt),
          bio: userData.bio,
          website: userData.website,
          location: userData.location,
          social: userData.social,
          // Moderation fields
          isBlocked: userData.isBlocked || false,
          blockReason: userData.blockReason,
          warningCount: userData.warningCount || 0
        };
        
        setUser(mappedUser);

        // Get user's websites
        const websitesQuery = query(
          collection(db!, 'websites'),
          where('ownerId', '==', resolvedParams.userId),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        
        const websitesSnapshot = await getDocs(websitesQuery);
        const userWebsites = websitesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Website[];
        
        setWebsites(userWebsites);

        // Calculate stats
        const totalViews = userWebsites.reduce((sum, website) => sum + (website.views || 0), 0);
        const totalLikes = userWebsites.reduce((sum, website) => sum + (website.likes || 0), 0);
        
        setStats({
          totalWebsites: userWebsites.length,
          totalViews,
          totalLikes
        });

      } catch (error) {
        console.error('Error loading user profile:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [resolvedParams.userId, router]);

  // Handle like updates from WebsiteCard
  const handleLikeUpdate = (websiteId: string, newLikes: number) => {
    setWebsites(prev =>
      prev.map(website =>
        website.id === websiteId
          ? { ...website, likes: newLikes }
          : website
      )
    );
    
    // Update total likes in stats
    setStats(prev => ({
      ...prev,
      totalLikes: websites.reduce((sum, website) => 
        sum + (website.id === websiteId ? newLikes : (website.likes || 0)), 0
      )
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-2xl font-bold mb-4">Kullanıcı bulunamadı</h1>
          <Button onClick={() => router.push('/users')}>
            Kullanıcılara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
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

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar & Basic Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback className="text-2xl">
                      {user.displayName?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">
                        {user.displayName || 'Anonim Kullanıcı'}
                      </CardTitle>
                      {user.isPremium && (
                        <Star className="h-6 w-6 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <CardDescription className="text-base">
                      {user.email}
                    </CardDescription>
                    {user.isPremium && (
                      <Badge className="mt-2 bg-gradient-to-r from-amber-500 to-yellow-600">
                        Premium Üye
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {stats.totalWebsites}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Website
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        <Eye className="h-5 w-5" />
                        {stats.totalViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Görüntüleme
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        <Heart className="h-5 w-5" />
                        {stats.totalLikes.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Beğeni
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Bio */}
              {user.bio && (
                <div>
                  <h3 className="font-semibold mb-2">Hakkında</h3>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {user.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {user.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Katıldı: {user.createdAt.toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User's Websites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {user.displayName || 'Kullanıcının'} Websiteleri ({websites.length})
            </h2>
          </div>

          {websites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Henüz website yok</h3>
                <p className="text-muted-foreground">
                  Bu kullanıcı henüz hiç website paylaşmamış.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <WebsiteCard
                    website={website}
                    onLikeUpdate={handleLikeUpdate}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 