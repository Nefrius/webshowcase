import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { Website, WebsiteFilters } from '@/types/website';

// Collections
const WEBSITES_COLLECTION = 'websites';

// Error handling utility
const handleFirestoreError = (error: unknown, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);
  throw new Error(`${operation} sırasında hata oluştu`);
};

// Retry mechanism for Firestore operations
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
};

// Helper function to clean data for Firestore (remove undefined values)
const cleanDataForFirestore = (data: Record<string, unknown>): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

// Website CRUD Operations
export async function addWebsite(websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>): Promise<string> {
  try {
    if (!db) {
      throw new Error('Firestore not available');
    }

    return await withRetry(async () => {
      // Clean the data to remove undefined values
      const cleanedData = cleanDataForFirestore({
        ...websiteData,
        views: 0,
        likes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const docRef = await addDoc(collection(db!, WEBSITES_COLLECTION), cleanedData);
      
      return docRef.id;
    });
  } catch (error) {
    handleFirestoreError(error, 'Website ekleme');
    throw error;
  }
}

export async function getWebsites(filters?: WebsiteFilters, limitCount: number = 20): Promise<Website[]> {
  try {
    if (!db) {
      return [];
    }

    return await withRetry(async () => {
      const constraints: QueryConstraint[] = [];
      
      // Add filters
      if (filters?.category) {
        constraints.push(where('category', '==', filters.category));
      }
      
      if (filters?.isPremium !== undefined) {
        constraints.push(where('isPremium', '==', filters.isPremium));
      }
      
      if (filters?.technologies && filters.technologies.length > 0) {
        constraints.push(where('technologies', 'array-contains-any', filters.technologies));
      }
      
      // Add sorting
      switch (filters?.sortBy) {
        case 'popular':
          constraints.push(orderBy('likes', 'desc'));
          break;
        case 'views':
          constraints.push(orderBy('views', 'desc'));
          break;
        case 'recent':
        default:
          constraints.push(orderBy('createdAt', 'desc'));
          break;
      }
      
      // Add limit
      constraints.push(limit(limitCount));
      
      const q = query(collection(db!, WEBSITES_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const websites: Website[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        websites.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Website);
      });
      
      return websites;
    });
  } catch (error) {
    handleFirestoreError(error, 'Website listeleme');
    return []; // Return empty array on error to prevent UI breaking
  }
}

export async function getUserWebsites(userId: string): Promise<Website[]> {
  try {
    if (!db) {
      return [];
    }

    return await withRetry(async () => {
      const q = query(
        collection(db!, WEBSITES_COLLECTION),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const websites: Website[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        websites.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Website);
      });
      
      return websites;
    });
  } catch (error) {
    handleFirestoreError(error, 'Kullanıcı websiteleri listeleme');
    return []; // Return empty array on error
  }
}

export async function deleteWebsite(websiteId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not available');
    }

    await withRetry(async () => {
      const docRef = doc(db!, WEBSITES_COLLECTION, websiteId);
      await deleteDoc(docRef);
    });
  } catch (error) {
    handleFirestoreError(error, 'Website silme');
    throw error;
  }
}

export async function updateWebsite(websiteId: string, updates: Partial<Omit<Website, 'id' | 'createdAt' | 'ownerId' | 'views' | 'likes'>>): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not available');
    }

    await withRetry(async () => {
      const docRef = doc(db!, WEBSITES_COLLECTION, websiteId);
      
      // Create update object without undefined values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        updatedAt: Timestamp.now()
      };
      
      // Only add defined values
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.url !== undefined) updateData.url = updates.url;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.technologies !== undefined) updateData.technologies = updates.technologies;
      if (updates.purpose !== undefined) updateData.purpose = updates.purpose;
      if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.isPremium !== undefined) updateData.isPremium = updates.isPremium;
      if (updates.ownerName !== undefined) updateData.ownerName = updates.ownerName;
      
      await updateDoc(docRef, updateData);
    });
  } catch (error) {
    handleFirestoreError(error, 'Website güncelleme');
    throw error;
  }
}

export async function incrementWebsiteViews(id: string): Promise<void> {
  try {
    if (!db) {
      return;
    }

    await withRetry(async () => {
      const docRef = doc(db!, WEBSITES_COLLECTION, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    });
  } catch (error) {
    // Don't throw error for view tracking to avoid disrupting user experience
    console.error('Error incrementing views:', error);
  }
}

export async function incrementWebsiteLikes(id: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore not available');
    }

    await withRetry(async () => {
      const docRef = doc(db!, WEBSITES_COLLECTION, id);
      await updateDoc(docRef, {
        likes: increment(1)
      });
    });
  } catch (error) {
    handleFirestoreError(error, 'Beğeni ekleme');
    throw error;
  }
} 