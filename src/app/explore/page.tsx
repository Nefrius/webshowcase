"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List } from "lucide-react";
import WebsiteGrid from "@/components/website/WebsiteGrid";
import { Website, WebsiteCategory } from "@/types/website";
import { getWebsites } from "@/lib/firestore";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ExplorePage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const categoryLabels = {
    [WebsiteCategory.ECOMMERCE]: t('explore.categories.ecommerce'),
    [WebsiteCategory.PORTFOLIO]: t('explore.categories.portfolio'), 
    [WebsiteCategory.BLOG]: t('explore.categories.blog'),
    [WebsiteCategory.CORPORATE]: t('explore.categories.corporate'),
    [WebsiteCategory.LANDING]: t('explore.categories.landing'),
    [WebsiteCategory.DASHBOARD]: t('explore.categories.dashboard'),
    [WebsiteCategory.SOCIAL]: t('explore.categories.social'),
    [WebsiteCategory.EDUCATIONAL]: t('explore.categories.educational'),
    [WebsiteCategory.NEWS]: t('explore.categories.news'),
    [WebsiteCategory.OTHER]: t('explore.categories.other')
  };

  // Load websites from Firestore
  const loadWebsites = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const filters = {
        category: selectedCategory !== "all" ? selectedCategory as WebsiteCategory : undefined,
        sortBy: sortBy as "recent" | "popular" | "views",
        search: searchTerm
      };

      let fetchedWebsites: Website[];
      
      if (searchTerm) {
        // For search, get more results and filter client-side
        // In production, consider using Algolia or ElasticSearch
        const allWebsites = await getWebsites({
          category: filters.category,
          sortBy: filters.sortBy
        }, 100);
        
        fetchedWebsites = allWebsites.filter(website =>
          website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          website.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          website.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        fetchedWebsites = await getWebsites(filters, 20);
      }

      setWebsites(fetchedWebsites);
    } catch (error) {
      console.error("Error loading websites:", error);
      setError(t('explore.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadWebsites();
    }, searchTerm ? 500 : 0); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, sortBy, loadWebsites]);

  // Handle like updates from WebsiteCard
  const handleLikeUpdate = (websiteId: string, newLikes: number) => {
    setWebsites(prev =>
      prev.map(website =>
        website.id === websiteId
          ? { ...website, likes: newLikes }
          : website
      )
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{t('explore.title')}</h1>
          <p className="text-muted-foreground">
            {t('explore.subtitle')}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadWebsites}
                className="ml-2"
              >
                {t('explore.tryAgain')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background border rounded-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('explore.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>

            {/* Category Filter */}
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={loading}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t('explore.categories.other')} />
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

            {/* Sort */}
            <Select 
              value={sortBy} 
              onValueChange={setSortBy}
              disabled={loading}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t('explore.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('explore.newest')}</SelectItem>
                <SelectItem value="popular">{t('explore.popular')}</SelectItem>
                <SelectItem value="views">{t('explore.mostViewed')}</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
                disabled={loading}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
                disabled={loading}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                &quot;{searchTerm}&quot; ✕
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
                {categoryLabels[selectedCategory as WebsiteCategory]} ✕
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {loading ? t('explore.loadingFromFirestore') : `${websites.length} ${t('explore.websitesFound')}`}
            </p>
            {!loading && websites.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadWebsites}
                disabled={loading}
              >
                {t('explore.refresh')}
              </Button>
            )}
          </div>

          <WebsiteGrid
            websites={websites}
            loading={loading}
            onLikeUpdate={handleLikeUpdate}
          />
        </motion.div>
      </div>
    </div>
  );
} 