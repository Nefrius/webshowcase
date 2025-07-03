// Firebase imports for bookmark system
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  writeBatch,
  increment
} from "firebase/firestore";
import {
  Bookmark,
  BookmarkCollection,
  BookmarkFilters,
  CreateBookmarkRequest,
  CreateCollectionRequest,
  BookmarkStats
} from "@/types/bookmark";

// Add bookmark to collection
export const addBookmark = async (
  userId: string,
  request: CreateBookmarkRequest
): Promise<{ success: boolean; bookmarkId?: string; error?: string }> => {
  try {
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    // Check if already bookmarked
    const existingQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      where('websiteId', '==', request.websiteId),
      where('collectionName', '==', request.collectionName)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      return { success: false, error: "Already bookmarked in this collection" };
    }

    // Get website data for caching
    const websiteDoc = await getDoc(doc(db, 'websites', request.websiteId));
    const websiteData = websiteDoc.data();

    // Add bookmark
    const bookmarkData = {
      userId,
      websiteId: request.websiteId,
      collectionName: request.collectionName,
      note: request.note || '',
      websiteTitle: websiteData?.title || '',
      websiteImageUrl: websiteData?.imageUrl || '',
      websiteUrl: websiteData?.url || '',
      createdAt: serverTimestamp()
    };

    const bookmarkRef = await addDoc(collection(db, 'bookmarks'), bookmarkData);

    // Update collection bookmark count
    const batch = writeBatch(db);
    
    // Try to find existing collection
    const collectionQuery = query(
      collection(db, 'bookmarkCollections'),
      where('userId', '==', userId),
      where('name', '==', request.collectionName)
    );
    
    const collectionSnapshot = await getDocs(collectionQuery);
    
    if (collectionSnapshot.empty) {
      // Create new collection
      const newCollectionRef = doc(collection(db, 'bookmarkCollections'));
      batch.set(newCollectionRef, {
        userId,
        name: request.collectionName,
        description: '',
        isPublic: false,
        bookmarkCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        color: '#3B82F6', // Default blue
        icon: '📚' // Default book emoji
      });
    } else {
      // Update existing collection
      const existingCollection = collectionSnapshot.docs[0];
      batch.update(existingCollection.ref, {
        bookmarkCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();

    return { success: true, bookmarkId: bookmarkRef.id };
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return { success: false, error: 'Failed to add bookmark' };
  }
};

// Remove bookmark
export const removeBookmark = async (
  userId: string,
  websiteId: string,
  collectionName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    const bookmarkQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      where('websiteId', '==', websiteId),
      where('collectionName', '==', collectionName)
    );

    const bookmarkSnapshot = await getDocs(bookmarkQuery);
    
    if (bookmarkSnapshot.empty) {
      return { success: false, error: "Bookmark not found" };
    }

    const batch = writeBatch(db);
    
    // Delete bookmark
    bookmarkSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Update collection count
    const collectionQuery = query(
      collection(db, 'bookmarkCollections'),
      where('userId', '==', userId),
      where('name', '==', collectionName)
    );
    
    const collectionSnapshot = await getDocs(collectionQuery);
    
    if (!collectionSnapshot.empty) {
      const collectionDoc = collectionSnapshot.docs[0];
      batch.update(collectionDoc.ref, {
        bookmarkCount: increment(-1),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return { success: false, error: 'Failed to remove bookmark' };
  }
};

// Check if website is bookmarked
export const isBookmarked = async (
  userId: string,
  websiteId: string,
  collectionName?: string
): Promise<boolean> => {
  try {
    if (!db) return false;

    let bookmarkQuery;
    
    if (collectionName) {
      bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', userId),
        where('websiteId', '==', websiteId),
        where('collectionName', '==', collectionName)
      );
    } else {
      bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', userId),
        where('websiteId', '==', websiteId)
      );
    }

    const snapshot = await getDocs(bookmarkQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

// Get user bookmarks with filters
export const getUserBookmarks = async (
  userId: string,
  filters: BookmarkFilters = {}
): Promise<Bookmark[]> => {
  try {
    if (!db) return [];

    let bookmarkQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId)
    );

    // Apply collection filter
    if (filters.collectionName) {
      bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', userId),
        where('collectionName', '==', filters.collectionName)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        bookmarkQuery = query(bookmarkQuery, orderBy('createdAt', 'asc'));
        break;
      case 'alphabetical':
        bookmarkQuery = query(bookmarkQuery, orderBy('websiteTitle', 'asc'));
        break;
      case 'newest':
      default:
        bookmarkQuery = query(bookmarkQuery, orderBy('createdAt', 'desc'));
        break;
    }

    // Apply limit
    if (filters.limit) {
      bookmarkQuery = query(bookmarkQuery, firestoreLimit(filters.limit));
    }

    const snapshot = await getDocs(bookmarkQuery);
    const bookmarks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Bookmark[];

    // Apply search filter (client-side)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      return bookmarks.filter(bookmark =>
        bookmark.websiteTitle?.toLowerCase().includes(searchTerm) ||
        bookmark.note?.toLowerCase().includes(searchTerm) ||
        bookmark.collectionName.toLowerCase().includes(searchTerm)
      );
    }

    return bookmarks;
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    return [];
  }
};

// Get user collections
export const getUserCollections = async (userId: string): Promise<BookmarkCollection[]> => {
  try {
    if (!db) return [];

    const collectionsQuery = query(
      collection(db, 'bookmarkCollections'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(collectionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as BookmarkCollection[];
  } catch (error) {
    console.error('Error getting user collections:', error);
    return [];
  }
};

// Create new collection
export const createCollection = async (
  userId: string,
  request: CreateCollectionRequest
): Promise<{ success: boolean; collectionId?: string; error?: string }> => {
  try {
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    // Check if collection name already exists
    const existingQuery = query(
      collection(db, 'bookmarkCollections'),
      where('userId', '==', userId),
      where('name', '==', request.name)
    );

    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      return { success: false, error: "Collection name already exists" };
    }

    const collectionData = {
      userId,
      name: request.name,
      description: request.description || '',
      isPublic: request.isPublic || false,
      bookmarkCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      color: request.color || '#3B82F6',
      icon: request.icon || '📚'
    };

    const collectionRef = await addDoc(collection(db, 'bookmarkCollections'), collectionData);

    return { success: true, collectionId: collectionRef.id };
  } catch (error) {
    console.error('Error creating collection:', error);
    return { success: false, error: 'Failed to create collection' };
  }
};

// Update collection
export const updateCollection = async (
  collectionId: string,
  updates: Partial<CreateCollectionRequest>
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    const collectionRef = doc(db, 'bookmarkCollections', collectionId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    const batch = writeBatch(db);
    batch.update(collectionRef, updateData);
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error updating collection:', error);
    return { success: false, error: 'Failed to update collection' };
  }
};

// Delete collection and all its bookmarks
export const deleteCollection = async (
  userId: string,
  collectionName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    const batch = writeBatch(db);

    // Delete all bookmarks in collection
    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      where('collectionName', '==', collectionName)
    );

    const bookmarksSnapshot = await getDocs(bookmarksQuery);
    bookmarksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete collection
    const collectionQuery = query(
      collection(db, 'bookmarkCollections'),
      where('userId', '==', userId),
      where('name', '==', collectionName)
    );

    const collectionSnapshot = await getDocs(collectionQuery);
    collectionSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error deleting collection:', error);
    return { success: false, error: 'Failed to delete collection' };
  }
};

// Get bookmark statistics
export const getBookmarkStats = async (userId: string): Promise<BookmarkStats> => {
  try {
    if (!db) {
      return {
        totalBookmarks: 0,
        totalCollections: 0,
        mostPopularCollection: '',
        recentlyAdded: []
      };
    }

    // Get total bookmarks
    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId)
    );
    const bookmarksSnapshot = await getDocs(bookmarksQuery);
    const totalBookmarks = bookmarksSnapshot.size;

    // Get collections
    const collections = await getUserCollections(userId);
    const totalCollections = collections.length;

    // Find most popular collection
    const mostPopularCollection = collections.length > 0
      ? collections.reduce((prev, current) => 
          (prev.bookmarkCount > current.bookmarkCount) ? prev : current
        ).name
      : '';

    // Get recent bookmarks
    const recentQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(5)
    );
    const recentSnapshot = await getDocs(recentQuery);
    const recentlyAdded = recentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Bookmark[];

    return {
      totalBookmarks,
      totalCollections,
      mostPopularCollection,
      recentlyAdded
    };
  } catch (error) {
    console.error('Error getting bookmark stats:', error);
    return {
      totalBookmarks: 0,
      totalCollections: 0,
      mostPopularCollection: '',
      recentlyAdded: []
    };
  }
};

// Get bookmarks for a specific website (to show who bookmarked it)
export const getWebsiteBookmarks = async (websiteId: string): Promise<number> => {
  try {
    if (!db) return 0;

    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('websiteId', '==', websiteId)
    );

    const snapshot = await getDocs(bookmarksQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting website bookmarks:', error);
    return 0;
  }
}; 