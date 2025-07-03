import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Check if Firebase config is available
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} : null;

// Initialize Firebase only if config is available
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

if (hasFirebaseConfig && firebaseConfig) {
  try {
    // Initialize Firebase (prevent multiple initialization)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics (only in browser)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn('Firebase Analytics initialization failed:', error);
      }
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase configuration is missing. Please set up environment variables.');
}

// Helper functions to check Firebase availability
export const getFirebaseAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Please check your environment variables.');
  }
  return auth;
};

export const getFirebaseDb = () => {
  if (!db) {
    throw new Error('Firebase Firestore not initialized. Please check your environment variables.');
  }
  return db;
};

export const getFirebaseAnalytics = () => {
  if (!analytics) {
    throw new Error('Firebase Analytics not initialized. Please check your environment variables.');
  }
  return analytics;
};

// Original exports for backward compatibility
// Export Firebase services (will be null if not configured)
export { auth, db, analytics };

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = () => hasFirebaseConfig && !!auth && !!db;
export default app; 