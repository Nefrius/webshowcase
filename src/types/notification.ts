import { Timestamp } from 'firebase/firestore';

// Bildirim türleri
export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  WEBSITE = 'website',
  SYSTEM = 'system',
  RATING = 'rating'
}

// Ana bildirim interface'i
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  websiteId?: string;
  websiteTitle?: string;
  websiteImageUrl?: string;
  commentId?: string;
  ratingId?: string;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, string | number | boolean>;
}

// Bildirim oluşturma için data
export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  websiteId?: string;
  websiteTitle?: string;
  websiteImageUrl?: string;
  commentId?: string;
  ratingId?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Bildirim filtreleme
export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  senderId?: string;
  websiteId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  sortBy?: 'newest' | 'oldest';
  startAfter?: string;
}

// Bildirim listesi response
export interface NotificationListResponse {
  notifications: Notification[];
  hasMore: boolean;
  lastDoc?: unknown;
  total: number;
}

// Bildirim istatistikleri
export interface NotificationStats {
  total: number;
  totalCount: number;
  unread: number;
  unreadCount: number;
  byType: Record<NotificationType, number>;
  typeBreakdown: Record<NotificationType, number>;
  todayCount: number;
  thisWeekCount: number;
}

// Bildirim ayarları
export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  websiteNotifications: boolean;
  systemNotifications: boolean;
  ratingNotifications: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Bildirim ayarları güncelleme
export interface UpdateNotificationSettingsData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  followNotifications?: boolean;
  likeNotifications?: boolean;
  commentNotifications?: boolean;
  websiteNotifications?: boolean;
  systemNotifications?: boolean;
  ratingNotifications?: boolean;
}

// Bildirim tetikleme data
export interface NotificationTriggerData {
  type: NotificationType;
  recipientId: string;
  senderId?: string;
  websiteId?: string;
  commentId?: string;
  ratingId?: string;
  customTitle?: string;
  customMessage?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Bildirim durumu
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// Bildirim kanalı
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms'
}

// Bildirim önceliği
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Bildirim grubu (aynı türdeki bildirimleri gruplamak için)
export interface NotificationGroup {
  type: NotificationType;
  count: number;
  latestNotification: Notification;
  notifications: Notification[];
  isRead: boolean;
  createdAt: Timestamp;
}

// Bildirim tercih seçenekleri
export interface NotificationPreference {
  type: NotificationType;
  label: string;
  description: string;
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

// Real-time bildirim dinleyici
export interface NotificationListener {
  unsubscribe: () => void;
  onNotification: (notification: Notification) => void;
  onError: (error: Error) => void;
}

// Bildirim durumu
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastVisible?: Timestamp;
}

// Bildirim eylemi
export interface NotificationAction {
  type: 'LOAD_NOTIFICATIONS' | 'ADD_NOTIFICATION' | 'MARK_AS_READ' | 'MARK_ALL_AS_READ' | 'DELETE_NOTIFICATION' | 'SET_LOADING' | 'SET_ERROR';
  payload?: unknown;
} 