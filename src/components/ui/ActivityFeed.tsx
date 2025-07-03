'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, ActivityFeedProps, ActivityFilters } from '@/types/activity';
import { getActivityFeed } from '@/lib/activities';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import ActivityItem from './ActivityItem';
import { 
  RefreshCw, 
  Search,
  Users,
  Heart,
  MessageCircle,
  Star,
  Bookmark,
  UserPlus,
  Globe,
  User
} from 'lucide-react';

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  userId,
  followingOnly = false,
  activityTypes,
  limit = 20,
  compact = false,
  showFilters = true,
  className = ''
}) => {
  const { language } = useLanguage();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<ActivityFilters>({
    userId,
    followingOnly,
    activityTypes,
    limit,
    sortBy: 'recent'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  
  // Load activities
  const loadActivities = useCallback(async (isLoadMore = false, isRefresh = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
        setError(null);
      } else {
        setLoading(true);
        setError(null);
      }
      
      const currentFilters: ActivityFilters = {
        ...filters,
        sortBy,
        startAfter: isLoadMore ? activities[activities.length - 1]?.createdAt : undefined
      };
      
      const response = await getActivityFeed(currentFilters);
      
      if (isLoadMore) {
        setActivities(prev => [...prev, ...response.activities]);
      } else {
        setActivities(response.activities);
      }
      
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(language === 'tr' ? 'Aktiviteler yüklenemedi' : 'Failed to load activities');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [filters, sortBy, language]);
  
  // Load more activities
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      
      const currentFilters: ActivityFilters = {
        ...filters,
        sortBy,
        startAfter: activities[activities.length - 1]?.createdAt
      };
      
      getActivityFeed(currentFilters)
        .then(response => {
          setActivities(prev => [...prev, ...response.activities]);
          setHasMore(response.hasMore);
        })
        .catch(err => {
          console.error('Error loading more activities:', err);
          setError(language === 'tr' ? 'Daha fazla aktivite yüklenemedi' : 'Failed to load more activities');
        })
        .finally(() => {
          setLoadingMore(false);
        });
    }
  }, [loadingMore, hasMore, filters, sortBy, activities, language]);
  
  // Refresh activities
  const refresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    
    const currentFilters: ActivityFilters = {
      ...filters,
      sortBy
    };
    
    getActivityFeed(currentFilters)
      .then(response => {
        setActivities(response.activities);
        setHasMore(response.hasMore);
      })
      .catch(err => {
        console.error('Error refreshing activities:', err);
        setError(language === 'tr' ? 'Aktiviteler yenilenemedi' : 'Failed to refresh activities');
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [filters, sortBy, language]);
  
  // Filter activities by search term
  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.userDisplayName.toLowerCase().includes(searchLower) ||
      activity.websiteTitle?.toLowerCase().includes(searchLower) ||
      activity.commentText?.toLowerCase().includes(searchLower) ||
      activity.targetUserDisplayName?.toLowerCase().includes(searchLower)
    );
  });
  
  // Activity type options
  const activityTypeOptions = [
    { value: 'all', label: language === 'tr' ? 'Tüm Aktiviteler' : 'All Activities', icon: Globe },
    { value: 'website_submit', label: language === 'tr' ? 'Website Gönderimi' : 'Website Submission', icon: Globe },
    { value: 'website_like', label: language === 'tr' ? 'Website Beğenisi' : 'Website Like', icon: Heart },
    { value: 'website_comment', label: language === 'tr' ? 'Website Yorumu' : 'Website Comment', icon: MessageCircle },
    { value: 'website_rating', label: language === 'tr' ? 'Website Değerlendirmesi' : 'Website Rating', icon: Star },
    { value: 'user_follow', label: language === 'tr' ? 'Kullanıcı Takibi' : 'User Follow', icon: UserPlus },
    { value: 'bookmark_create', label: language === 'tr' ? 'Bookmark Oluşturma' : 'Bookmark Creation', icon: Bookmark },
    { value: 'profile_update', label: language === 'tr' ? 'Profil Güncelleme' : 'Profile Update', icon: User }
  ];
  
  // Update filters when type changes
  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    setFilters(prev => ({
      ...prev,
      activityTypes: type === 'all' ? undefined : [type as 'website_submit' | 'website_like' | 'website_comment' | 'website_rating' | 'user_follow' | 'bookmark_create' | 'profile_update']
    }));
  }, []);
  
  // Load activities on mount
  useEffect(() => {
    if (isFirebaseConfigured()) {
      loadActivities(false, false);
    }
  }, []);
  
  // Reload activities when filters or sort changes
  useEffect(() => {
    if (activities.length > 0) { // Only reload if we have activities (not initial load)
      loadActivities(false, false);
    }
  }, [filters, sortBy]);
  
  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
  
  // Error state
  if (error) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-muted-foreground mb-4">
          <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {language === 'tr' ? 'Tekrar Dene' : 'Try Again'}
        </Button>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'tr' ? 'Aktivite ara...' : 'Search activities...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Type Filter */}
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {/* Sort Options */}
            <Select value={sortBy} onValueChange={(value: 'recent' | 'popular') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  {language === 'tr' ? 'En Yeni' : 'Recent'}
                </SelectItem>
                <SelectItem value="popular">
                  {language === 'tr' ? 'Popüler' : 'Popular'}
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Refresh Button */}
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>
      )}
      
      {/* Activity List */}
      {loading ? (
        renderSkeleton()
      ) : filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            {language === 'tr' ? 'Henüz aktivite yok' : 'No activities yet'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'tr' 
              ? 'Aktiviteler burada görünecek' 
              : 'Activities will appear here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              compact={compact}
              showUserInfo={!userId}
              showTimestamp={true}
              interactive={true}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button 
                onClick={loadMore} 
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    {language === 'tr' ? 'Daha Fazla Yükle' : 'Load More'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 