export interface Bookmark {
  id: string;
  userId: string;
  websiteId: string;
  collectionName: string;
  createdAt: Date;
  note?: string;
  websiteTitle?: string; // Cache for display
  websiteImageUrl?: string; // Cache for display
  websiteUrl?: string; // Cache for display
}

export interface BookmarkCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt: Date;
  color?: string; // For UI customization
  icon?: string; // Emoji or icon name
}

export interface BookmarkStats {
  totalBookmarks: number;
  totalCollections: number;
  mostPopularCollection: string;
  recentlyAdded: Bookmark[];
}

export interface BookmarkFilters {
  collectionName?: string;
  searchTerm?: string;
  sortBy?: 'newest' | 'oldest' | 'alphabetical';
  limit?: number;
}

export interface CreateBookmarkRequest {
  websiteId: string;
  collectionName: string;
  note?: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  color?: string;
  icon?: string;
} 