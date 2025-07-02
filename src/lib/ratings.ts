import { 
  collection, 
  doc, 
  setDoc,
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { 
  Rating, 
  WebsiteRatingStats, 
  RatingFilters, 
  RatingSubmission,
  UserRatingHistory,
  RatingStatsSummary 
} from '@/types/rating';

const db = getFirebaseDb();

// Submit or update a rating
export async function submitRating(
  submission: RatingSubmission,
  userId: string,
  userDisplayName: string,
  userPhotoURL?: string
): Promise<{ success: boolean; isNew: boolean; newStats: WebsiteRatingStats }> {
  try {
    const batch = writeBatch(db);
    
    // Check if user already rated this website
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('websiteId', '==', submission.websiteId),
      where('userId', '==', userId)
    );
    
    const existingRatingSnapshot = await getDocs(existingRatingQuery);
    const existingRating = existingRatingSnapshot.docs[0];
    
    let ratingRef;
    let isNew = false;
    let oldRating = 0;
    
    if (existingRating) {
      // Update existing rating
      ratingRef = existingRating.ref;
      oldRating = existingRating.data().rating;
      
      batch.update(ratingRef, {
        rating: submission.rating,
        review: submission.review || null,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new rating
      ratingRef = doc(collection(db, 'ratings'));
      isNew = true;
      
      batch.set(ratingRef, {
        websiteId: submission.websiteId,
        userId,
        userDisplayName,
        userPhotoURL: userPhotoURL || null,
        rating: submission.rating,
        review: submission.review || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    // Update website rating statistics
    const newStats = await updateWebsiteRatingStats(submission.websiteId, submission.rating, oldRating, isNew);
    
    // Update website document with new rating info
    const websiteRef = doc(db, 'websites', submission.websiteId);
    batch.update(websiteRef, {
      averageRating: newStats.averageRating,
      totalRatings: newStats.totalRatings,
      ratingDistribution: newStats.ratingDistribution
    });
    
    await batch.commit();
    
    return { success: true, isNew, newStats };
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw new Error('Failed to submit rating');
  }
}

// Update website rating statistics
async function updateWebsiteRatingStats(
  websiteId: string,
  newRating: number,
  oldRating: number = 0,
  isNewRating: boolean = false
): Promise<WebsiteRatingStats> {
  try {
    const statsRef = doc(db, 'websiteRatingStats', websiteId);
    const statsDoc = await getDoc(statsRef);
    
    let stats: WebsiteRatingStats;
    
    if (statsDoc.exists()) {
      stats = { 
        websiteId, 
        ...statsDoc.data(),
        lastUpdated: statsDoc.data().lastUpdated?.toDate() || new Date()
      } as WebsiteRatingStats;
    } else {
      // Create initial stats
      stats = {
        websiteId,
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        lastUpdated: new Date()
      };
    }
    
    // Update statistics
    if (isNewRating) {
      stats.totalRatings += 1;
      stats.ratingDistribution[newRating as keyof typeof stats.ratingDistribution] += 1;
    } else {
      // Update existing rating - remove old, add new
      if (oldRating > 0) {
        stats.ratingDistribution[oldRating as keyof typeof stats.ratingDistribution] -= 1;
      }
      stats.ratingDistribution[newRating as keyof typeof stats.ratingDistribution] += 1;
    }
    
    // Calculate new average
    const totalPoints = Object.entries(stats.ratingDistribution).reduce(
      (sum, [rating, count]) => sum + (parseInt(rating) * (count as number)),
      0
    );
    stats.averageRating = stats.totalRatings > 0 ? totalPoints / stats.totalRatings : 0;
    stats.lastUpdated = new Date();
    
    // Save updated stats (create or update)
    await setDoc(statsRef, {
      websiteId,
      totalRatings: stats.totalRatings,
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    return stats;
  } catch (error) {
    console.error('Error updating rating stats:', error);
    throw error;
  }
}

// Get ratings for a website
export async function getWebsiteRatings(filters: RatingFilters): Promise<Rating[]> {
  try {
    const { websiteId, sortBy = 'newest', ratingFilter, withReviews, limit = 50 } = filters;

    let q = query(
      collection(db, 'ratings'),
      where('websiteId', '==', websiteId)
    );

    // Filter by specific rating
    if (ratingFilter) {
      q = query(q, where('rating', '==', ratingFilter));
    }

    // Filter to only include ratings with reviews
    if (withReviews) {
      q = query(q, where('review', '!=', null));
    }

    // Add sorting
    switch (sortBy) {
      case 'oldest':
        q = query(q, orderBy('createdAt', 'asc'));
        break;
      case 'highest':
        q = query(q, orderBy('rating', 'desc'));
        break;
      case 'lowest':
        q = query(q, orderBy('rating', 'asc'));
        break;
      case 'newest':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const querySnapshot = await getDocs(q);
    const ratings: Rating[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ratings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Rating);
    });

    return ratings;
  } catch (error) {
    console.error('Error getting website ratings:', error);
    throw new Error('Failed to load ratings');
  }
}

// Get website rating statistics
export async function getWebsiteRatingStats(websiteId: string): Promise<WebsiteRatingStats | null> {
  try {
    const statsDoc = await getDoc(doc(db, 'websiteRatingStats', websiteId));
    
    if (!statsDoc.exists()) {
      return null;
    }

    const data = statsDoc.data();
    return {
      websiteId,
      ...data,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    } as WebsiteRatingStats;
  } catch (error) {
    console.error('Error getting rating stats:', error);
    throw new Error('Failed to load rating statistics');
  }
}

// Get user's rating for a specific website
export async function getUserRating(websiteId: string, userId: string): Promise<Rating | null> {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('websiteId', '==', websiteId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Rating;
  } catch (error) {
    console.error('Error getting user rating:', error);
    throw new Error('Failed to load user rating');
  }
}

// Delete a rating
export async function deleteRating(
  ratingId: string, 
  websiteId: string,
  userId: string
): Promise<{ success: boolean; newStats: WebsiteRatingStats }> {
  try {
    const ratingRef = doc(db, 'ratings', ratingId);
    const ratingDoc = await getDoc(ratingRef);
    
    if (!ratingDoc.exists()) {
      throw new Error('Rating not found');
    }

    const ratingData = ratingDoc.data() as Rating;
    
    // Check if user owns this rating
    if (ratingData.userId !== userId) {
      throw new Error('Not authorized to delete this rating');
    }

    const batch = writeBatch(db);
    
    // Delete the rating
    batch.delete(ratingRef);
    
    // Update website rating statistics
    const newStats = await updateWebsiteRatingStats(websiteId, 0, ratingData.rating, false);
    
    // Update website document
    const websiteRef = doc(db, 'websites', websiteId);
    batch.update(websiteRef, {
      averageRating: newStats.averageRating,
      totalRatings: newStats.totalRatings,
      ratingDistribution: newStats.ratingDistribution
    });
    
    await batch.commit();
    
    return { success: true, newStats };
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new Error('Failed to delete rating');
  }
}

// Get user's rating history
export async function getUserRatingHistory(userId: string): Promise<UserRatingHistory> {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const ratings: Rating[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ratings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Rating);
    });

    const totalRatings = ratings.length;
    const averageGiven = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
      : 0;

    return {
      userId,
      totalRatings,
      averageGiven,
      ratings
    };
  } catch (error) {
    console.error('Error getting user rating history:', error);
    throw new Error('Failed to load rating history');
  }
}

// Get platform rating statistics
export async function getPlatformRatingStats(): Promise<RatingStatsSummary> {
  try {
    // Get all rating stats
    const statsSnapshot = await getDocs(collection(db, 'websiteRatingStats'));
    let totalRatings = 0;
    let totalPoints = 0;
    const highestRated: { websiteId: string; websiteTitle: string; rating: number; }[] = [];

    statsSnapshot.forEach((doc) => {
      const data = doc.data() as WebsiteRatingStats;
      totalRatings += data.totalRatings;
      
      const ratingSum = Object.entries(data.ratingDistribution).reduce(
        (sum, [rating, count]) => sum + (parseInt(rating) * (count as number)),
        0
      );
      totalPoints += ratingSum;

      if (data.averageRating >= 4.5 && data.totalRatings >= 5) {
        highestRated.push({
          websiteId: data.websiteId,
          websiteTitle: '', // Will be populated separately
          rating: data.averageRating
        });
      }
    });

    // Get recent ratings
    const recentRatingsQuery = query(
      collection(db, 'ratings'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(10)
    );
    
    const recentSnapshot = await getDocs(recentRatingsQuery);
    const recentRatings: Rating[] = [];

    recentSnapshot.forEach((doc) => {
      const data = doc.data();
      recentRatings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Rating);
    });

    const averageRating = totalRatings > 0 ? totalPoints / totalRatings : 0;

    return {
      totalRatings,
      averageRating,
      highestRated: highestRated.sort((a, b) => b.rating - a.rating).slice(0, 5),
      recentRatings
    };
  } catch (error) {
    console.error('Error getting platform rating stats:', error);
    throw new Error('Failed to load platform rating statistics');
  }
}

// Real-time subscription to website ratings
export function subscribeToWebsiteRatings(
  websiteId: string,
  callback: (ratings: Rating[]) => void,
  filters: Omit<RatingFilters, 'websiteId'> = {}
): Unsubscribe {
  try {
    const { sortBy = 'newest', ratingFilter, withReviews } = filters;

    let q = query(
      collection(db, 'ratings'),
      where('websiteId', '==', websiteId)
    );

    if (ratingFilter) {
      q = query(q, where('rating', '==', ratingFilter));
    }

    if (withReviews) {
      q = query(q, where('review', '!=', null));
    }

    switch (sortBy) {
      case 'oldest':
        q = query(q, orderBy('createdAt', 'asc'));
        break;
      case 'highest':
        q = query(q, orderBy('rating', 'desc'));
        break;
      case 'lowest':
        q = query(q, orderBy('rating', 'asc'));
        break;
      case 'newest':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    return onSnapshot(q, (querySnapshot) => {
      const ratings: Rating[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ratings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Rating);
      });

      callback(ratings);
    });
  } catch (error) {
    console.error('Error subscribing to ratings:', error);
    return () => {}; // Return empty unsubscribe function
  }
} 