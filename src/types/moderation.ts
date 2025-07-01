import { Timestamp } from 'firebase/firestore';
import { Website } from './website';
import { User } from './user';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  targetType: 'website' | 'user' | 'comment';
  targetId: string;
  targetTitle?: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewerNotes?: string;
  actions?: ModerationAction[];
}

export type ReportReason = 
  | 'spam'
  | 'inappropriate_content'
  | 'copyright_violation'
  | 'false_information'
  | 'harassment'
  | 'offensive_language'
  | 'malicious_website'
  | 'duplicate_content'
  | 'other';

export interface ModerationAction {
  id: string;
  type: 'warning' | 'temporary_block' | 'permanent_block' | 'content_removal' | 'account_suspension';
  targetUserId: string;
  targetType: 'user' | 'website' | 'comment';
  targetId: string;
  reason: string;
  moderatorId: string;
  moderatorName: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  metadata?: {
    originalContent?: string;
    evidence?: string[];
    relatedReports?: string[];
  };
}

export interface SpamDetectionResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  flags: SpamFlag[];
}

export interface SpamFlag {
  type: 'repeated_content' | 'suspicious_links' | 'keyword_spam' | 'rapid_posting' | 'fake_data';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  totalActions: number;
  activeBlocks: number;
  spamDetected: number;
  reportsByReason: Record<ReportReason, number>;
  actionsByType: Record<string, number>;
}

export interface AdminDashboardData {
  stats: ModerationStats;
  recentReports: Report[];
  recentActions: ModerationAction[];
  pendingWebsites: Website[];
  flaggedUsers: User[];
} 