import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  increment,
  runTransaction,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Follow, 
  FollowStats, 
  FollowStatus, 
  FollowRequest, 
  FollowUser, 
  FollowListFilters,
  FollowActivity,
  FollowNotification
} from '@/types/follow';
import { createNotification } from './notifications';
import { NotificationType } from '@/types/notification';

// Follow işlemi - Kullanıcı takip etme
export async function followUser(followRequest: FollowRequest): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const { followerId, followingId } = followRequest;

  // Kendini takip etmeyi engelle
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  // Zaten takip edip etmediğini kontrol et
  const existingFollow = await getFollowStatus(followerId, followingId);
  if (existingFollow.isFollowing) {
    throw new Error('Already following this user');
  }

  try {
    await runTransaction(db, async (transaction) => {
      // Follow kaydı oluştur
      const followRef = doc(collection(db!, 'follows'));
      const followData: Omit<Follow, 'id'> = {
        followerId,
        followingId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      transaction.set(followRef, followData);

      // Takip eden kullanıcının following count'unu artır
      const followerStatsRef = doc(db!, 'followStats', followerId);
      transaction.set(followerStatsRef, {
        userId: followerId,
        followingCount: increment(1),
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Takip edilen kullanıcının followers count'unu artır
      const followingStatsRef = doc(db!, 'followStats', followingId);
      transaction.set(followingStatsRef, {
        userId: followingId,
        followersCount: increment(1),
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Follow aktivitesi kaydet
      const activityRef = doc(collection(db!, 'followActivities'));
      const activityData: Omit<FollowActivity, 'id'> = {
        type: 'follow',
        followerId,
        followingId,
        followerName: '', // Bu değer daha sonra user bilgisi ile doldurulacak
        followingName: '',
        createdAt: Timestamp.now()
      };
      transaction.set(activityRef, activityData);

      // Yeni bildirim sistemi ile bildirim oluştur
      // Bu transaction dışında yapılacak çünkü createNotification kendi transaction'ını kullanıyor
    });

    // Transaction tamamlandıktan sonra bildirim oluştur
    try {
      await createNotification({
        type: NotificationType.FOLLOW,
        title: 'Yeni Takipçi',
        message: 'Sizi takip etmeye başladı',
        recipientId: followingId,
        senderId: followerId,
        metadata: {
          followerId,
          followingId
        }
      });
    } catch (error) {
      console.warn('Failed to create notification:', error);
    }

    console.log('User followed successfully');
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

// Unfollow işlemi - Kullanıcı takibi bırakma
export async function unfollowUser(followRequest: FollowRequest): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const { followerId, followingId } = followRequest;

  // Takip edip etmediğini kontrol et
  const existingFollow = await getFollowStatus(followerId, followingId);
  if (!existingFollow.isFollowing) {
    throw new Error('Not following this user');
  }

  try {
    await runTransaction(db, async (transaction) => {
      // Mevcut follow kaydını bul ve sil
      const followsQuery = query(
        collection(db!, 'follows'),
        where('followerId', '==', followerId),
        where('followingId', '==', followingId)
      );
      const followsSnapshot = await getDocs(followsQuery);
      
      if (!followsSnapshot.empty) {
        const followDoc = followsSnapshot.docs[0];
        transaction.delete(followDoc.ref);
      }

      // Takip eden kullanıcının following count'unu azalt
      const followerStatsRef = doc(db!, 'followStats', followerId);
      transaction.set(followerStatsRef, {
        userId: followerId,
        followingCount: increment(-1),
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Takip edilen kullanıcının followers count'unu azalt
      const followingStatsRef = doc(db!, 'followStats', followingId);
      transaction.set(followingStatsRef, {
        userId: followingId,
        followersCount: increment(-1),
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Unfollow aktivitesi kaydet
      const activityRef = doc(collection(db!, 'followActivities'));
      const activityData: Omit<FollowActivity, 'id'> = {
        type: 'unfollow',
        followerId,
        followingId,
        followerName: '',
        followingName: '',
        createdAt: Timestamp.now()
      };
      transaction.set(activityRef, activityData);
    });

    console.log('User unfollowed successfully');
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

// Follow durumu kontrolü
export async function getFollowStatus(followerId: string, followingId: string): Promise<FollowStatus> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    // İki yönlü kontrol yap
    const [isFollowingQuery, isFollowedByQuery] = await Promise.all([
      getDocs(query(
        collection(db, 'follows'),
        where('followerId', '==', followerId),
        where('followingId', '==', followingId)
      )),
      getDocs(query(
        collection(db, 'follows'),
        where('followerId', '==', followingId),
        where('followingId', '==', followerId)
      ))
    ]);

    const isFollowing = !isFollowingQuery.empty;
    const isFollowedBy = !isFollowedByQuery.empty;

    return {
      isFollowing,
      isFollowedBy,
      mutualFollow: isFollowing && isFollowedBy
    };
  } catch (error) {
    console.error('Error getting follow status:', error);
    throw error;
  }
}

// Kullanıcının follow istatistiklerini getir
export async function getFollowStats(userId: string): Promise<FollowStats> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    const statsDoc = await getDoc(doc(db!, 'followStats', userId));
    
    if (statsDoc.exists()) {
      return { ...statsDoc.data() } as FollowStats;
    }

    // Eğer stats yoksa varsayılan değerler döndür
    return {
      userId,
      followersCount: 0,
      followingCount: 0,
      updatedAt: Timestamp.now()
    };
  } catch (error) {
    console.error('Error getting follow stats:', error);
    throw error;
  }
}

// Kullanıcının takipçilerini getir
export async function getFollowers(userId: string, filters: FollowListFilters = {}): Promise<FollowUser[]> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { sortBy = 'recent', limit = 20, startAfter: startAfterDoc } = filters;

    let followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );

    // Sıralama ekle
    if (sortBy === 'recent') {
      followersQuery = query(followersQuery, orderBy('createdAt', 'desc'));
    }

    // Limit ekle
    followersQuery = query(followersQuery, firestoreLimit(limit));

    // Pagination
    if (startAfterDoc) {
      followersQuery = query(followersQuery, startAfter(startAfterDoc));
    }

    const followersSnapshot = await getDocs(followersQuery);
    const followers: FollowUser[] = [];

    // Her takipçi için user bilgilerini getir
    for (const followDoc of followersSnapshot.docs) {
      const followData = followDoc.data();
      const userDoc = await getDoc(doc(db, 'users', followData.followerId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userStats = await getFollowStats(followData.followerId);
        
        followers.push({
          id: followData.followerId,
          displayName: userData.displayName || userData.email,
          email: userData.email,
          photoURL: userData.photoURL,
          bio: userData.bio,
          followedAt: followData.createdAt,
          followersCount: userStats.followersCount,
          followingCount: userStats.followingCount
        });
      }
    }

    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
}

// Kullanıcının takip ettiklerini getir
export async function getFollowing(userId: string, filters: FollowListFilters = {}): Promise<FollowUser[]> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { sortBy = 'recent', limit = 20, startAfter: startAfterDoc } = filters;

    let followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );

    // Sıralama ekle
    if (sortBy === 'recent') {
      followingQuery = query(followingQuery, orderBy('createdAt', 'desc'));
    }

    // Limit ekle
    followingQuery = query(followingQuery, firestoreLimit(limit));

    // Pagination
    if (startAfterDoc) {
      followingQuery = query(followingQuery, startAfter(startAfterDoc));
    }

    const followingSnapshot = await getDocs(followingQuery);
    const following: FollowUser[] = [];

    // Her takip edilen için user bilgilerini getir
    for (const followDoc of followingSnapshot.docs) {
      const followData = followDoc.data();
      const userDoc = await getDoc(doc(db, 'users', followData.followingId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userStats = await getFollowStats(followData.followingId);
        
        following.push({
          id: followData.followingId,
          displayName: userData.displayName || userData.email,
          email: userData.email,
          photoURL: userData.photoURL,
          bio: userData.bio,
          followedAt: followData.createdAt,
          followersCount: userStats.followersCount,
          followingCount: userStats.followingCount
        });
      }
    }

    return following;
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
}

// Follow aktivitelerini getir (feed için)
export async function getFollowActivities(userId: string, limit = 20): Promise<FollowActivity[]> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    // Kullanıcının takip ettiği kişilerin aktivitelerini getir
    const followingSnapshot = await getDocs(
      query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      )
    );

    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
    followingIds.push(userId); // Kendi aktivitelerini de dahil et

    if (followingIds.length === 0) {
      return [];
    }

    // Aktiviteleri getir
    const activitiesQuery = query(
      collection(db, 'followActivities'),
      where('followerId', 'in', followingIds),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const activitiesSnapshot = await getDocs(activitiesQuery);
    const activities: FollowActivity[] = [];

    for (const activityDoc of activitiesSnapshot.docs) {
      const activityData = activityDoc.data();
      
      // User isimlerini getir
      const [followerDoc, followingDoc] = await Promise.all([
        getDoc(doc(db, 'users', activityData.followerId)),
        getDoc(doc(db, 'users', activityData.followingId))
      ]);

      activities.push({
        id: activityDoc.id,
        type: activityData.type,
        followerId: activityData.followerId,
        followingId: activityData.followingId,
        followerName: followerDoc.exists() ? 
          (followerDoc.data().displayName || followerDoc.data().email) : 'Unknown User',
        followingName: followingDoc.exists() ? 
          (followingDoc.data().displayName || followingDoc.data().email) : 'Unknown User',
        createdAt: activityData.createdAt
      });
    }

    return activities;
  } catch (error) {
    console.error('Error getting follow activities:', error);
    throw error;
  }
}

// Kullanıcının okunmamış follow bildirimlerini getir
export async function getFollowNotifications(userId: string): Promise<FollowNotification[]> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      firestoreLimit(50)
    );

    const notificationsSnapshot = await getDocs(notificationsQuery);
    const notifications: FollowNotification[] = [];

    for (const notificationDoc of notificationsSnapshot.docs) {
      const notificationData = notificationDoc.data();
      
      // From user bilgisini getir
      const fromUserDoc = await getDoc(doc(db, 'users', notificationData.fromUserId));
      
      notifications.push({
        id: notificationDoc.id,
        type: notificationData.type,
        fromUserId: notificationData.fromUserId,
        toUserId: notificationData.toUserId,
        fromUserName: fromUserDoc.exists() ? 
          (fromUserDoc.data().displayName || fromUserDoc.data().email) : 'Unknown User',
        read: notificationData.read,
        createdAt: notificationData.createdAt
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error getting follow notifications:', error);
    throw error;
  }
}

// Bildirimi okundu olarak işaretle
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export default {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowStats,
  getFollowers,
  getFollowing,
  getFollowActivities,
  getFollowNotifications,
  markNotificationAsRead
}; 