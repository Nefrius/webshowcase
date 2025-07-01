"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, AuthState } from '@/types/user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Firebase is properly configured
  const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Firebase kullanıcısını Firestore'daki kullanıcı verisine dönüştür
  const mapFirebaseUser = async (firebaseUser: FirebaseUser | null): Promise<User | null> => {
    if (!firebaseUser) return null;

    try {
      if (!db) {
        console.error('Firestore not available');
        return null;
      }
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || userData.displayName || undefined,
          photoURL: firebaseUser.photoURL || userData.photoURL || undefined,
          isPremium: userData.isPremium || false,
          role: userData.role || 'user',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
          // Profile fields
          bio: userData.bio || undefined,
          website: userData.website || undefined,
          location: userData.location || undefined,
          social: userData.social || undefined,
          // Moderation fields
          isBlocked: userData.isBlocked || false,
          blockReason: userData.blockReason || undefined,
          warningCount: userData.warningCount || 0,
        };
      } else {
        // Yeni kullanıcı - Firestore'da oluştur
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          isPremium: false,
          role: 'user',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        if (db) {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...newUser,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
        }

        return newUser;
      }
    } catch (err) {
      console.error('Error mapping Firebase user:', err);
      return null;
    }
  };

  useEffect(() => {
    // If Firebase is not configured, skip auth setup
    if (!hasFirebaseConfig) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      try {
        const mappedUser = await mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
      } catch (err) {
        setError('Authentication error occurred');
        console.error('Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [hasFirebaseConfig]);

  const login = async (email: string, password: string) => {
    if (!hasFirebaseConfig) {
      throw new Error('Firebase not configured');
    }
    
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth!, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    if (!hasFirebaseConfig) {
      throw new Error('Firebase not configured');
    }
    
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth!, email, password);
      
      // Kullanıcı profilini güncelle
      if (db) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName,
          photoURL: null,
          isPremium: false,
          role: 'user',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!hasFirebaseConfig) {
      throw new Error('Firebase not configured');
    }
    
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!hasFirebaseConfig) {
      throw new Error('Firebase not configured');
    }
    
    try {
      setError(null);
      await signOut(auth!);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!hasFirebaseConfig || !auth || !auth.currentUser) {
      return;
    }
    
    const mappedUser = await mapFirebaseUser(auth.currentUser);
    setUser(mappedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 
