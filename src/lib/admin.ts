import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDoc,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { 
  AdminUserData, 
  UserBadge, 
  CreateBadgeData, 
  BanUserData, 
  UpdateUserData,
  SystemAnnouncement
} from '../types/user';

// Default badges
const DEFAULT_BADGES: CreateBadgeData[] = [
  {
    name: 'member',
    displayName: 'Üye',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'User',
    description: 'Site üyesi',
    isDefault: true,
    priority: 1
  },
  {
    name: 'admin',
    displayName: 'Admin',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'Shield',
    description: 'Site yöneticisi',
    priority: 10
  },
  {
    name: 'owner',
    displayName: 'Sahip',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'Crown',
    description: 'Site sahibi',
    priority: 100
  },
  {
    name: 'partner',
    displayName: 'Ortak Şirket',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'Building',
    description: 'Ortak şirket',
    priority: 20
  },
  {
    name: 'premium',
    displayName: 'Premium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'Star',
    description: 'Premium üye',
    priority: 15
  },
  {
    name: 'sponsored',
    displayName: 'Sponsorlu',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'Zap',
    description: 'Sponsorlu hesap',
    priority: 25
  }
];

// Initialize default badges
export const initializeDefaultBadges = async (): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const badgesRef = collection(db, 'badges');
    const existingBadges = await getDocs(badgesRef);
    
    if (existingBadges.empty) {
      const batch = writeBatch(db);
      
      DEFAULT_BADGES.forEach((badge) => {
        const badgeRef = doc(badgesRef);
        batch.set(badgeRef, {
          ...badge,
          id: badgeRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Default badges initialized');
    }
  } catch (error) {
    console.error('Error initializing default badges:', error);
    throw error;
  }
};

// Get all users for admin management
export const getAllUsers = async (pageSize: number = 50): Promise<AdminUserData[]> => {
  try {
    const db = getFirebaseDb();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));
    const snapshot = await getDocs(q);
    
    const users: AdminUserData[] = [];
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // Get user's badge if they have one
      let badge: UserBadge | undefined;
      if (userData.badgeId) {
        const badgeDoc = await getDoc(doc(db, 'badges', userData.badgeId));
        if (badgeDoc.exists()) {
          badge = { id: badgeDoc.id, ...badgeDoc.data() } as UserBadge;
        }
      }
      
      users.push({
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role || 'user',
        badge,
        isBlocked: userData.isBlocked || false,
        blockReason: userData.blockReason,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
        websiteCount: userData.websiteCount || 0,
        followerCount: userData.followerCount || 0,
        followingCount: userData.followingCount || 0
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Ban/unban user
export const banUser = async (userId: string, banData: BanUserData, adminId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    const updateFields = {
      isBlocked: true,
      blockReason: banData.reason,
      blockedBy: adminId,
      blockedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(banData.duration && {
        blockExpiresAt: Timestamp.fromDate(new Date(Date.now() + banData.duration * 24 * 60 * 60 * 1000))
      })
    };
    
    await updateDoc(userRef, updateFields);
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

export const unbanUser = async (userId: string, adminId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isBlocked: false,
      blockReason: null,
      blockExpiresAt: null,
      unblockedBy: adminId,
      unblockedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

// Update user data
export const updateUserData = async (userId: string, userData: UpdateUserData, adminId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

// Badge management
export const getAllBadges = async (): Promise<UserBadge[]> => {
  try {
    const db = getFirebaseDb();
    const badgesRef = collection(db, 'badges');
    const q = query(badgesRef, orderBy('priority', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserBadge[];
  } catch (error) {
    console.error('Error getting badges:', error);
    throw error;
  }
};

export const createBadge = async (badgeData: CreateBadgeData): Promise<string> => {
  try {
    const db = getFirebaseDb();
    const badgesRef = collection(db, 'badges');
    const docRef = await addDoc(badgesRef, {
      ...badgeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating badge:', error);
    throw error;
  }
};

export const updateBadge = async (badgeId: string, badgeData: Partial<CreateBadgeData>): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const badgeRef = doc(db, 'badges', badgeId);
    await updateDoc(badgeRef, {
      ...badgeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    throw error;
  }
};

export const deleteBadge = async (badgeId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    // Check if badge is in use
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('badgeId', '==', badgeId));
    const usersWithBadge = await getDocs(q);
    
    if (!usersWithBadge.empty) {
      throw new Error('Cannot delete badge that is in use');
    }
    
    await deleteDoc(doc(db, 'badges', badgeId));
  } catch (error) {
    console.error('Error deleting badge:', error);
    throw error;
  }
};

// Badge assignment
export const assignBadgeToUser = async (userId: string, badgeId: string, adminId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      badgeId,
      badgeAssignedAt: serverTimestamp(),
      badgeAssignedBy: adminId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning badge to user:', error);
    throw error;
  }
};

export const removeBadgeFromUser = async (userId: string, adminId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      badgeId: null,
      badgeAssignedAt: null,
      badgeAssignedBy: null,
      badgeRemovedAt: serverTimestamp(),
      badgeRemovedBy: adminId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error removing badge from user:', error);
    throw error;
  }
};

// System announcements
export const createSystemAnnouncement = async (announcement: Omit<SystemAnnouncement, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const db = getFirebaseDb();
    const announcementsRef = collection(db, 'announcements');
    const docRef = await addDoc(announcementsRef, {
      ...announcement,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Duyuru yapıldığında tüm kullanıcılara bildirim gönder
    const { sendSystemAnnouncementToAllUsers } = await import('./notifications');
    await sendSystemAnnouncementToAllUsers(
      announcement.title,
      announcement.content,
      announcement.createdBy
    );
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const getActiveAnnouncements = async (): Promise<SystemAnnouncement[]> => {
  try {
    const db = getFirebaseDb();
    const announcementsRef = collection(db, 'announcements');
    const now = new Date();
    const q = query(
      announcementsRef,
      where('isActive', '==', true),
      where('expiresAt', '>', Timestamp.fromDate(now)),
      orderBy('expiresAt', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate()
    })) as SystemAnnouncement[];
  } catch (error) {
    console.error('Error getting active announcements:', error);
    throw error;
  }
};

export const updateAnnouncement = async (announcementId: string, updates: Partial<SystemAnnouncement>): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const announcementRef = doc(db, 'announcements', announcementId);
    await updateDoc(announcementRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Helper functions
export const getUserBadge = async (userId: string): Promise<UserBadge | null> => {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    if (!userData.badgeId) {
      return null;
    }
    
    const badgeDoc = await getDoc(doc(db, 'badges', userData.badgeId));
    if (!badgeDoc.exists()) {
      return null;
    }
    
    return {
      id: badgeDoc.id,
      ...badgeDoc.data()
    } as UserBadge;
  } catch (error) {
    console.error('Error getting user badge:', error);
    return null;
  }
};

export const assignDefaultBadge = async (userId: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const badgesRef = collection(db, 'badges');
    const q = query(badgesRef, where('isDefault', '==', true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const defaultBadge = snapshot.docs[0];
      await assignBadgeToUser(userId, defaultBadge.id, 'system');
    }
  } catch (error) {
    console.error('Error assigning default badge:', error);
    throw error;
  }
}; 