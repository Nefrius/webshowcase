"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportModal } from "@/components/ui/report-modal";
import { Search, Users, MapPin, Globe, Calendar, Star, Eye, Heart, Flag } from "lucide-react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/user";
import { Website } from "@/types/website";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserWithStats extends User {
  websiteCount: number;
  totalViews: number;
  totalLikes: number;
  websites?: Website[];
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "websites">("recent");

  // Load users and their stats
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Check if Firebase is available
        if (!db) {
          console.error('Firebase not initialized');
          setLoading(false);
          return;
        }
        
        // Get all users
        const usersQuery = query(
          collection(db!, 'users'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as User[];

        // Get user statistics
        const usersWithStats: UserWithStats[] = await Promise.all(
          usersData.map(async (user) => {
            try {
              // Get user's websites
              const websitesQuery = query(
                collection(db!, 'websites'),
                where('ownerId', '==', user.uid)
              );
              
              const websitesSnapshot = await getDocs(websitesQuery);
              const websites = websitesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Website[];

              // Calculate total views and likes
              const totalViews = websites.reduce((sum, website) => sum + (website.views || 0), 0);
              const totalLikes = websites.reduce((sum, website) => sum + (website.likes || 0), 0);

              return {
                ...user,
                websiteCount: websites.length,
                totalViews,
                totalLikes,
                websites
              };
            } catch (error) {
              console.error(`Error loading stats for user ${user.uid}:`, error);
              return {
                ...user,
                websiteCount: 0,
                totalViews: 0,
                totalLikes: 0,
                websites: []
              };
            }
          })
        );

        setUsers(usersWithStats);
        setFilteredUsers(usersWithStats);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort users
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.totalLikes + b.totalViews) - (a.totalLikes + a.totalViews);
        case "websites":
          return b.websiteCount - a.websiteCount;
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy]);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{t('users.title')}</h1>
          <p className="text-muted-foreground">
            {t('users.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background border rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recent")}
              >
                {t('users.newest')}
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("popular")}
              >
                {t('users.mostPopular')}
              </Button>
              <Button
                variant={sortBy === "websites" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("websites")}
              >
                {t('users.mostActive')}
              </Button>
            </div>
          </div>

          {/* Search Results Count */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {searchTerm && `"${searchTerm}" için `}
              {filteredUsers.length} {t('users.foundUsers')}
            </p>
          </div>
        </motion.div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? t('users.notFound') : t('users.noUsers')}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? t('users.notFoundDescription') : t('users.noUsersDescription')}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleUserClick(user.uid)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback className="text-lg">
                          {user.displayName?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                            {user.displayName || t('users.profile.anonymous')}
                          </CardTitle>
                          {user.isPremium && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {user.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {/* Location & Website */}
                    <div className="space-y-2">
                      {user.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                      
                      {user.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{user.website}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{t('users.profile.joined')}: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary">
                          {user.websiteCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('users.stats.websites')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" />
                          {user.totalViews}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('users.stats.views')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3" />
                          {user.totalLikes}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('users.stats.likes')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {currentUser && currentUser.uid !== user.uid && (
                      <div className="flex justify-end pt-2">
                        <ReportModal
                          targetType="user"
                          targetId={user.uid}
                          targetTitle={user.displayName || user.email}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            {t('users.profile.reportUser')}
                          </Button>
                        </ReportModal>
                      </div>
                    )}

                    {/* Premium Badge */}
                    {user.isPremium && (
                      <Badge className="w-full justify-center bg-gradient-to-r from-amber-500 to-yellow-600">
                        {t('auth.premium')} Member
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
} 