'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Activity, ActivityItemProps } from '@/types/activity';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  UserPlus, 
  Globe, 
  Bookmark,
  User,
  ExternalLink,
  Clock,
  ChevronRight
} from 'lucide-react';

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  compact = false,
  showUserInfo = true,
  showTimestamp = true,
  interactive = false,
  onClick,
  className = ''
}) => {
  const { language } = useLanguage();
  
  // Get activity icon and color
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'website_submit':
        return { icon: Globe, color: 'text-gray-700' };
      case 'website_like':
        return { icon: Heart, color: 'text-gray-600' };
      case 'website_comment':
        return { icon: MessageCircle, color: 'text-gray-700' };
      case 'website_rating':
        return { icon: Star, color: 'text-gray-600' };
      case 'user_follow':
        return { icon: UserPlus, color: 'text-gray-700' };
      case 'bookmark_create':
        return { icon: Bookmark, color: 'text-gray-600' };
      case 'profile_update':
        return { icon: User, color: 'text-gray-700' };
      default:
        return { icon: Globe, color: 'text-gray-500' };
    }
  };
  
  // Get activity text
  const getActivityText = (activity: Activity) => {
    const { type } = activity;
    
    if (language === 'tr') {
      switch (type) {
        case 'website_submit':
          return `${activity.websiteTitle} adlı website'i gönderdi`;
        case 'website_like':
          return `${activity.websiteTitle} adlı website'i beğendi`;
        case 'website_comment':
          return `${activity.websiteTitle} adlı website'e yorum yaptı`;
        case 'website_rating':
          return `${activity.websiteTitle} adlı website'i ${activity.rating} yıldızla değerlendirdi`;
        case 'user_follow':
          return `${activity.targetUserDisplayName} kullanıcısını takip etmeye başladı`;
        case 'bookmark_create':
          return `${activity.websiteTitle} adlı website'i ${activity.bookmarkCollectionName} koleksiyonuna ekledi`;
        case 'profile_update':
          return 'profilini güncelledi';
        default:
          return 'bir aktivite gerçekleştirdi';
      }
    } else {
      switch (type) {
        case 'website_submit':
          return `submitted ${activity.websiteTitle}`;
        case 'website_like':
          return `liked ${activity.websiteTitle}`;
        case 'website_comment':
          return `commented on ${activity.websiteTitle}`;
        case 'website_rating':
          return `rated ${activity.websiteTitle} with ${activity.rating} stars`;
        case 'user_follow':
          return `started following ${activity.targetUserDisplayName}`;
        case 'bookmark_create':
          return `bookmarked ${activity.websiteTitle} to ${activity.bookmarkCollectionName}`;
        case 'profile_update':
          return 'updated their profile';
        default:
          return 'performed an activity';
      }
    }
  };
  
  // Get activity badge
  const getActivityBadge = (type: string) => {
    const badges = {
      website_submit: { label: language === 'tr' ? 'Gönderim' : 'Submission', variant: 'default' as const },
      website_like: { label: language === 'tr' ? 'Beğeni' : 'Like', variant: 'secondary' as const },
      website_comment: { label: language === 'tr' ? 'Yorum' : 'Comment', variant: 'outline' as const },
      website_rating: { label: language === 'tr' ? 'Değerlendirme' : 'Rating', variant: 'default' as const },
      user_follow: { label: language === 'tr' ? 'Takip' : 'Follow', variant: 'secondary' as const },
      bookmark_create: { label: language === 'tr' ? 'Bookmark' : 'Bookmark', variant: 'outline' as const },
      profile_update: { label: language === 'tr' ? 'Profil' : 'Profile', variant: 'default' as const }
    };
    
    return badges[type as keyof typeof badges] || { label: type, variant: 'default' as const };
  };
  
  const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
  const activityText = getActivityText(activity);
  const badge = getActivityBadge(activity.type);
  
  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };
  
  // Render user info
  const renderUserInfo = () => (
    <div className="flex items-center space-x-2">
      <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
        <AvatarImage src={activity.userPhotoURL} alt={activity.userDisplayName} />
        <AvatarFallback>
          {activity.userDisplayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Link 
            href={`/profile/${activity.userId}`}
            className="font-medium text-sm hover:underline truncate"
          >
            {activity.userDisplayName}
          </Link>
          {!compact && (
            <Badge variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
        <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} truncate`}>
          {activityText}
        </p>
      </div>
    </div>
  );
  
  // Render activity content
  const renderContent = () => {
    if (activity.type.startsWith('website_') && activity.websiteId) {
      return (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            {activity.websiteImageUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={activity.websiteImageUrl} 
                  alt={activity.websiteTitle}
                  className="w-12 h-12 rounded object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Link 
                  href={`/website/${activity.websiteId}`}
                  className="font-medium text-sm hover:underline truncate"
                >
                  {activity.websiteTitle}
                </Link>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
              {activity.commentText && (
                                 <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                   &ldquo;{activity.commentText}&rdquo;
                 </p>
              )}
              {activity.rating && (
                <div className="flex items-center space-x-1 mt-1">
                  {Array.from({ length: activity.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {activity.rating}/5
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (activity.type === 'user_follow' && activity.targetUserId) {
      return (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.targetUserPhotoURL} alt={activity.targetUserDisplayName} />
              <AvatarFallback>
                {activity.targetUserDisplayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link 
                href={`/profile/${activity.targetUserId}`}
                className="font-medium text-sm hover:underline"
              >
                {activity.targetUserDisplayName}
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Render timestamp
  const renderTimestamp = () => {
    if (!showTimestamp) return null;
    
    return (
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {formatDistanceToNow(activity.createdAt.toDate(), { 
            addSuffix: true, 
            locale: language === 'tr' ? tr : enUS 
          })}
        </span>
      </div>
    );
  };
  
  const content = (
    <div className={`${compact ? 'p-3' : 'p-4'} ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Activity Icon */}
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-full bg-muted ${color}`}>
            <ActivityIcon className="h-4 w-4" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {showUserInfo && renderUserInfo()}
          {renderContent()}
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            {renderTimestamp()}
            {interactive && (
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  if (interactive) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        {content}
      </Card>
    );
  }
  
  return (
    <Card>
      {content}
    </Card>
  );
};

export default ActivityItem; 