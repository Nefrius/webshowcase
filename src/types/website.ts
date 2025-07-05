export interface Website {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  category: WebsiteCategory;
  technologies: Technology[];
  purpose: WebsitePurpose;
  ownerId: string;
  ownerName: string;
  isPremium: boolean;
  featured: boolean;
  isSponsored?: boolean;
  views: number;
  likes: number;
  commentCount?: number;
  averageRating?: number;
  totalRatings?: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum WebsiteCategory {
  ECOMMERCE = "ecommerce",
  PORTFOLIO = "portfolio", 
  BLOG = "blog",
  CORPORATE = "corporate",
  LANDING = "landing",
  DASHBOARD = "dashboard",
  SOCIAL = "social",
  EDUCATIONAL = "educational",
  NEWS = "news",
  OTHER = "other"
}

export enum Technology {
  // Frontend Frameworks
  REACT = "react",
  VUE = "vue",
  ANGULAR = "angular",
  NEXTJS = "nextjs",
  NUXTJS = "nuxtjs",
  SVELTE = "svelte",
  
  // Backend
  NODEJS = "nodejs",
  PYTHON = "python",
  PHP = "php",
  JAVA = "java",
  CSHARP = "csharp",
  RUBY = "ruby",
  
  // CSS Frameworks
  TAILWIND = "tailwind",
  BOOTSTRAP = "bootstrap",
  BULMA = "bulma",
  CHAKRA = "chakra",
  
  // Databases
  MONGODB = "mongodb",
  MYSQL = "mysql",
  POSTGRESQL = "postgresql",
  FIREBASE = "firebase",
  SUPABASE = "supabase",
  
  // Other
  WORDPRESS = "wordpress",
  WEBFLOW = "webflow",
  SHOPIFY = "shopify",
  REACT_NATIVE = "react-native",
  FLUTTER = "flutter"
}

export enum WebsitePurpose {
  BUSINESS = "business",
  PERSONAL = "personal", 
  STARTUP = "startup",
  AGENCY = "agency",
  FREELANCE = "freelance",
  EDUCATION = "education",
  NON_PROFIT = "non-profit",
  GOVERNMENT = "government",
  OTHER = "other"
}

export interface WebsiteFilters {
  category?: WebsiteCategory;
  technologies?: Technology[];
  purpose?: WebsitePurpose;
  isPremium?: boolean;
  search?: string;
  sortBy?: 'recent' | 'popular' | 'views' | 'likes';
} 