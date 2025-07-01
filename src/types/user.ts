export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isPremium: boolean;
  role: 'user' | 'moderator' | 'admin';
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