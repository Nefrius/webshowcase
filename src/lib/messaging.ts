import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { getFirebaseAuth, getFirebaseDb, getFirebaseApp } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Firebase Cloud Messaging için VAPID Key (Firebase Console'dan alınacak)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let messaging: Messaging | null = null;

// Initialize messaging only in browser
if (typeof window !== 'undefined') {
  try {
    const app = getFirebaseApp();
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
  }
}

export interface NotificationPermission {
  granted: boolean;
  token?: string;
}

export interface NotificationPreferences {
  newWebsites: boolean;
  comments: boolean;
  ratings: boolean;
  follows: boolean;
  announcements: boolean;
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!messaging || !VAPID_KEY) {
    throw new Error('Firebase Messaging not configured');
  }

  try {
    // Request browser notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM registration token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      
      if (token) {
        // Save token to user's profile
        await saveUserToken(token);
        
        return { granted: true, token };
      } else {
        console.warn('No registration token available');
        return { granted: false };
      }
    } else {
      console.warn('Notification permission denied');
      return { granted: false };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
};

// Save FCM token to user's Firestore document
const saveUserToken = async (token: string) => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdated: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Save user notification preferences
export const saveNotificationPreferences = async (preferences: NotificationPreferences) => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        notificationPreferences: preferences,
        preferencesUpdated: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return;
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

// Get current notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return { granted: false };
  }
  
  return {
    granted: Notification.permission === 'granted',
  };
};

// Show local notification (for foreground messages)
export const showLocalNotification = (title: string, options?: NotificationOptions) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }
  
  const defaultOptions: NotificationOptions = {
    icon: '/infery.ico',
    badge: '/infery.ico',
    tag: 'inferyhub-notification',
    requireInteraction: false,
    ...options,
  };
  
  return new Notification(title, defaultOptions);
};

export default messaging; 