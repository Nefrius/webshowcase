// Comment System
export interface Comment {
  id: string;
  websiteId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  likedBy: string[]; // User IDs
  replies?: Comment[];
  parentCommentId?: string;
  isEdited: boolean;
  isDeleted: boolean;
}

// Follow System
export interface Follow {
  id: string;
  followerId: string; // Person who follows
  followingId: string; // Person being followed
  createdAt: Date;
}

// Like System
export interface Like {
  id: string;
  userId: string;
  websiteId?: string;
  commentId?: string;
  type: 'website' | 'comment';
  createdAt: Date;
}

// Notification System
export enum NotificationType {
  NEW_FOLLOWER = 'new_follower',
  WEBSITE_LIKED = 'website_liked',
  WEBSITE_COMMENT = 'website_comment',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_LIKED = 'comment_liked',
  WEBSITE_FEATURED = 'website_featured',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: {
    triggeredBy?: string; // User ID who triggered the notification
    triggeredByName?: string;
    triggeredByPhoto?: string;
    websiteId?: string;
    websiteTitle?: string;
    commentId?: string;
  };
}

// User Badge System
export enum BadgeType {
  EARLY_ADOPTER = 'early_adopter',
  POPULAR_CREATOR = 'popular_creator',
  TECH_ENTHUSIAST = 'tech_enthusiast',
  DESIGN_GURU = 'design_guru',
  COMMUNITY_SUPPORTER = 'community_supporter',
  VERIFIED_DEVELOPER = 'verified_developer',
  PREMIUM_MEMBER = 'premium_member'
}

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy: string[]; // User IDs
}

// Achievement System
export interface Achievement {
  id: string;
  userId: string;
  badgeType: BadgeType;
  unlockedAt: Date;
  progress?: number; // 0-100
  isVisible: boolean;
}

// Social Stats Interface
export interface SocialStats {
  userId: string;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  totalComments: number;
  websitesShared: number;
  badgesCount: number;
  popularityScore: number;
  engagementRate: number;
  lastActivity: Date;
} 