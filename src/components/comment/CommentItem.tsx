"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Heart, MessageCircle, MoreVertical, Edit2, Trash2, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CommentThread } from "@/types/comment";
import { toggleCommentLike, deleteComment, updateComment } from "@/lib/comments";
import { hasModeratorPermissions } from "@/lib/moderation";
import { toast } from "sonner";
import CommentForm from "./CommentForm";
import { Textarea } from "@/components/ui/textarea";

interface CommentItemProps {
  thread: CommentThread;
  websiteId: string;
  onCommentUpdate?: () => void;
  depth?: number;
}

export default function CommentItem({ 
  thread, 
  websiteId, 
  onCommentUpdate,
  depth = 0 
}: CommentItemProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { comment, replies } = thread;
  
  const [isLiked, setIsLiked] = useState(
    user ? comment.likedBy.includes(user.uid) : false
  );
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateLocale = language === 'tr' ? tr : enUS;
  const isOwner = user?.uid === comment.userId;
  const canModerate = user && hasModeratorPermissions(user);
  const canEdit = isOwner;
  const canDelete = isOwner || canModerate;

  const handleLike = async () => {
    if (!user) {
      toast.error(t('comments.loginRequired'));
      return;
    }

    try {
      const result = await toggleCommentLike(comment.id, user.uid);
      setIsLiked(result.liked);
      setLikeCount(result.newLikeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(t('comments.likeError'));
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent.trim() === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    if (editContent.trim().length < 3) {
      toast.error(t('comments.contentTooShort'));
      return;
    }

    if (editContent.trim().length > 1000) {
      toast.error(t('comments.contentTooLong'));
      return;
    }

    try {
      setIsSubmitting(true);
      await updateComment(comment.id, editContent.trim(), user!.uid);
      setIsEditing(false);
      toast.success(t('comments.commentUpdated'));
      
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(t('comments.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('comments.deleteConfirm'))) {
      return;
    }

    try {
      await deleteComment(comment.id, user!.uid, user || undefined);
      toast.success(t('comments.commentDeleted'));
      
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(t('comments.deleteError'));
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    toast.info(t('comments.reportSubmitted'));
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    setShowReplies(true);
    if (onCommentUpdate) {
      onCommentUpdate();
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.userPhotoURL || ''} alt={comment.userDisplayName} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
            {comment.userDisplayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.userDisplayName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(comment.createdAt, { 
                    addSuffix: true, 
                    locale: dateLocale 
                  })}
                </span>
                {comment.updatedAt > comment.createdAt && (
                  <span className="text-xs text-gray-400">
                    ({t('comments.edited')})
                  </span>
                )}
              </div>

              {user && (canEdit || canDelete || !isOwner) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        {t('comments.edit')}
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('comments.delete')}
                      </DropdownMenuItem>
                    )}
                    {!isOwner && (
                      <DropdownMenuItem onClick={handleReport}>
                        <Flag className="h-4 w-4 mr-2" />
                        {t('comments.report')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                  maxLength={1000}
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {editContent.length}/1000
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                      disabled={isSubmitting}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleEdit}
                      disabled={isSubmitting || !editContent.trim() || editContent.length > 1000}
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        t('common.save')
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`text-xs h-8 ${isLiked ? 'text-red-600' : 'text-gray-500'}`}
                disabled={!user}
              >
                <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount > 0 && likeCount}
                {likeCount === 0 ? t('comments.like') : ''}
              </Button>

              {user && depth < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-gray-500 h-8"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {t('comments.reply')}
                </Button>
              )}

              {replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs text-gray-500 h-8"
                >
                  {showReplies ? t('comments.hideReplies') : t('comments.showReplies')} ({replies.length})
                </Button>
              )}
            </div>
          )}

          {showReplyForm && depth < 3 && (
            <div className="mt-3">
              <CommentForm
                websiteId={websiteId}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                autoFocus={true}
              />
            </div>
          )}

          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((replyThread) => (
                <CommentItem
                  key={replyThread.comment.id}
                  thread={replyThread}
                  websiteId={websiteId}
                  onCommentUpdate={onCommentUpdate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 