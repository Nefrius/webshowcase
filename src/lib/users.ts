import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { UserBadge } from '../types/user';

export interface PublicUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  badge?: UserBadge;
  followerCount: number;
  followingCount: number;
  websiteCount: number;
  createdAt: Date;
  isFollowing?: boolean;
}

// Get all users for public exploration
export const getPublicUsers = async (pageSize: number = 50): Promise<PublicUser[]> => {
  try {
    const db = getFirebaseDb();
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('isBlocked', '!=', true),
      orderBy('createdAt', 'desc'), 
      limit(pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    const users: PublicUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        displayName: userData.displayName || userData.email || 'Unknown User',
        photoURL: userData.photoURL,
        badge: userData.badge,
        followerCount: userData.followerCount || 0,
        followingCount: userData.followingCount || 0,
        websiteCount: userData.websiteCount || 0,
        createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date(),
        isFollowing: false
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching public users:', error);
    throw error;
  }
};

// Search users
export const searchUsers = async (searchTerm: string, pageSize: number = 50): Promise<PublicUser[]> => {
  try {
    const db = getFirebaseDb();
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('isBlocked', '!=', true),
      orderBy('displayName'),
      limit(pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    const users: PublicUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const displayName = userData.displayName || userData.email || 'Unknown User';
      
      // Simple client-side filtering for search
      if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
        users.push({
          uid: doc.id,
          displayName,
          photoURL: userData.photoURL,
          badge: userData.badge,
          followerCount: userData.followerCount || 0,
          followingCount: userData.followingCount || 0,
          websiteCount: userData.websiteCount || 0,
          createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date(),
          isFollowing: false
        });
      }
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Get popular users (most followers)
export const getPopularUsers = async (pageSize: number = 50): Promise<PublicUser[]> => {
  try {
    const db = getFirebaseDb();
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('isBlocked', '!=', true),
      orderBy('followerCount', 'desc'),
      limit(pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    const users: PublicUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        displayName: userData.displayName || userData.email || 'Unknown User',
        photoURL: userData.photoURL,
        badge: userData.badge,
        followerCount: userData.followerCount || 0,
        followingCount: userData.followingCount || 0,
        websiteCount: userData.websiteCount || 0,
        createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date(),
        isFollowing: false
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching popular users:', error);
    throw error;
  }
};

// Follow a user
export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    
    // Add to current user's following list
    await updateDoc(doc(db, 'users', currentUserId), {
      following: arrayUnion(targetUserId),
      followingCount: increment(1)
    });
    
    // Add to target user's followers list
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayUnion(currentUserId),
      followerCount: increment(1)
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    
    // Remove from current user's following list
    await updateDoc(doc(db, 'users', currentUserId), {
      following: arrayRemove(targetUserId),
      followingCount: increment(-1)
    });
    
    // Remove from target user's followers list
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayRemove(currentUserId),
      followerCount: increment(-1)
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Check if user is following another user
export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.following?.includes(targetUserId) || false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if following:', error);
    return false;
  }
};

// Check multiple users for following status
export const checkFollowingStatus = async (
  currentUserId: string, 
  userIds: string[]
): Promise<{ [key: string]: boolean }> => {
  try {
    const db = getFirebaseDb();
    const currentUserRef = doc(db, 'users', currentUserId);
    const currentUserDoc = await getDoc(currentUserRef);
    
    if (!currentUserDoc.exists()) {
      return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
    }
    
    const userData = currentUserDoc.data();
    const following = userData.following || [];
    
    return userIds.reduce((acc, id) => ({
      ...acc,
      [id]: following.includes(id)
    }), {});
    
  } catch (error) {
    console.error('Error checking following status:', error);
    return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  }
}; 