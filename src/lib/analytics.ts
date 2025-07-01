import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

export interface AnalyticsData {
  totalWebsites: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  websitesThisMonth: number;
  usersThisMonth: number;
  topCategories: CategoryStats[];
  topTechnologies: TechnologyStats[];
  recentActivity: ActivityData[];
  viewsOverTime: TimeSeriesData[];
  likesOverTime: TimeSeriesData[];
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
}

export interface TechnologyStats {
  technology: string;
  count: number;
  percentage: number;
}

export interface ActivityData {
  id: string;
  type: 'website_created' | 'user_joined' | 'website_liked' | 'comment_added';
  title: string;
  user: {
    displayName: string;
    photoURL?: string;
  };
  createdAt: Timestamp;
  websiteId?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface UserAnalytics {
  totalWebsites: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  websitesByCategory: CategoryStats[];
  performanceOverTime: TimeSeriesData[];
  topWebsites: TopWebsite[];
}

export interface TopWebsite {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
}

// Get platform analytics
export async function getPlatformAnalytics(): Promise<AnalyticsData> {
  try {
    if (!db) {
      // Return default analytics if database not available
      return {
        totalWebsites: 0,
        totalUsers: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        websitesThisMonth: 0,
        usersThisMonth: 0,
        topCategories: [],
        topTechnologies: [],
        recentActivity: [],
        viewsOverTime: [],
        likesOverTime: []
      };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total counts
    const [
      websitesSnapshot,
      usersSnapshot,
      likesSnapshot,
      commentsSnapshot
    ] = await Promise.all([
      getCountFromServer(collection(db, 'websites')),
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(collection(db, 'likes')),
      getCountFromServer(collection(db, 'comments'))
    ]);

    // Get this month's data
    const [
      websitesThisMonthSnapshot,
      usersThisMonthSnapshot
    ] = await Promise.all([
      getCountFromServer(query(
        collection(db, 'websites'),
        where('createdAt', '>=', Timestamp.fromDate(thisMonth))
      )),
      getCountFromServer(query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(thisMonth))
      ))
    ]);

    // Get all websites for category/technology analysis
    const allWebsitesQuery = query(
      collection(db, 'websites'),
      where('status', '==', 'approved')
    );
    const allWebsitesSnapshot = await getDocs(allWebsitesQuery);
    
    // Analyze categories and technologies
    const categoryCount = new Map<string, number>();
    const technologyCount = new Map<string, number>();
    let totalViews = 0;

    allWebsitesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Count categories
      if (data.category) {
        categoryCount.set(data.category, (categoryCount.get(data.category) || 0) + 1);
      }
      
      // Count technologies
      if (data.technologies && Array.isArray(data.technologies)) {
        data.technologies.forEach((tech: string) => {
          technologyCount.set(tech, (technologyCount.get(tech) || 0) + 1);
        });
      }
      
      // Sum views
      totalViews += data.views || 0;
    });

    // Convert to stats arrays
    const totalWebsites = websitesSnapshot.data().count;
    
    const topCategories: CategoryStats[] = Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalWebsites) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTechnologies: TechnologyStats[] = Array.from(technologyCount.entries())
      .map(([technology, count]) => ({
        technology,
        count,
        percentage: (count / totalWebsites) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = await getRecentActivity();

    // Get time series data (simplified for demo)
    const viewsOverTime = await getViewsOverTime();
    const likesOverTime = await getLikesOverTime();

    return {
      totalWebsites: websitesSnapshot.data().count,
      totalUsers: usersSnapshot.data().count,
      totalViews,
      totalLikes: likesSnapshot.data().count,
      totalComments: commentsSnapshot.data().count,
      websitesThisMonth: websitesThisMonthSnapshot.data().count,
      usersThisMonth: usersThisMonthSnapshot.data().count,
      topCategories,
      topTechnologies,
      recentActivity,
      viewsOverTime,
      likesOverTime
    };
  } catch (error) {
    console.error('Error getting platform analytics:', error);
    throw error;
  }
}

// Get user analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    if (!db) {
      // Return default analytics if database not available
      return {
        totalWebsites: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalFollowers: 0,
        totalFollowing: 0,
        websitesByCategory: [],
        performanceOverTime: [],
        topWebsites: []
      };
    }

    // Get user's websites
    const userWebsitesQuery = query(
      collection(db, 'websites'),
      where('ownerId', '==', userId),
      where('status', '==', 'approved')
    );
    const userWebsitesSnapshot = await getDocs(userWebsitesQuery);
    
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    const categoryCount = new Map<string, number>();
    const topWebsites: TopWebsite[] = [];

    userWebsitesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      totalViews += data.views || 0;
      totalLikes += data.likes || 0;
      totalComments += data.commentCount || 0;
      
      // Count categories
      if (data.category) {
        categoryCount.set(data.category, (categoryCount.get(data.category) || 0) + 1);
      }
      
      // Collect top websites
      topWebsites.push({
        id: doc.id,
        title: data.title,
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.commentCount || 0
      });
    });

    // Sort top websites by performance (views + likes * 2)
    topWebsites.sort((a, b) => 
      (b.views + b.likes * 2) - (a.views + a.likes * 2)
    );

    // Get follower counts
    const [followersSnapshot, followingSnapshot] = await Promise.all([
      getCountFromServer(query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      )),
      getCountFromServer(query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      ))
    ]);

    const totalWebsites = userWebsitesSnapshot.docs.length;
    const websitesByCategory: CategoryStats[] = Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalWebsites) * 100
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalWebsites,
      totalViews,
      totalLikes,
      totalComments,
      totalFollowers: followersSnapshot.data().count,
      totalFollowing: followingSnapshot.data().count,
      websitesByCategory,
      performanceOverTime: [], // Simplified for demo
      topWebsites: topWebsites.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}

// Get recent activity
async function getRecentActivity(): Promise<ActivityData[]> {
  try {
    if (!db) {
      return [];
    }

    // Get recent websites - fallback to simple query if composite index is still building
    let recentWebsitesQuery;
    let recentWebsitesSnapshot;
    
    try {
      // Primary query with composite index
      recentWebsitesQuery = query(
        collection(db, 'websites'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      recentWebsitesSnapshot = await getDocs(recentWebsitesQuery);
    } catch {
      console.log('Composite index not ready, falling back to simple query');
      // Fallback query without status filter
      recentWebsitesQuery = query(
        collection(db, 'websites'),
        orderBy('createdAt', 'desc'),
        limit(20) // Get more to filter manually
      );
      recentWebsitesSnapshot = await getDocs(recentWebsitesQuery);
    }
    
    const activities: ActivityData[] = [];

    for (const doc of recentWebsitesSnapshot.docs) {
      const data = doc.data();
      
      // Manual status filter if using fallback query
      if (data.status !== 'approved') continue;
      if (activities.length >= 10) break;
      
      // Get website owner
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('uid', '==', data.ownerId)
      ));
      
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        
        activities.push({
          id: doc.id,
          type: 'website_created',
          title: `${userData.displayName || 'Anonim Kullanıcı'} yeni bir website ekledi: ${data.title}`,
          user: {
            displayName: userData.displayName || 'Anonim Kullanıcı',
            photoURL: userData.photoURL
          },
          createdAt: data.createdAt,
          websiteId: doc.id
        });
      }
    }

    return activities.sort((a, b) => 
      b.createdAt.toMillis() - a.createdAt.toMillis()
    ).slice(0, 5);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

// Get views over time (simplified)
async function getViewsOverTime(): Promise<TimeSeriesData[]> {
  // This would typically query a time-series database or pre-aggregated data
  // For demo purposes, we'll return sample data
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 500
    });
  }
  
  return data;
}

// Get likes over time (simplified)
async function getLikesOverTime(): Promise<TimeSeriesData[]> {
  // This would typically query a time-series database or pre-aggregated data
  // For demo purposes, we'll return sample data
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 200) + 50
    });
  }
  
  return data;
}

// Generate session ID for tracking
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}; 