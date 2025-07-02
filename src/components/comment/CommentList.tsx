"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, ArrowUpDown, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CommentThread } from "@/types/comment";
import { subscribeToComments } from "@/lib/comments";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentListProps {
  websiteId: string;
}

export default function CommentList({ websiteId }: CommentListProps) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = subscribeToComments(
      websiteId,
      (newComments) => {
        setComments(newComments);
        setLoading(false);
        setRefreshing(false);
      },
      { sortBy }
    );

    return unsubscribe;
  }, [websiteId, sortBy]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'newest' | 'oldest' | 'most-liked');
    setRefreshing(true);
  };

  const handleCommentAdded = () => {
    // Real-time subscription will handle the update
    setRefreshing(true);
  };

  const handleCommentUpdate = () => {
    // Real-time subscription will handle the update
    setRefreshing(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // The useEffect will handle the refresh
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('comments.title')} ({comments.length})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('comments.sortNewest')}</SelectItem>
              <SelectItem value="oldest">{t('comments.sortOldest')}</SelectItem>
              <SelectItem value="most-liked">{t('comments.sortMostLiked')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-600 dark:text-gray-400"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <CommentForm
          websiteId={websiteId}
          onCommentAdded={handleCommentAdded}
          placeholder={t('comments.addComment')}
        />
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((thread) => (
            <div
              key={thread.comment.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <CommentItem
                thread={thread}
                websiteId={websiteId}
                onCommentUpdate={handleCommentUpdate}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('comments.noComments')}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('comments.beFirstToComment')}
          </p>
        </div>
      )}

      {/* Load More Button (if needed in the future) */}
      {comments.length >= 50 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            {t('comments.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
} 