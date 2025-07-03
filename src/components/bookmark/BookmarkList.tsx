"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Calendar,
  MoreVertical,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Bookmark } from "@/types/bookmark";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { removeBookmark } from "@/lib/bookmarks";
import { toast } from "sonner";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  viewMode: "grid" | "list";
  onBookmarkDeleted: () => void;
}

export default function BookmarkList({ 
  bookmarks, 
  viewMode, 
  onBookmarkDeleted 
}: BookmarkListProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteBookmark = async (bookmark: Bookmark) => {
    if (!confirm(t('bookmarks.confirmDelete'))) return;

    try {
      setDeletingId(bookmark.id);
      const result = await removeBookmark(bookmark.userId, bookmark.websiteId, bookmark.collectionName);

      if (result.success) {
        toast.success(t('bookmarks.deleteSuccess'));
        onBookmarkDeleted();
      } else {
        toast.error(result.error || t('bookmarks.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error(t('bookmarks.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenWebsite = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (bookmarks.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-muted-foreground mb-4">
            📖 {t('bookmarks.noBookmarks')}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {t('bookmarks.noBookmarksDescription')}
          </p>
          <Button onClick={() => router.push('/explore')}>
            {t('nav.explore')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-6 ${
      viewMode === "grid" 
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    }`}>
      {bookmarks.map((bookmark, index) => (
        <motion.div
          key={bookmark.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
            <CardContent className="p-0">
              {/* Website Image */}
              {bookmark.websiteImageUrl && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <Image
                    src={bookmark.websiteImageUrl}
                    alt={bookmark.websiteTitle || ''}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 
                      className="font-semibold text-lg group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                      onClick={() => router.push(`/website/${bookmark.websiteId}`)}
                    >
                      {bookmark.websiteTitle}
                    </h3>
                    <Badge variant="outline" className="mt-1">
                      {bookmark.collectionName}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenWebsite(bookmark.websiteUrl)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/website/${bookmark.websiteId}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('common.viewDetails')}
                        </DropdownMenuItem>
                                                 <DropdownMenuItem 
                           onClick={() => handleDeleteBookmark(bookmark)}
                           disabled={deletingId === bookmark.id}
                           className="text-red-600"
                         >
                           <Trash2 className="h-4 w-4 mr-2" />
                           {deletingId === bookmark.id ? t('common.deleting') : t('common.delete')}
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Note */}
                {bookmark.note && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {bookmark.note}
                  </p>
                )}
                
                {/* Date */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(bookmark.createdAt, {
                        addSuffix: true,
                        locale: language === 'tr' ? tr : enUS
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 