"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, Eye, User, ExternalLink, Star, MessageCircle } from "lucide-react";
import { CompactStarRating } from "@/components/ui/star-rating";
import { Website, WebsiteCategory, Technology } from "@/types/website";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { likeWebsite, checkUserLiked } from "@/lib/social";
import BookmarkButton from "@/components/bookmark/BookmarkButton";

interface WebsiteCardProps {
  website: Website;
  onLikeUpdate?: (websiteId: string, newLikes: number) => void;
}

const technologyLabels = {
  [Technology.REACT]: "React",
  [Technology.VUE]: "Vue.js",
  [Technology.ANGULAR]: "Angular",
  [Technology.NEXTJS]: "Next.js",
  [Technology.NUXTJS]: "Nuxt.js",
  [Technology.SVELTE]: "Svelte",
  [Technology.NODEJS]: "Node.js",
  [Technology.PYTHON]: "Python",
  [Technology.PHP]: "PHP",
  [Technology.JAVA]: "Java",
  [Technology.CSHARP]: "C#",
  [Technology.RUBY]: "Ruby",
  [Technology.TAILWIND]: "Tailwind CSS",
  [Technology.BOOTSTRAP]: "Bootstrap",
  [Technology.BULMA]: "Bulma",
  [Technology.CHAKRA]: "Chakra UI",
  [Technology.MONGODB]: "MongoDB",
  [Technology.MYSQL]: "MySQL",
  [Technology.POSTGRESQL]: "PostgreSQL",
  [Technology.FIREBASE]: "Firebase",
  [Technology.SUPABASE]: "Supabase",
  [Technology.WORDPRESS]: "WordPress",
  [Technology.WEBFLOW]: "Webflow",
  [Technology.SHOPIFY]: "Shopify",
  [Technology.REACT_NATIVE]: "React Native",
  [Technology.FLUTTER]: "Flutter"
};

export default function WebsiteCard({ website, onLikeUpdate }: WebsiteCardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

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
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(website.likes);
  const [isLiking, setIsLiking] = useState(false);

  // Check if user liked this website
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user?.uid) {
        try {
          const liked = await checkUserLiked(website.id, user.uid);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    checkLikeStatus();
  }, [website.id, user?.uid]);

  // Navigate to website detail page
  const handleCardClick = () => {
    router.push(`/website/${website.id}`);
  };

  // Open external website
  const handleVisitExternal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(website.url, '_blank', 'noopener,noreferrer');
  };

  // Handle like/unlike
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      const result = await likeWebsite(website.id, user.uid);
      
      if (result.success) {
        setIsLiked(result.liked);
        const newLikesCount = result.liked ? likesCount + 1 : likesCount - 1;
        setLikesCount(newLikesCount);
        
        if (onLikeUpdate) {
          onLikeUpdate(website.id, newLikesCount);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {website.title}
                </CardTitle>
                {website.isPremium && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {website.featured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-3 w-3" />
                <span>{website.ownerName}</span>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[website.category]}
                </Badge>
              </div>
            </div>
          </div>

          <CardDescription className="line-clamp-2">
            {website.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Website Preview Image */}
          {website.imageUrl ? (
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <Image
                src={website.imageUrl} 
                alt={website.title}
                width={400}
                height={225}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Technologies */}
          {website.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {website.technologies.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {technologyLabels[tech]}
                </Badge>
              ))}
              {website.technologies.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{website.technologies.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{website.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likesCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{(website.commentCount || 0).toLocaleString()}</span>
              </div>
              {website.averageRating && website.totalRatings && website.totalRatings > 0 && (
                <CompactStarRating
                  value={website.averageRating}
                  count={website.totalRatings}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <BookmarkButton
                websiteId={website.id}
                variant="bookmark"
                size="sm"
              />
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLike}
                disabled={isLiking}
                className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                onClick={handleVisitExternal}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                {t('common.visit')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 