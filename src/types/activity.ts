import { Timestamp } from 'firebase/firestore';

// Activity Types
export type ActivityType = 
  | 'website_submit'      // Website gönderme
  | 'website_like'        // Website beğenme
  | 'website_comment'     // Website yorumlama
  | 'website_rating'      // Website değerlendirme
  | 'user_follow'         // Kullanıcı takip etme
  | 'user_register'       // Kullanıcı kaydı
  | 'bookmark_create'     // Bookmark oluşturma
  | 'profile_update';     // Profil güncelleme

// Base Activity Interface
export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  createdAt: Timestamp;
  
  // Activity-specific data
  websiteId?: string;
  websiteTitle?: string;
  websiteImageUrl?: string;
  
  targetUserId?: string;
  targetUserDisplayName?: string;
  targetUserPhotoURL?: string;
  
  commentText?: string;
  rating?: number;
  bookmarkCollectionName?: string;
  
  // Metadata
  isPublic: boolean;
  metadata?: Record<string, unknown>;
}

// Activity Feed Filters
export interface ActivityFilters {
  userId?: string;
  followingOnly?: boolean;
  activityTypes?: ActivityType[];
  startAfter?: Timestamp;
  limit?: number;
  sortBy?: 'recent' | 'popular';
}

// Activity Stats
export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  weeklyActivities: number;
  monthlyActivities: number;
  lastActivityAt?: Timestamp;
}

// Activity Aggregation
export interface ActivityAggregation {
  date: string; // YYYY-MM-DD format
  activities: Activity[];
  count: number;
}

// Activity Feed Response
export interface ActivityFeedResponse {
  activities: Activity[];
  hasMore: boolean;
  lastActivity?: Activity;
  totalCount: number;
}

// Activity Creation Data
export interface CreateActivityData {
  type: ActivityType;
  userId: string;
  websiteId?: string;
  websiteTitle?: string;
  websiteImageUrl?: string;
  targetUserId?: string;
  targetUserDisplayName?: string;
  targetUserPhotoURL?: string;
  commentText?: string;
  rating?: number;
  bookmarkCollectionName?: string;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
}

// Activity Display Props
export interface ActivityDisplayProps {
  activity: Activity;
  showUserInfo?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
  interactive?: boolean;
}

// Activity Feed Props
export interface ActivityFeedProps {
  userId?: string;
  followingOnly?: boolean;
  activityTypes?: ActivityType[];
  limit?: number;
  compact?: boolean;
  showFilters?: boolean;
  className?: string;
}

// Activity Item Props
export interface ActivityItemProps {
  activity: Activity;
  compact?: boolean;
  showUserInfo?: boolean;
  showTimestamp?: boolean;
  interactive?: boolean;
  onClick?: (activity: Activity) => void;
  className?: string;
}

// Activity Notification
export interface ActivityNotification {
  id: string;
  activityId: string;
  userId: string;
  type: ActivityType;
  isRead: boolean;
  createdAt: Timestamp;
  title: string;
  message: string;
  actionUrl?: string;
} 