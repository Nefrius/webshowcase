// Firebase imports for real implementation
import { db } from "./firebase";
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  increment,
  Timestamp
} from "firebase/firestore";
import { createNotification } from './notifications';
import { NotificationType } from '@/types/notification';

// Like a website
export const likeWebsite = async (websiteId: string, userId: string): Promise<{ success: boolean; liked: boolean }> => {
  try {
    if (!db) {
      return { success: false, liked: false };
    }

    // Check if already liked
    const likesQuery = query(
      collection(db, 'likes'),
      where('websiteId', '==', websiteId),
      where('userId', '==', userId)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    const batch = writeBatch(db);
    
    if (likesSnapshot.empty) {
      // Add like
      const likeRef = doc(collection(db, 'likes'));
      batch.set(likeRef, {
        websiteId,
        userId,
        createdAt: serverTimestamp()
      });
      
      // Increment website likes count
      const websiteRef = doc(db, 'websites', websiteId);
      batch.update(websiteRef, {
        likes: increment(1)
      });
      
      await batch.commit();
      
      // Bildirim oluştur (beğeni bildirimi)
      try {
        // Website sahibine bildirim gönder
        const websiteDoc = await getDoc(doc(db, 'websites', websiteId));
        if (websiteDoc.exists()) {
          const websiteData = websiteDoc.data();
          const websiteOwnerId = websiteData.ownerId;
          const websiteTitle = websiteData.title;
          
          // Kendi website'ini beğenme durumunda bildirim gönderme
          if (websiteOwnerId !== userId) {
            await createNotification({
              type: NotificationType.LIKE,
              title: 'Yeni Beğeni',
              message: `"${websiteTitle}" projeniz beğenildi`,
              recipientId: websiteOwnerId,
              senderId: userId,
              websiteId: websiteId,
              websiteTitle: websiteTitle,
              websiteImageUrl: websiteData.imageUrl
            });
          }
        }
      } catch (error) {
        console.warn('Failed to create like notification:', error);
      }
      
      return { success: true, liked: true };
    } else {
      // Remove like
      const likeDoc = likesSnapshot.docs[0];
      batch.delete(likeDoc.ref);
      
      // Decrement website likes count
      const websiteRef = doc(db, 'websites', websiteId);
      batch.update(websiteRef, {
        likes: increment(-1)
      });
      
      await batch.commit();
      return { success: true, liked: false };
    }
  } catch (error) {
    console.error('Error liking website:', error);
    return { success: false, liked: false };
  }
};

// Check if user liked a website
export const checkUserLiked = async (websiteId: string, userId: string): Promise<boolean> => {
  try {
    if (!db) {
      return false;
    }

    const likesQuery = query(
      collection(db, 'likes'),
      where('websiteId', '==', websiteId),
      where('userId', '==', userId)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    return !likesSnapshot.empty;
  } catch (error) {
    console.error('Error checking user liked:', error);
    return false;
  }
};

// Track website view
export const trackWebsiteView = async (websiteId: string, userId?: string): Promise<void> => {
  try {
    if (!db) {
      return;
    }

    const viewerId = userId || getSessionId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if view already exists today (prevent spam)
    const viewsQuery = query(
      collection(db, 'views'),
      where('websiteId', '==', websiteId),
      where('viewerId', '==', viewerId),
      where('date', '==', today.toISOString().split('T')[0])
    );
    
    const viewsSnapshot = await getDocs(viewsQuery);
    
    if (viewsSnapshot.empty) {
      const batch = writeBatch(db);
      
      // Add view record
      const viewRef = doc(collection(db, 'views'));
      batch.set(viewRef, {
        websiteId,
        viewerId,
        userId: userId || null,
        date: today.toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      
      // Increment website views count
      const websiteRef = doc(db, 'websites', websiteId);
      batch.update(websiteRef, {
        views: increment(1)
      });
      
      await batch.commit();
    }
  } catch (error) {
    console.error('Error tracking website view:', error);
  }
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
export const getWebsiteLikes = async (websiteId: string): Promise<number> => {
  try {
    if (!db) {
      return 0;
    }
    
    const likesQuery = query(
      collection(db, 'likes'),
      where('websiteId', '==', websiteId)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.size;
  } catch (error) {
    console.error('Error getting website likes:', error);
    return 0;
  }
};

// Get website views count
export const getWebsiteViews = async (websiteId: string): Promise<number> => {
  try {
    if (!db) {
      return 0;
    }
    
    const viewsQuery = query(
      collection(db, 'views'),
      where('websiteId', '==', websiteId)
    );
    
    const viewsSnapshot = await getDocs(viewsQuery);
    return viewsSnapshot.size;
  } catch (error) {
    console.error('Error getting website views:', error);
    return 0;
  }
};

// Get user's liked websites
export const getUserLikedWebsites = async (userId: string): Promise<string[]> => {
  try {
    if (!db) {
      return [];
    }
    
    const likesQuery = query(
      collection(db, 'likes'),
      where('userId', '==', userId)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.docs.map(doc => doc.data().websiteId);
  } catch (error) {
    console.error('Error getting user liked websites:', error);
    return [];
  }
};

export interface FollowData {
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

// Follow/Unfollow user
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function followUser(_followingId: string, _followerId: string) {
  if (!db) {
    return { success: false, following: false };
  }
  // Simplified implementation
  return { success: true, following: true };
}

// Check if user is following another user
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkUserFollowing(_followingId: string, _followerId: string): Promise<boolean> {
  if (!db) {
    return false;
  }
  // Simplified implementation
  return false;
}

// Get user followers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserFollowers(_userId: string, _limitCount: number = 10) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Get user following
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserFollowing(_userId: string, _limitCount: number = 10) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Get activity feed for user (websites from followed users)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addComment(_websiteId: string, _userId: string, _content: string) {
  if (!db) {
    return { success: false };
  }
  // Simplified implementation
  return { success: true, commentId: 'mock-comment-id' };
}

// Get website comments
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getWebsiteComments(_websiteId: string, _limitCount: number = 20) {
  if (!db) {
    return [];
  }
  // Simplified implementation
  return [];
}

// Delete comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteComment(_commentId: string, _websiteId: string) {
  if (!db) {
    return { success: false };
  }
  // Simplified implementation
  return { success: true };
}

// SYNC FUNCTIONS - Fix data inconsistencies

// Sync all website counts with real data
export async function syncAllWebsiteCounts(): Promise<{ success: boolean; processed: number; errors: string[] }> {
  try {
    if (!db) {
      return { success: false, processed: 0, errors: ['Firebase not initialized'] };
    }

    console.log('🔄 Starting website counts synchronization...');
    
    // Get all websites
    const websitesSnapshot = await getDocs(collection(db, 'websites'));
    const batch = writeBatch(db);
    const errors: string[] = [];
    let processed = 0;

    for (const websiteDoc of websitesSnapshot.docs) {
      try {
        const websiteId = websiteDoc.id;
        
        // Get real counts
        const [realLikes, realViews] = await Promise.all([
          getWebsiteLikes(websiteId),
          getWebsiteViews(websiteId)
        ]);

        // Update website document
        batch.update(websiteDoc.ref, {
          likes: realLikes,
          views: realViews
        });

        processed++;
        console.log(`✅ ${websiteDoc.data().title}: ${realViews} views, ${realLikes} likes`);
      } catch (error) {
        const errorMsg = `Error syncing website ${websiteDoc.id}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    await batch.commit();
    
    console.log(`🎯 Synchronization complete! Processed ${processed} websites.`);
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} errors occurred:`, errors);
    }

    return { success: true, processed, errors };
  } catch (error) {
    console.error('Error syncing website counts:', error);
    return { success: false, processed: 0, errors: [error as string] };
  }
}

// Sync single website counts
export async function syncWebsiteCounts(websiteId: string): Promise<{ success: boolean; likes: number; views: number }> {
  try {
    if (!db) {
      return { success: false, likes: 0, views: 0 };
    }

    // Get real counts
    const [realLikes, realViews] = await Promise.all([
      getWebsiteLikes(websiteId),
      getWebsiteViews(websiteId)
    ]);

    // Update website document
    const websiteRef = doc(db, 'websites', websiteId);
    await writeBatch(db).update(websiteRef, {
      likes: realLikes,
      views: realViews
    }).commit();

    console.log(`✅ Synced website ${websiteId}: ${realViews} views, ${realLikes} likes`);
    
    return { success: true, likes: realLikes, views: realViews };
  } catch (error) {
    console.error('Error syncing website counts:', error);
    return { success: false, likes: 0, views: 0 };
  }
} 