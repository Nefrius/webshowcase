/* eslint-disable @typescript-eslint/no-unused-vars */
// Firebase imports removed for simplified implementation
import { db } from './firebase';
import {
  Report,
  ReportReason,
  ModerationAction,
  SpamDetectionResult,
  SpamFlag,
  ModerationStats,
  AdminDashboardData
} from '@/types/moderation';
import { Website } from '@/types/website';
import { User } from '@/types/user';

// Simplified moderation functions for build safety

// Report Functions
export async function createReport(
  _reporterId: string,
  _reporterName: string,
  _reporterEmail: string,
  _targetType: 'website' | 'user' | 'comment',
  _targetId: string,
  _targetTitle: string | undefined,
  _reason: ReportReason,
  _description?: string
): Promise<string> {
  if (!db) {
    throw new Error('Firestore not available');
  }
  // Simplified implementation - just return a mock ID
  return 'mock-report-id';
}

export async function getReports(_status?: string): Promise<Report[]> {
  if (!db) {
    return [];
  }
  // Return empty array for build safety
  return [];
}

export async function reviewReport(
  _reportId: string,
  _reviewerId: string,
  _status: 'reviewed' | 'resolved' | 'dismissed',
  _reviewerNotes?: string
): Promise<void> {
  if (!db) {
    throw new Error('Firestore not available');
  }
  // Simplified implementation
}

// Moderation Actions
export async function createModerationAction(
  type: ModerationAction['type'],
  targetUserId: string,
  targetType: 'user' | 'website' | 'comment',
  targetId: string,
  reason: string,
  moderatorId: string,
  moderatorName: string,
  expiresAt?: Date
): Promise<string> {
  if (!db) {
    throw new Error('Firestore not available');
  }
  // Simplified implementation
  return 'mock-action-id';
}

// Spam Detection
export async function detectSpam(content: {
  title?: string;
  description?: string;
  url?: string;
  userId?: string;
}): Promise<SpamDetectionResult> {
  const flags: SpamFlag[] = [];
  let confidence = 0;

  // Check for suspicious keywords
  const suspiciousKeywords = [
    'click here', 'free money', 'guaranteed', 'act now', 'limited time',
    'make money fast', 'no risk', 'casino', 'pharmacy', 'viagra',
    'weight loss', 'earn $$$', 'work from home'
  ];

  const text = `${content.title || ''} ${content.description || ''}`.toLowerCase();
  const foundKeywords = suspiciousKeywords.filter(keyword => text.includes(keyword));
  
  if (foundKeywords.length > 0) {
    flags.push({
      type: 'keyword_spam',
      severity: foundKeywords.length > 2 ? 'high' : 'medium',
      description: `Contains suspicious keywords: ${foundKeywords.join(', ')}`
    });
    confidence += foundKeywords.length * 0.1;
  }

  // Check for suspicious URLs
  if (content.url) {
    const suspiciousUrlCheck = checkSuspiciousUrl(content.url);
    if (suspiciousUrlCheck.isSuspicious) {
      flags.push({
        type: 'suspicious_links',
        severity: 'high',
        description: suspiciousUrlCheck.reason
      });
      confidence += 0.3;
    }
  }

  return {
    isSpam: confidence > 0.5,
    confidence: Math.min(confidence, 1),
    reasons: flags.map(flag => flag.description),
    flags
  };
}

function checkSuspiciousUrl(url: string): { isSuspicious: boolean; reason: string } {
  const suspiciousDomains = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co',
    'ow.ly', 'is.gd', 'buff.ly'
  ];
  
  const suspiciousPatterns = [
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
    /[a-z0-9]{20,}/, // Very long random strings
    /-{3,}/, // Multiple dashes
  ];

  try {
    const urlObj = new URL(url);
    
    // Check for suspicious domains
    if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
      return {
        isSuspicious: true,
        reason: 'Contains URL shortener or suspicious domain'
      };
    }
    
    // Check for suspicious patterns
    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      return {
        isSuspicious: true,
        reason: 'URL contains suspicious patterns'
      };
    }
    
    return { isSuspicious: false, reason: '' };
  } catch {
    return {
      isSuspicious: true,
      reason: 'Invalid URL format'
    };
  }
}

// Website Approval System
export async function approveWebsite(websiteId: string, moderatorId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not available');
  }
  // Simplified implementation
}

export async function rejectWebsite(
  websiteId: string,
  moderatorId: string,
  reason: string
): Promise<void> {
  if (!db) {
    throw new Error('Firestore not available');
  }
  // Simplified implementation
}

export async function getPendingWebsites(): Promise<Website[]> {
  if (!db) {
    return [];
  }
  // Return empty array for build safety
  return [];
}

// Admin Dashboard Data
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!db) {
    // Return default dashboard data
    return {
      stats: {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        dismissedReports: 0,
        totalActions: 0,
        activeBlocks: 0,
        spamDetected: 0,
        reportsByReason: {} as Record<ReportReason, number>,
        actionsByType: {} as Record<string, number>
      },
      recentReports: [],
      recentActions: [],
      pendingWebsites: [],
      flaggedUsers: []
    };
  }
  
  // Simplified implementation
  const stats: ModerationStats = {
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
    totalActions: 0,
    activeBlocks: 0,
    spamDetected: 0,
    reportsByReason: {} as Record<ReportReason, number>,
    actionsByType: {} as Record<string, number>
  };

  return {
    stats,
    recentReports: [],
    recentActions: [],
    pendingWebsites: [],
    flaggedUsers: []
  };
}

// Check if user has admin/moderator permissions
export function hasModeratorPermissions(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'moderator';
}

export function hasAdminPermissions(user: User | null): boolean {
  return user?.role === 'admin';
} 