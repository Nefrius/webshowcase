"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StarRating, { RatingDistribution } from "@/components/ui/star-rating";
import RatingForm from "./RatingForm";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  getWebsiteRatings, 
  getWebsiteRatingStats, 
  getUserRating,
  subscribeToWebsiteRatings 
} from "@/lib/ratings";
import { Rating, WebsiteRatingStats } from "@/types/rating";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Star, Filter, Edit, TrendingUp } from "lucide-react";

interface RatingListProps {
  websiteId: string;
}

export default function RatingList({ websiteId }: RatingListProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<WebsiteRatingStats | null>(null);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  // Filters
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterRating, setFilterRating] = useState<number | undefined>();
  const [withReviews, setWithReviews] = useState(false);

  const dateLocale = language === 'tr' ? tr : enUS;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load rating statistics
        const statsData = await getWebsiteRatingStats(websiteId);
        setStats(statsData);

        // Load user's rating if logged in
        if (user?.uid) {
          const userRatingData = await getUserRating(websiteId, user.uid);
          setUserRating(userRatingData);
        }

        // Load ratings with current filters
        const ratingsData = await getWebsiteRatings({
          websiteId,
          sortBy,
          ratingFilter: filterRating,
          withReviews,
          limit: 20
        });
        setRatings(ratingsData);
      } catch (error) {
        console.error('Error loading rating data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [websiteId, user?.uid, sortBy, filterRating, withReviews]);

  // Real-time subscription for ratings
  useEffect(() => {
    const unsubscribe = subscribeToWebsiteRatings(
      websiteId,
      (newRatings) => {
        setRatings(newRatings);
      },
      { sortBy, ratingFilter: filterRating, withReviews }
    );

    return unsubscribe;
  }, [websiteId, sortBy, filterRating, withReviews]);

  const handleRatingSubmitted = (newRating: Rating) => {
    setUserRating(newRating);
    setShowRatingForm(false);
    // Reload stats
    getWebsiteRatingStats(websiteId).then(setStats);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t('common.loading')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('ratings.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating
                  value={stats.averageRating}
                  readonly
                  size="lg"
                  className="justify-center mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  {stats.totalRatings} {stats.totalRatings === 1 ? t('ratings.star') : t('ratings.stars')}
                </p>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium mb-3">{t('ratings.distribution')}</h4>
                <RatingDistribution
                  distribution={stats.ratingDistribution}
                  totalRatings={stats.totalRatings}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Rating Form */}
      {user && (
        <div>
          {userRating && !showRatingForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t('ratings.yourRating')}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRatingForm(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('ratings.updateRating')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <StarRating value={userRating.rating} readonly size="md" />
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(userRating.createdAt, { 
                      addSuffix: true, 
                      locale: dateLocale 
                    })}
                  </span>
                </div>
                {userRating.review && (
                  <p className="text-sm">{userRating.review}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            showRatingForm || !userRating ? (
              <RatingForm
                websiteId={websiteId}
                existingRating={userRating}
                onRatingSubmitted={handleRatingSubmitted}
                onCancel={() => setShowRatingForm(false)}
              />
            ) : null
          )}
        </div>
      )}

      {/* Rating Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('ratings.filterBy')}
            </CardTitle>
            <Badge variant="outline">
              {ratings.length} {t('common.ratings')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Sort By */}
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">
                {t('ratings.sortBy')}
              </label>
              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'highest' | 'lowest') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('ratings.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('ratings.oldest')}</SelectItem>
                  <SelectItem value="highest">{t('ratings.highest')}</SelectItem>
                  <SelectItem value="lowest">{t('ratings.lowest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Rating */}
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">
                {t('ratings.filterBy')}
              </label>
              <Select 
                value={filterRating?.toString() || "all"} 
                onValueChange={(value) => setFilterRating(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('ratings.allRatings')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('ratings.allRatings')}</SelectItem>
                  <SelectItem value="5">5 {t('ratings.stars')}</SelectItem>
                  <SelectItem value="4">4 {t('ratings.stars')}</SelectItem>
                  <SelectItem value="3">3 {t('ratings.stars')}</SelectItem>
                  <SelectItem value="2">2 {t('ratings.stars')}</SelectItem>
                  <SelectItem value="1">1 {t('ratings.star')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* With Reviews Filter */}
            <div className="flex items-end">
              <Button
                variant={withReviews ? "default" : "outline"}
                size="sm"
                onClick={() => setWithReviews(!withReviews)}
                className="h-10"
              >
                {t('ratings.withReviews')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">{t('ratings.noRatings')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('ratings.beFirstToRate')}
              </p>
              {user && !userRating && (
                <Button onClick={() => setShowRatingForm(true)}>
                  {t('ratings.rateWebsite')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={rating.userPhotoURL || ""} />
                    <AvatarFallback>
                      {rating.userDisplayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rating.userDisplayName}</span>
                      <StarRating value={rating.rating} readonly size="sm" />
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(rating.createdAt, { 
                          addSuffix: true, 
                          locale: dateLocale 
                        })}
                      </span>
                    </div>
                    
                    {rating.review && (
                      <p className="text-sm leading-relaxed">{rating.review}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 