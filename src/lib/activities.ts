import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  deleteDoc,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

// Helper function to get Firebase db with null check
function getFirebaseDb() {
  if (!db) {
    throw new Error('Firebase not configured');
  }
  return db;
}
import { 
  Activity, 
  CreateActivityData, 
  ActivityFilters, 
  ActivityFeedResponse,
  ActivityStats
} from '@/types/activity';

// Collections
const ACTIVITIES_COLLECTION = 'activities';
const ACTIVITY_STATS_COLLECTION = 'activityStats';

// Create Activity
export async function createActivity(data: CreateActivityData): Promise<string> {
  try {
    const db = getFirebaseDb();
    
    // Get user info
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Create activity object
    const activity: Omit<Activity, 'id'> = {
      type: data.type,
      userId: data.userId,
      userDisplayName: userData.displayName || 'Unknown User',
      userPhotoURL: userData.photoURL,
      createdAt: Timestamp.now(),
      isPublic: data.isPublic ?? true,
      
      // Optional fields
      websiteId: data.websiteId,
      websiteTitle: data.websiteTitle,
      websiteImageUrl: data.websiteImageUrl,
      targetUserId: data.targetUserId,
      targetUserDisplayName: data.targetUserDisplayName,
      targetUserPhotoURL: data.targetUserPhotoURL,
      commentText: data.commentText,
      rating: data.rating,
      bookmarkCollectionName: data.bookmarkCollectionName,
      metadata: data.metadata
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), activity);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

// Get Activity Feed
export async function getActivityFeed(filters: ActivityFilters = {}): Promise<ActivityFeedResponse> {
  try {
    const db = getFirebaseDb();
    const {
      userId,
      activityTypes,
      startAfter: startAfterTimestamp,
      limit: limitCount = 20,
      sortBy = 'recent'
    } = filters;
    
    const constraints: QueryConstraint[] = [];
    
    // Filter by user
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    // Filter by activity types
    if (activityTypes && activityTypes.length > 0) {
      constraints.push(where('type', 'in', activityTypes));
    }
    
    // Only public activities
    constraints.push(where('isPublic', '==', true));
    
    // Ordering
    if (sortBy === 'recent') {
      constraints.push(orderBy('createdAt', 'desc'));
    }
    
    // Pagination
    if (startAfterTimestamp) {
      constraints.push(startAfter(startAfterTimestamp));
    }
    
    // Limit
    constraints.push(limit(limitCount + 1)); // +1 to check if there are more
    
    const q = query(collection(db, ACTIVITIES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const activities: Activity[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as Activity);
    });
    
    // Check if there are more activities
    const hasMore = activities.length > limitCount;
    if (hasMore) {
      activities.pop(); // Remove the extra item
    }
    
    return {
      activities,
      hasMore,
      lastActivity: activities[activities.length - 1],
      totalCount: activities.length
    };
  } catch (error) {
    console.error('Error getting activity feed:', error);
    throw error;
  }
}

// Get Activity by ID
export async function getActivity(activityId: string): Promise<Activity | null> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Activity;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting activity:', error);
    throw error;
  }
}

// Delete Activity
export async function deleteActivity(activityId: string, userId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    const activityDoc = await getDoc(activityRef);
    
    if (!activityDoc.exists()) {
      throw new Error('Activity not found');
    }
    
    const activityData = activityDoc.data();
    
    // Check if user owns the activity
    if (activityData.userId !== userId) {
      throw new Error('Not authorized to delete this activity');
    }
    
    await deleteDoc(activityRef);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
}

// Get Activity Stats
export async function getActivityStats(userId: string): Promise<ActivityStats | null> {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, ACTIVITY_STATS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ActivityStats;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting activity stats:', error);
    throw error;
  }
}

// Get User Activities
export async function getUserActivities(
  userId: string, 
  limitCount: number = 20,
  startAfterTimestamp?: Timestamp
): Promise<Activity[]> {
  try {
    const db = getFirebaseDb();
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ];
    
    if (startAfterTimestamp) {
      constraints.push(startAfter(startAfterTimestamp));
    }
    
    const q = query(collection(db, ACTIVITIES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const activities: Activity[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      } as Activity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting user activities:', error);
    throw error;
  }
} 