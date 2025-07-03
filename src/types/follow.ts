import { Timestamp } from 'firebase/firestore';

// Follow ilişkisi için temel interface
export interface Follow {
  id: string;
  followerId: string;  // Takip eden kullanıcının ID'si
  followingId: string; // Takip edilen kullanıcının ID'si
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Follow istatistikleri için interface
export interface FollowStats {
  userId: string;
  followersCount: number;  // Takipçi sayısı
  followingCount: number;  // Takip edilen sayısı
  updatedAt: Timestamp;
}

// Follow durumu için interface
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  mutualFollow: boolean;
}

// Follow işlemleri için request interface
export interface FollowRequest {
  followerId: string;
  followingId: string;
}

// Follow listesi için user bilgileri
export interface FollowUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  followedAt?: Timestamp;
  followersCount?: number;
  followingCount?: number;
}

// Follow listesi filtreleme seçenekleri
export interface FollowListFilters {
  sortBy?: 'recent' | 'alphabetical' | 'popular';
  limit?: number;
  startAfter?: unknown;
}

// Follow aktivite türleri
export type FollowActivityType = 'follow' | 'unfollow';

// Follow aktivitesi interface
export interface FollowActivity {
  id: string;
  type: FollowActivityType;
  followerId: string;
  followingId: string;
  followerName: string;
  followingName: string;
  createdAt: Timestamp;
}

// Follow notification interface
export interface FollowNotification {
  id: string;
  type: 'new_follower' | 'follow_back';
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  read: boolean;
  createdAt: Timestamp;
}

export default Follow; 