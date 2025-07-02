"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/ui/star-rating";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { submitRating } from "@/lib/ratings";
import { Rating } from "@/types/rating";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";

interface RatingFormProps {
  websiteId: string;
  existingRating?: Rating | null;
  onRatingSubmitted?: (rating: Rating) => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function RatingForm({
  websiteId,
  existingRating,
  onRatingSubmitted,
  onCancel,
  compact = false
}: RatingFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [review, setReview] = useState(existingRating?.review || "");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Star className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-4">
            {t('ratings.loginToRate')}
          </p>
          <Button variant="outline" size="sm">
            {t('auth.signIn')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('ratings.selectRating'));
      return;
    }

    setLoading(true);
    
    try {
      const result = await submitRating(
        { websiteId, rating, review: review.trim() || undefined },
        user.uid,
        user.displayName || user.email || "Anonymous",
        user.photoURL || undefined
      );

      if (result.success) {
        toast.success(
          result.isNew 
            ? t('ratings.ratingSubmitted')
            : t('ratings.ratingUpdated')
        );
        
        // Call callback with updated rating
        if (onRatingSubmitted) {
          const newRating: Rating = {
            id: "temp", // Will be updated by parent
            websiteId,
            userId: user.uid,
            userDisplayName: user.displayName || user.email || "Anonymous",
            userPhotoURL: user.photoURL || undefined,
            rating,
            review: review.trim() || undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          onRatingSubmitted(newRating);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(t('ratings.submitError'));
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || ""} />
          <AvatarFallback>
            {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <StarRating
            value={rating}
            onChange={setRating}
            size="sm"
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          size="sm"
          className="h-8"
        >
          {loading ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
        
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="h-8"
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.photoURL || ""} />
            <AvatarFallback>
              {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <CardTitle className="text-lg">
              {existingRating ? t('ratings.updateRating') : t('ratings.rateWebsite')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('ratings.shareExperience')}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t('ratings.yourRating')}
          </label>
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
            showValue={rating > 0}
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t('ratings.review')} 
            <span className="text-muted-foreground font-normal">
              ({t('common.optional')})
            </span>
          </label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={t('ratings.reviewPlaceholder')}
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {review.length}/500 {t('common.characters')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                {t('common.submitting')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {existingRating ? t('ratings.updateRating') : t('ratings.submitRating')}
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
            >
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
