"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // Current rating value (0-5)
  onChange?: (rating: number) => void; // Callback when rating changes
  readonly?: boolean; // Read-only mode for display
  size?: "sm" | "md" | "lg"; // Size variants
  showValue?: boolean; // Show numeric value next to stars
  showCount?: boolean; // Show number of ratings
  count?: number; // Number of ratings
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  showCount = false,
  count = 0,
  className
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const handleStarClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(displayValue);
          const isHalfFilled = star === Math.ceil(displayValue) && displayValue % 1 !== 0;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              className={cn(
                "relative transition-colors duration-150",
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default"
              )}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-150",
                  isFilled || isHalfFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300"
                )}
              />
              
              {/* Half star overlay */}
              {isHalfFilled && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(displayValue % 1) * 100}%` }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "fill-yellow-400 text-yellow-400"
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Show numeric value */}
      {showValue && (
        <span className={cn(
          "font-medium text-muted-foreground",
          textSizeClasses[size]
        )}>
          {value.toFixed(1)}
        </span>
      )}

      {/* Show rating count */}
      {showCount && count > 0 && (
        <span className={cn(
          "text-muted-foreground",
          textSizeClasses[size]
        )}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// Compact star rating for cards
export function CompactStarRating({
  value,
  count = 0,
  className
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  if (value === 0 || count === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-medium text-muted-foreground">
        {value.toFixed(1)}
        {count > 0 && (
          <span className="text-muted-foreground/70">
            ({count.toLocaleString()})
          </span>
        )}
      </span>
    </div>
  );
}

// Rating distribution bar chart
export function RatingDistribution({
  distribution,
  totalRatings,
  className
}: {
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  totalRatings: number;
  className?: string;
}) {
  if (totalRatings === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No ratings yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution];
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 w-8">
              <span className="font-medium">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <span className="text-muted-foreground w-8 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
} 