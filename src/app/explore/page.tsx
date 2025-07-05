"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Grid, 
  List, 
  Filter, 
  RefreshCw, 
  Eye,
  ThumbsUp,
  TrendingUp,
  Crown,
  ChevronDown
} from "lucide-react";
import { Website } from "@/types/website";
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WebsiteFilters {
  category: string;
  sortBy: 'recent' | 'popular' | 'views';
  searchTerm: string;
}

export default function ExplorePage() {
  const { t } = useLanguage();
  const router = useRouter();

  
  // Website states
  const [websites, setWebsites] = useState<Website[]>([]);
  const [topWebsites, setTopWebsites] = useState<Website[]>([]);
  const [websiteLoading, setWebsiteLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [websiteFilters, setWebsiteFilters] = useState<WebsiteFilters>({
    category: 'all',
    sortBy: 'recent',
    searchTerm: ''
  });

  // Load data on mount
  useEffect(() => {
    loadWebsites();
    loadTopMonthlyWebsites();
  }, []);

  useEffect(() => {
    loadWebsites();
  }, [websiteFilters]);

  const loadWebsites = async () => {
    setWebsiteLoading(true);
    try {
      if (!db) {
        console.error('Firebase not initialized');
        setWebsiteLoading(false);
        return;
      }

      let websitesQuery = query(collection(db, 'websites'));

      // Apply filters
      if (websiteFilters.category !== 'all') {
        websitesQuery = query(websitesQuery, where('category', '==', websiteFilters.category));
      }

      // Apply sorting
      switch (websiteFilters.sortBy) {
        case 'popular':
          websitesQuery = query(websitesQuery, orderBy('likes', 'desc'), limit(50));
          break;
        case 'views':
          websitesQuery = query(websitesQuery, orderBy('views', 'desc'), limit(50));
          break;
        case 'recent':
        default:
          websitesQuery = query(websitesQuery, orderBy('createdAt', 'desc'), limit(50));
          break;
      }

      const snapshot = await getDocs(websitesQuery);
      let websitesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Website[];

      // Apply search filter
      if (websiteFilters.searchTerm) {
        const searchLower = websiteFilters.searchTerm.toLowerCase();
        websitesData = websitesData.filter(website =>
          website.title.toLowerCase().includes(searchLower) ||
          website.description.toLowerCase().includes(searchLower) ||
          website.ownerName.toLowerCase().includes(searchLower)
        );
      }

      setWebsites(websitesData);
    } catch (error) {
      console.error('Error loading websites:', error);
      toast.error(t('explore.errors.loadWebsites'));
    } finally {
      setWebsiteLoading(false);
    }
  };

  const loadTopMonthlyWebsites = async () => {
    try {
      if (!db) return;

      // Get top viewed websites this month
      
      const topQuery = query(
        collection(db, 'websites'),
        orderBy('views', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(topQuery);
      const topData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Website[];

      setTopWebsites(topData);
    } catch (error) {
      console.error('Error loading top websites:', error);
    }
  };

  const handleRefresh = () => {
    loadWebsites();
    loadTopMonthlyWebsites();
  };

  const handleWebsiteFilterChange = (key: keyof WebsiteFilters, value: string) => {
    setWebsiteFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTimeAgo = (date: Date | Timestamp) => {
    const now = new Date();
    
    // Handle Firestore Timestamp objects
    let dateObj: Date;
    if (date instanceof Timestamp) {
      // It's a Firestore Timestamp
      dateObj = date.toDate();
    } else {
      // It's a Date object
      dateObj = date;
    }
    
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t('common.today');
    if (diffInDays === 1) return t('common.yesterday');
    return t('common.daysAgo', { days: diffInDays.toString() });
  };

  const getTechnologyColor = (tech: string) => {
    const colors: Record<string, string> = {
      'react': 'bg-blue-100 text-blue-800',
      'vue': 'bg-green-100 text-green-800',
      'angular': 'bg-red-100 text-red-800',
      'next.js': 'bg-gray-100 text-gray-800',
      'nuxt': 'bg-green-100 text-green-800',
      'svelte': 'bg-orange-100 text-orange-800',
      'typescript': 'bg-blue-100 text-blue-800',
      'javascript': 'bg-yellow-100 text-yellow-800',
      'html': 'bg-orange-100 text-orange-800',
      'css': 'bg-blue-100 text-blue-800',
      'tailwind': 'bg-cyan-100 text-cyan-800',
      'bootstrap': 'bg-purple-100 text-purple-800',
      'node.js': 'bg-green-100 text-green-800',
      'python': 'bg-yellow-100 text-yellow-800',
      'php': 'bg-purple-100 text-purple-800',
      'laravel': 'bg-red-100 text-red-800',
      'wordpress': 'bg-blue-100 text-blue-800',
    };
    return colors[tech.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const categoryLabels = {
    'personal': t('explore.categories.personal'),
    'business': t('explore.categories.business'),
    'portfolio': t('explore.categories.portfolio'),
    'blog': t('explore.categories.blog'),
    'ecommerce': t('explore.categories.ecommerce'),
    'education': t('explore.categories.education'),
    'nonprofit': t('explore.categories.nonprofit'),
    'other': t('explore.categories.other'),
    'corporate': t('explore.categories.corporate'),
    'landing': t('explore.categories.landing'),
    'dashboard': t('explore.categories.dashboard'),
    'social': t('explore.categories.social'),
    'educational': t('explore.categories.educational'),
    'news': t('explore.categories.news')
  };

  const websiteSortOptions = [
    { value: 'recent', label: t('explore.sortRecent') },
    { value: 'popular', label: t('explore.sortPopular') },
    { value: 'views', label: t('explore.sortViews') }
  ];

  const renderWebsiteGrid = () => {
    if (websiteLoading) {
      return (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {websites.map((website) => (
          <motion.div
            key={website.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className={`h-full hover:shadow-lg transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'flex flex-row' : ''
              }`} 
              onClick={() => router.push(`/website/${website.id}`)}
            >
              {/* Website Preview Image */}
              {website.imageUrl && (
                <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'} relative overflow-hidden`}>
                  <Image 
                    src={website.imageUrl} 
                    alt={website.title}
                    fill
                    className="object-cover rounded-t-lg hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {website.isSponsored && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      Sponsored
                    </Badge>
                  )}
                </div>
              )}
              
              <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-1">
                      {website.title}
                      {website.isSponsored && !website.imageUrl && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Sponsored
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {website.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="space-y-3">
                  {/* Category and stats */}
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">
                      {website.category && categoryLabels[website.category as keyof typeof categoryLabels] 
                        ? categoryLabels[website.category as keyof typeof categoryLabels]
                        : t('explore.categories.notSelected')}
                    </Badge>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{website.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{website.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Technologies */}
                  {website.technologies && website.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {website.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className={`text-xs ${getTechnologyColor(tech)}`}>
                          {tech}
                        </Badge>
                      ))}
                      {website.technologies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{website.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Creator and date */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={''} />
                        <AvatarFallback className="text-xs">
                          {website.ownerName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>by {website.ownerName?.split(' ')[0] || 'Anonymous'}</span>
                    </div>
                    <span>{getTimeAgo(website.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('explore.title')}</h1>
        <p className="text-muted-foreground">{t('explore.subtitle')}</p>
      </div>

      {/* Bu Ay En Fazla Görüntülenen */}
      <div className="mb-12 relative">
        {/* Background with elegant grayscale gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 via-gray-500/10 to-gray-900/10 rounded-3xl blur-xl"></div>
        
        <div className="relative z-10 p-8 text-white">
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {t('explore.monthlyMostViewed')}
              </h2>
            </motion.div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              En popüler ve en çok görüntülenen web sitelerini keşfedin
            </p>
          </div>

          {/* Top Websites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {topWebsites.map((website, index) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative group"
              >
                <Card 
                  className="h-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-2xl hover:scale-105"
                  onClick={() => router.push(`/website/${website.id}`)}
                >
                  {/* Ranking Badge with Crown for #1 */}
                  <div className="absolute top-3 left-3 z-20">
                    {index === 0 && (
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        <Crown className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <Badge className={`${
                      index === 0 ? 'bg-gradient-to-r from-white to-gray-100 text-black shadow-lg' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-lg' : 
                      index === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg' : 
                      'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                    } font-bold text-sm px-3 py-1 ring-2 ring-white/30`}>
                      #{index + 1}
                    </Badge>
                  </div>

                  {/* Website Image */}
                  {website.imageUrl && (
                    <div className="w-full h-36 relative overflow-hidden">
                      <Image 
                        src={website.imageUrl} 
                        alt={website.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                      {website.title}
                    </h3>
                    
                    {/* Stats with elegant icons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-white/80">
                        <div className="p-1 bg-white/20 rounded-full border border-white/20">
                          <Eye className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium">{website.views?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/80">
                        <div className="p-1 bg-white/20 rounded-full border border-white/20">
                          <ThumbsUp className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium">{website.likes?.toLocaleString() || '0'}</span>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700/20 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mt-8"
          >
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 px-8 py-3 text-lg font-semibold shadow-lg"
              onClick={() => {
                const websitesSection = document.getElementById('websites-section');
                websitesSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Tüm Web Sitelerini Gör
              <ChevronDown className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div id="websites-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">{t('explore.websitesTitle')}</h2>
            <p className="text-muted-foreground">{t('explore.websitesSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm" 
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Website Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('explore.searchPlaceholder')}
                  value={websiteFilters.searchTerm}
                  onChange={(e) => handleWebsiteFilterChange('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={websiteFilters.category} onValueChange={(value) => handleWebsiteFilterChange('category', value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('explore.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explore.allCategories')}</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={websiteFilters.sortBy} onValueChange={(value) => handleWebsiteFilterChange('sortBy', value as 'recent' | 'popular' | 'views')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('explore.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {websiteSortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleRefresh} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Website Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {websites.length} {t('explore.websitesFound')}
          </p>
        </div>

        {/* Websites grid */}
        {renderWebsiteGrid()}

        {/* No website results */}
        {!websiteLoading && websites.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('explore.noWebsites')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('explore.adjustFilters')}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              {t('explore.refresh')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 