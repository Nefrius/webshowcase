'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, UserPlus, Search, Filter, Loader2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getFollowers, 
  getFollowing, 
  getFollowStats,
  getFollowStatus 
} from '@/lib/follows';
import { FollowUser, FollowStats, FollowListFilters, FollowStatus } from '@/types/follow';
import FollowButton from './FollowButton';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import Link from 'next/link';

interface FollowListProps {
  userId: string;
  userName?: string;
  initialTab?: 'followers' | 'following';
  showStats?: boolean;
  compact?: boolean;
  className?: string;
}

export default function FollowList({
  userId,
  userName = 'Kullanıcı',
  initialTab = 'followers',
  showStats = true,
  compact = false,
  className = ''
}: FollowListProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [followStatuses, setFollowStatuses] = useState<Record<string, FollowStatus>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'popular'>('recent');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const filters: FollowListFilters = {
    sortBy,
    limit: 20
  };

  // Load follow stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getFollowStats(userId);
        setFollowStats(stats);
      } catch (error) {
        console.error('Error loading follow stats:', error);
      }
    };

    loadStats();
  }, [userId]);

  // Load followers/following
  useEffect(() => {
    const loadFollowData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'followers') {
          const followersData = await getFollowers(userId, filters);
          setFollowers(followersData);
        } else {
          const followingData = await getFollowing(userId, filters);
          setFollowing(followingData);
        }
      } catch (error) {
        console.error('Error loading follow data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFollowData();
  }, [userId, activeTab, sortBy, filters]);

  // Load follow statuses for current user
  useEffect(() => {
    if (!user) return;

    const loadFollowStatuses = async () => {
      const currentUsers = activeTab === 'followers' ? followers : following;
      const statuses: Record<string, FollowStatus> = {};

      for (const followUser of currentUsers) {
        if (followUser.id !== user.uid) {
          try {
            const status = await getFollowStatus(user.uid, followUser.id);
            statuses[followUser.id] = status;
          } catch (error) {
            console.error('Error loading follow status:', error);
          }
        }
      }

      setFollowStatuses(statuses);
    };

    loadFollowStatuses();
  }, [user, followers, following, activeTab]);

  // Filter users based on search term
  const filteredUsers = (activeTab === 'followers' ? followers : following).filter(
    followUser => 
      followUser.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUser.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load more users
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const lastUser = activeTab === 'followers' ? followers[followers.length - 1] : following[following.length - 1];
      const newFilters = {
        ...filters,
        startAfter: lastUser?.followedAt
      };

      if (activeTab === 'followers') {
        const newFollowers = await getFollowers(userId, newFilters);
        if (newFollowers.length === 0) {
          setHasMore(false);
        } else {
          setFollowers(prev => [...prev, ...newFollowers]);
        }
      } else {
        const newFollowing = await getFollowing(userId, newFilters);
        if (newFollowing.length === 0) {
          setHasMore(false);
        } else {
          setFollowing(prev => [...prev, ...newFollowing]);
        }
      }
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderUserCard = (followUser: FollowUser) => (
    <Card key={followUser.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={followUser.photoURL || ''} alt={followUser.displayName || 'User'} />
            <AvatarFallback>
              {followUser.displayName?.charAt(0) || followUser.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${followUser.id}`}
                className="font-medium hover:text-blue-600 transition-colors"
              >
                {followUser.displayName || 'İsimsiz Kullanıcı'}
              </Link>
              

              
              {followStatuses[followUser.id]?.mutualFollow && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Karşılıklı
                </Badge>
              )}
            </div>
            
            {followUser.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {followUser.bio}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {followUser.followersCount !== undefined && (
                <span>{followUser.followersCount} takipçi</span>
              )}
              {followUser.followingCount !== undefined && (
                <span>{followUser.followingCount} takip</span>
              )}
              {followUser.followedAt && (
                <span>
                  {formatDistanceToNow(followUser.followedAt.toDate(), { 
                    addSuffix: true, 
                    locale: language === 'tr' ? tr : enUS 
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {user && user.uid !== followUser.id && (
          <FollowButton
            targetUserId={followUser.id}
            targetUserName={followUser.displayName || 'kullanıcı'}
            variant="outline"
            size="sm"
          />
        )}
      </div>
    </Card>
  );

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showStats && followStats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{followStats.followersCount} takipçi</span>
            <span>{followStats.followingCount} takip</span>
          </div>
        )}
        
        <div className="space-y-2">
          {filteredUsers.slice(0, 5).map(renderUserCard)}
          {filteredUsers.length > 5 && (
            <Button variant="outline" size="sm" className="w-full">
              {filteredUsers.length - 5} kişi daha görüntüle
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showStats && followStats && (
        <div className="flex items-center justify-center gap-8 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{followStats.followersCount}</div>
            <div className="text-sm text-muted-foreground">Takipçi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{followStats.followingCount}</div>
            <div className="text-sm text-muted-foreground">Takip</div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'followers' | 'following')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Takipçiler {followStats && `(${followStats.followersCount})`}
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Takip Edilenler {followStats && `(${followStats.followingCount})`}
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'alphabetical' | 'popular')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">En Yeni</SelectItem>
                <SelectItem value="alphabetical">Alfabetik</SelectItem>
                <SelectItem value="popular">Popüler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="followers" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Takipçiler yükleniyor...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{userName} henüz takipçi yok</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map(renderUserCard)}
                
                {hasMore && (
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Yükleniyor...
                      </>
                    ) : (
                      'Daha Fazla Göster'
                    )}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Takip edilenler yükleniyor...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{userName} henüz kimseyi takip etmiyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map(renderUserCard)}
                
                {hasMore && (
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Yükleniyor...
                      </>
                    ) : (
                      'Daha Fazla Göster'
                    )}
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Kompakt versiyon - sidebar için
export function FollowListCompact({ 
  userId, 
  userName,
  className = '' 
}: Pick<FollowListProps, 'userId' | 'userName' | 'className'>) {
  return (
    <FollowList
      userId={userId}
      userName={userName}
      className={className}
      compact={true}
      showStats={true}
    />
  );
}

// Modal versiyon - popup için
export function FollowListModal({ 
  userId, 
  userName,
  initialTab = 'followers',
  className = '' 
}: Pick<FollowListProps, 'userId' | 'userName' | 'initialTab' | 'className'>) {
  return (
    <div className={`max-h-96 overflow-y-auto ${className}`}>
      <FollowList
        userId={userId}
        userName={userName}
        initialTab={initialTab}
        showStats={false}
        compact={false}
      />
    </div>
  );
} 