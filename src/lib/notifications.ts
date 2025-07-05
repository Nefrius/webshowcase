import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs, 
  getDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Notification, 
  CreateNotificationData, 
  NotificationFilters,
  NotificationStats,
  NotificationSettings,
  UpdateNotificationSettingsData,
  NotificationListResponse,
  NotificationTriggerData,
  NotificationType
} from '../types/notification';

// Koleksiyon referansları
const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_SETTINGS_COLLECTION = 'notificationSettings';

/**
 * Yeni bildirim oluştur
 */
export const createNotification = async (data: CreateNotificationData): Promise<string> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const notificationData = {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Kullanıcının bildirimlerini getir
 */
export const getUserNotifications = async (
  userId: string, 
  filters?: NotificationFilters
): Promise<NotificationListResponse> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    let q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      orderBy('createdAt', filters?.sortBy === 'oldest' ? 'asc' : 'desc')
    );

    // Filtreler uygula
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }

    if (filters?.isRead !== undefined) {
      q = query(q, where('isRead', '==', filters.isRead));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    if (filters?.startAfter) {
      q = query(q, startAfter(filters.startAfter));
    }

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });

    const hasMore = querySnapshot.docs.length === (filters?.limit || 20);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]?.data()?.createdAt;

    return {
      notifications,
      hasMore,
      lastDoc: lastVisible,
      total: querySnapshot.size
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Bildirimi okundu olarak işaretle
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        isRead: true,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Bildirimi sil
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Tüm bildirimleri sil
 */
export const deleteAllNotifications = async (userId: string): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Kullanıcının bildirim istatistiklerini getir
 */
export const getNotificationStats = async (userId: string): Promise<NotificationStats> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    const stats: NotificationStats = {
      total: 0,
      totalCount: 0,
      unread: 0,
      unreadCount: 0,
      byType: {
        [NotificationType.FOLLOW]: 0,
        [NotificationType.LIKE]: 0,
        [NotificationType.COMMENT]: 0,
        [NotificationType.WEBSITE]: 0,
        [NotificationType.SYSTEM]: 0,
        [NotificationType.RATING]: 0
      },
      typeBreakdown: {
        [NotificationType.FOLLOW]: 0,
        [NotificationType.LIKE]: 0,
        [NotificationType.COMMENT]: 0,
        [NotificationType.WEBSITE]: 0,
        [NotificationType.SYSTEM]: 0,
        [NotificationType.RATING]: 0
      },
      todayCount: 0,
      thisWeekCount: 0
    };

    querySnapshot.forEach((doc) => {
      const notification = doc.data() as Notification;
      stats.total++;
      stats.totalCount++;
      
      if (!notification.isRead) {
        stats.unread++;
        stats.unreadCount++;
      }

      if (notification.type in stats.typeBreakdown) {
        stats.typeBreakdown[notification.type]++;
        stats.byType[notification.type]++;
      }

      // Count today's notifications
      const today = new Date();
      const notificationDate = notification.createdAt.toDate();
      if (notificationDate.toDateString() === today.toDateString()) {
        stats.todayCount++;
      }

      // Count this week's notifications
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (notificationDate >= weekAgo) {
        stats.thisWeekCount++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

/**
 * Real-time bildirim dinleyicisi
 */
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notifications: Notification[]) => void,
  onError: (error: Error) => void
) => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          } as Notification);
        });
        onNotification(notifications);
      },
      (error) => {
        console.error('Error in notification subscription:', error);
        onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    onError(error as Error);
    return () => {};
  }
};

/**
 * Kullanıcının bildirim ayarlarını getir
 */
export const getNotificationSettings = async (userId: string): Promise<NotificationSettings | null> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const settingsRef = doc(db, NOTIFICATION_SETTINGS_COLLECTION, userId);
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        userId,
        ...settingsDoc.data()
      } as NotificationSettings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

/**
 * Bildirim ayarlarını güncelle
 */
export const updateNotificationSettings = async (
  userId: string, 
  settings: UpdateNotificationSettingsData
): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const settingsRef = doc(db, NOTIFICATION_SETTINGS_COLLECTION, userId);
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } else {
      // Varsayılan ayarlarla yeni belge oluştur
      await setDoc(settingsRef, {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        followNotifications: true,
        likeNotifications: true,
        commentNotifications: true,
        websiteNotifications: true,
        systemNotifications: true,
        ratingNotifications: true,
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Bildirim tetikleyici - otomatik bildirim oluşturma
 */
export const triggerNotification = async (data: NotificationTriggerData): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    // Kullanıcının bildirim ayarlarını kontrol et
    const settings = await getNotificationSettings(data.recipientId);
    
    if (settings) {
      // Bildirim türüne göre ayar kontrolü
      const typeSettings = {
        [NotificationType.FOLLOW]: settings.followNotifications,
        [NotificationType.LIKE]: settings.likeNotifications,
        [NotificationType.COMMENT]: settings.commentNotifications,
        [NotificationType.WEBSITE]: settings.websiteNotifications,
        [NotificationType.SYSTEM]: settings.systemNotifications,
        [NotificationType.RATING]: settings.ratingNotifications
      };

      if (!typeSettings[data.type]) {
        console.log(`Notification type ${data.type} is disabled for user ${data.recipientId}`);
        return;
      }
    }

    // Bildirim mesajları oluştur
    const notificationMessages = generateNotificationMessage(data);
    
    await createNotification({
      type: data.type,
      title: data.customTitle || notificationMessages.title,
      message: data.customMessage || notificationMessages.message,
      recipientId: data.recipientId,
      senderId: data.senderId,
      websiteId: data.websiteId,
      commentId: data.commentId,
      ratingId: data.ratingId,
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Error triggering notification:', error);
    throw error;
  }
};

/**
 * Bildirim mesajı oluştur
 */
const generateNotificationMessage = (data: NotificationTriggerData): { title: string; message: string } => {
  switch (data.type) {
    case NotificationType.FOLLOW:
      return {
        title: 'Yeni Takipçi',
        message: 'Sizi takip etmeye başladı'
      };
    case NotificationType.LIKE:
      return {
        title: 'Yeni Beğeni',
        message: 'Websitenizi beğendi'
      };
    case NotificationType.COMMENT:
      return {
        title: 'Yeni Yorum',
        message: 'Websitenize yorum yaptı'
      };
    case NotificationType.WEBSITE:
      return {
        title: 'Yeni Website',
        message: 'Yeni bir website yükledi'
      };
    case NotificationType.RATING:
      return {
        title: 'Yeni Değerlendirme',
        message: 'Websitenizi değerlendirdi'
      };
    case NotificationType.SYSTEM:
      return {
        title: 'Sistem Bildirimi',
        message: 'Sistem bildirimi var'
      };
    default:
      return {
        title: 'Bildirim',
        message: 'Yeni bir bildirim var'
      };
  }
};

/**
 * Okunmamış bildirim sayısını getir
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

/**
 * Eski bildirimleri temizle (30 gün öncesi)
 */
export const cleanupOldNotifications = async (userId: string): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo))
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};

/**
 * Tüm kullanıcılara sistem duyurusu bildirimi gönder
 */
export const sendSystemAnnouncementToAllUsers = async (
  title: string,
  message: string,
  senderId: string
): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase not initialized');

    // Tüm kullanıcıları getir
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const batch = writeBatch(db);
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    
    usersSnapshot.forEach((userDoc) => {
      const userId = userDoc.id;
      // Gönderene bildirim gönderme
      if (userId !== senderId) {
        const notificationRef = doc(notificationsRef);
        batch.set(notificationRef, {
          type: NotificationType.SYSTEM,
          title,
          message,
          recipientId: userId,
          senderId,
          isRead: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error sending system announcement to all users:', error);
    throw error;
  }
}; 