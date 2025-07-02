"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { addComment } from "@/lib/comments";
import { toast } from "sonner";

interface CommentFormProps {
  websiteId: string;
  parentId?: string;
  onCommentAdded?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  websiteId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder,
  autoFocus = false
}: CommentFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('comments.loginRequired'));
      return;
    }

    if (!content.trim()) {
      toast.error(t('comments.contentRequired'));
      return;
    }

    if (content.trim().length < 3) {
      toast.error(t('comments.contentTooShort'));
      return;
    }

    if (content.trim().length > 1000) {
      toast.error(t('comments.contentTooLong'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      await addComment(
        websiteId,
        content.trim(),
        user.uid,
        user.displayName || t('common.anonymousUser'),
        user.photoURL || undefined,
        parentId
      );

      setContent("");
      toast.success(parentId ? t('comments.replyAdded') : t('comments.commentAdded'));
      
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(t('comments.addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    if (onCancel) {
      onCancel();
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          {t('comments.loginToComment')}
        </p>
        <Button asChild variant="outline" size="sm">
          <a href="/login">{t('nav.login')}</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={user.photoURL || ''} alt={user.displayName || user.email} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 
             user.email ? user.email.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || (parentId ? t('comments.replyPlaceholder') : t('comments.commentPlaceholder'))}
            className="min-h-[80px] resize-none"
            maxLength={1000}
            autoFocus={autoFocus}
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {content.length}/1000
            </span>
            
            <div className="flex space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('common.cancel')}
                </Button>
              )}
              
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isSubmitting || content.length > 1000}
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    {parentId ? t('comments.reply') : t('comments.comment')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 