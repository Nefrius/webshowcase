export interface Rating {
  id: string;
  websiteId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  rating: number; // 1-5 stars
  review?: string; // Optional text review
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteRatingStats {
  websiteId: string;
  totalRatings: number;
  averageRating: number; // 0-5 with decimals
  ratingDistribution: {
    1: number; // Count of 1-star ratings
    2: number; // Count of 2-star ratings
    3: number; // Count of 3-star ratings
    4: number; // Count of 4-star ratings
    5: number; // Count of 5-star ratings
  };
  lastUpdated: Date;
}

export interface RatingFilters {
  websiteId: string;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  ratingFilter?: number; // Filter by specific star rating (1-5)
  withReviews?: boolean; // Only show ratings with text reviews
  limit?: number;
}

export interface UserRatingHistory {
  userId: string;
  totalRatings: number;
  averageGiven: number; // Average rating this user gives
  ratings: Rating[];
}

export interface RatingSubmission {
  websiteId: string;
  rating: number; // 1-5
  review?: string; // Optional text review
}

export interface RatingStatsSummary {
  totalRatings: number;
  averageRating: number;
  highestRated: {
    websiteId: string;
    websiteTitle: string;
    rating: number;
  }[];
  recentRatings: Rating[];
} 