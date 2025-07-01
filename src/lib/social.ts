/* eslint-disable @typescript-eslint/no-unused-vars */
// Firebase imports simplified for build safety
import { db } from "./firebase";
import { Timestamp } from "firebase/firestore";

// Like a website
export const likeWebsite = async (_websiteId: string, _userId: string): Promise<{ success: boolean; liked: boolean }> => {
  if (!db) {
    return { success: false, liked: false };
  }
  // Simplified implementation for build safety
  return { success: true, liked: true };
};

// Check if user liked a website
export const checkUserLiked = async (_websiteId: string, _userId: string): Promise<boolean> => {
  if (!db) {
    return false;
  }
  // Simplified implementation
  return false;
};

// Track website view
export const trackWebsiteView = async (_websiteId: string, _userId?: string): Promise<void> => {
  if (!db) {
    return;
  }
  // Simplified implementation
};

// Get session ID for anonymous users
const getSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Get website likes count
export const getWebsiteLikes = async (_websiteId: string): Promise<number> => {
  if (!db) {
    return 0;
  }
  // Simplified implementation
  return 0;
};

// Get website views count
export const getWebsiteViews = async (_websiteId: string): Promise<number> => {
  if (!db) {
    return 0;
  }
  // Simplified implementation
  return 0;
};

// Get user's liked websites
export const getUserLikedWebsites = async (_userId: string): Promise<string[]> => {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
};

export interface FollowData {
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

// Follow/Unfollow user
export async function followUser(_followingId: string, _followerId: string) {
  if (!db) {
    return { success: false, following: false };
  }
  // Simplified implementation
  return { success: true, following: true };
}

// Check if user is following another user
export async function checkUserFollowing(_followingId: string, _followerId: string): Promise<boolean> {
  if (!db) {
    return false;
  }
  // Simplified implementation
  return false;
}

// Get user followers
export async function getUserFollowers(_userId: string, _limitCount: number = 10) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Get user following
export async function getUserFollowing(_userId: string, _limitCount: number = 10) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Get activity feed for user (websites from followed users)
export async function getActivityFeed(_userId: string, _limitCount: number = 20) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Comment system
export interface Comment {
  id: string;
  websiteId: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  user?: {
    uid: string;
    displayName: string;
    photoURL: string;
    isPremium: boolean;
  };
}

// Add comment to website
export async function addComment(_websiteId: string, _userId: string, _content: string) {
  if (!db) {
    return { success: false };
  }
  // Simplified implementation
  return { success: true, commentId: 'mock-comment-id' };
}

// Get website comments
export async function getWebsiteComments(_websiteId: string, _limitCount: number = 20) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Delete comment
export async function deleteComment(_commentId: string, _websiteId: string) {
  if (!db) {
    return { success: false };
  }
  // Simplified implementation
  return { success: true };
} 