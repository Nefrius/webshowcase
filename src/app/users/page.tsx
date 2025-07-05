"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportModal } from "@/components/ui/report-modal";
import { 
  Search, 
  Users, 
  MapPin, 
  Globe, 
  Calendar, 
  Star, 
  Eye, 
  Heart, 
  Flag,
  Crown,
  Shield,
  TrendingUp,
  Award,
  User
} from "lucide-react";
import FollowButton from "@/components/ui/FollowButton";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType } from "@/types/user";
import { Website } from "@/types/website";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserWithStats extends UserType {
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
  const [topUsers, setTopUsers] = useState<UserWithStats[]>([]);
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
        })) as UserType[];

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
        
        // Set top users
        const topUsersList = [...usersWithStats]
          .sort((a, b) => (b.totalLikes + b.totalViews) - (a.totalLikes + a.totalViews))
          .slice(0, 3);
        setTopUsers(topUsersList);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
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

        {/* Top Users Section */}
        <div className="mb-12 relative">
          {/* Background with grayscale gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 via-gray-500/10 to-gray-600/10 rounded-3xl blur-xl"></div>
          
          <div className="relative z-10 p-8 text-white">
            {/* Header Section */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <TrendingUp className="w-6 h-6 text-gray-200" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent">
                  {t('users.topActiveUsers')}
                </h2>
              </motion.div>
              <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                En aktif topluluk üyelerimizi keşfedin ve projelerini inceleyin
              </p>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topUsers.map((user, index) => (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="relative"
                >
                  <Card 
                    className="h-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-2xl hover:scale-105"
                    onClick={() => handleUserClick(user.uid)}
                  >
                    {/* Ranking Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <Badge className={`${
                        index === 0 ? 'bg-gradient-to-r from-white to-gray-100 text-black shadow-lg' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' : 
                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      } font-bold ring-2 ring-white/30`}>
                        #{index + 1}
                      </Badge>
                    </div>

                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <Avatar className="h-20 w-20 mx-auto ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback className="text-xl bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800">
                            {user.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Role indicator on avatar */}
                        <div className="absolute -bottom-1 -right-1 bg-white/20 backdrop-blur-sm rounded-full p-1.5 border border-white/30">
                          {getRoleIcon(user.role)}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="font-bold text-white text-base group-hover:text-gray-200 transition-colors duration-300">
                            {user.displayName?.split(' ')[0] || t('users.profile.anonymous')}
                          </h3>
                        </div>
                        
                        {/* Role Badge */}
                        <div className="mb-2">
                          {getRoleBadge(user.role)}
                        </div>
                        
                        {/* Stats with beautiful icons */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center justify-center gap-1 text-white/80">
                            <div className="p-1 bg-white/20 rounded-full">
                              <Globe className="w-3 h-3" />
                            </div>
                            <span className="font-medium">{user.websiteCount}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-white/80">
                            <div className="p-1 bg-white/20 rounded-full">
                              <Heart className="w-3 h-3" />
                            </div>
                            <span className="font-medium">{user.totalLikes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="h-full hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/20"
                  onClick={() => handleUserClick(user.uid)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Role indicator on avatar */}
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                          {getRoleIcon(user.role)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                            {user.displayName?.split(' ')[0] || t('users.profile.anonymous')}
                          </CardTitle>
                          {user.isPremium && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        {/* Role Badge */}
                        <div className="mb-2">
                          {getRoleBadge(user.role)}
                        </div>
                        
                        {/* Custom Badge */}
                        {user.badge && (
                          <Badge 
                            style={{ 
                              backgroundColor: user.badge.bgColor, 
                              color: user.badge.color,
                              borderColor: user.badge.color 
                            }}
                            className="text-xs"
                          >
                            {user.badge.icon && <span className="mr-1">{user.badge.icon}</span>}
                            {user.badge.displayName}
                          </Badge>
                        )}
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
                        <div className="text-lg font-semibold text-primary flex items-center justify-center gap-1">
                          <Globe className="h-3 w-3" />
                          {user.websiteCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('users.stats.websites')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" />
                          {user.totalViews.toLocaleString()}
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
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div 
                          className="flex-1 mr-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FollowButton
                            targetUserId={user.uid}
                            targetUserName={user.displayName?.split(' ')[0] || t('users.profile.anonymous')}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          />
                        </div>
                        <ReportModal
                          targetType="user"
                          targetId={user.uid}
                          targetTitle={user.displayName?.split(' ')[0] || t('users.profile.anonymous')}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </ReportModal>
                      </div>
                    )}

                    {/* Premium Badge */}
                    {user.isPremium && (
                      <Badge className="w-full justify-center bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0">
                        <Award className="w-3 h-3 mr-1" />
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