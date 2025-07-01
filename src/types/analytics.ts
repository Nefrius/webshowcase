// Analytics Event Types
export enum AnalyticsEventType {
  WEBSITE_VIEW = 'website_view',
  WEBSITE_CLICK = 'website_click', 
  WEBSITE_LIKE = 'website_like',
  WEBSITE_SHARE = 'website_share',
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied'
}

// Analytics Event Interface
export interface AnalyticsEvent {
  id?: string;
  type: AnalyticsEventType;
  userId?: string;
  websiteId?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

// Website Analytics Stats
export interface WebsiteAnalytics {
  websiteId: string;
  totalViews: number;
  totalLikes: number;
  totalClicks: number;
  totalShares: number;
  uniqueVisitors: number;
  conversionRate: number;
  lastViewed: Date;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topReferrers: string[];
  averageTimeOnSite: number;
}

// User Analytics Stats
export interface UserAnalytics {
  userId: string;
  totalWebsites: number;
  totalViews: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  profileViews: number;
  engagementRate: number;
  popularWebsite: {
    id: string;
    title: string;
    views: number;
  } | null;
  joinDate: Date;
  lastActive: Date;
}

// Platform Analytics Stats
export interface PlatformAnalytics {
  totalUsers: number;
  totalWebsites: number;
  totalViews: number;
  totalLikes: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  websitesAddedToday: number;
  websitesAddedThisWeek: number;
  websitesAddedThisMonth: number;
  popularTechnologies: Array<{
    technology: string;
    count: number;
    percentage: number;
  }>;
  popularCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  userGrowthRate: number;
  websiteGrowthRate: number;
  avgWebsitesPerUser: number;
}

// Analytics Dashboard Filters
export interface AnalyticsFilters {
  startDate: Date;
  endDate: Date;
  websiteId?: string;
  userId?: string;
  eventType?: AnalyticsEventType;
  technology?: string;
  category?: string;
}

// Analytics Response Types
export interface AnalyticsResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  metadata?: {
    totalRecords: number;
    filteredRecords: number;
    lastUpdate: Date;
  };
}

// Time Series Data Point
export interface TimeSeriesPoint {
  date: string; // ISO date string
  value: number;
  label?: string;
}

// Chart Data Interface
export interface ChartData {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: TimeSeriesPoint[];
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
} 