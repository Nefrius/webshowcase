export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isPremium: boolean;
  role: 'user' | 'moderator' | 'admin';
  badge?: UserBadge;
  createdAt: Date;
  lastLoginAt: Date;
  // Profile fields
  bio?: string;
  website?: string;
  location?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  // Moderation fields
  isBlocked?: boolean;
  blockReason?: string;
  warningCount?: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Badge system types
export interface UserBadge {
  id: string;
  name: string;
  displayName: string;
  color: string;
  bgColor: string;
  icon?: string;
  description?: string;
  isDefault?: boolean;
  priority: number; // Higher priority badges show first
}

export interface BadgeAssignment {
  userId: string;
  badgeId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface CreateBadgeData {
  name: string;
  displayName: string;
  color: string;
  bgColor: string;
  icon?: string;
  description?: string;
  isDefault?: boolean;
  priority: number;
}

// Admin user management
export interface AdminUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isPremium?: boolean;
  role: 'user' | 'moderator' | 'admin';
  badge?: UserBadge;
  isBlocked?: boolean;
  blockReason?: string;
  createdAt: Date;
  lastLoginAt: Date;
  websiteCount?: number;
  followerCount?: number;
  followingCount?: number;
}

export interface BanUserData {
  reason: string;
  duration?: number; // days, undefined for permanent
  note?: string;
}

export interface UpdateUserData {
  displayName?: string;
  isPremium?: boolean;
  role?: 'user' | 'moderator' | 'admin';
  badge?: UserBadge;
  isBlocked?: boolean;
  blockReason?: string;
}

// System announcement
export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  targetRole?: 'user' | 'moderator' | 'admin' | 'all';
} 