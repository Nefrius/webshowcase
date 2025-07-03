"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark as BookmarkIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { isBookmarked, addBookmark, removeBookmark, getUserCollections } from "@/lib/bookmarks";
import { BookmarkCollection } from "@/types/bookmark";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BookmarkButtonProps {
  websiteId: string;
  variant?: "heart" | "bookmark";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function BookmarkButton({
  websiteId,
  variant = "bookmark",
  size = "md",
  showText = false,
  className = ""
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createNewCollection, setCreateNewCollection] = useState(false);

  // Load initial bookmark status and collections
  useEffect(() => {
    if (user) {
      loadBookmarkStatus();
      loadCollections();
    }
  }, [user, websiteId]);

  const loadBookmarkStatus = async () => {
    if (!user) return;
    
    try {
      const bookmarked = await isBookmarked(user.uid, websiteId);
      setIsBookmarkedState(bookmarked);
    } catch (error) {
      console.error('Error loading bookmark status:', error);
    }
  };

  const loadCollections = async () => {
    if (!user) return;

    try {
      const userCollections = await getUserCollections(user.uid);
      setCollections(userCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleBookmarkClick = () => {
    if (!user) {
      toast.error(t('auth.loginRequired'));
      return;
    }

    if (isBookmarkedState) {
      // If already bookmarked, show removal options
      handleRemoveBookmark();
    } else {
      // Show add bookmark dialog
      setIsDialogOpen(true);
    }
  };

  const handleAddBookmark = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const collectionName = createNewCollection ? newCollectionName : selectedCollection;
      
      if (!collectionName) {
        toast.error(t('bookmarks.selectCollection'));
        return;
      }

      const result = await addBookmark(user.uid, {
        websiteId,
        collectionName,
        note
      });

      if (result.success) {
        setIsBookmarkedState(true);
        setIsDialogOpen(false);
        resetForm();
        toast.success(t('bookmarks.addedSuccessfully'));
        
        // Reload collections in case we created a new one
        await loadCollections();
      } else {
        toast.error(result.error || t('bookmarks.addFailed'));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error(t('bookmarks.addFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For simplicity, remove from "Favorites" collection
      // In a full implementation, you might want to show which collections it's in
      const result = await removeBookmark(user.uid, websiteId, "Favorites");

      if (result.success) {
        setIsBookmarkedState(false);
        toast.success(t('bookmarks.removedSuccessfully'));
      } else {
        toast.error(result.error || t('bookmarks.removeFailed'));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error(t('bookmarks.removeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCollection("");
    setNewCollectionName("");
    setNote("");
    setCreateNewCollection(false);
  };

  const getIcon = () => {
    const IconComponent = variant === "heart" ? Heart : BookmarkIcon;
    const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
    
    return (
      <IconComponent 
        className={`${iconSize} ${isBookmarkedState ? 'fill-current' : ''}`} 
      />
    );
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      default:
        return "default";
    }
  };

  const getButtonVariant = () => {
    return isBookmarkedState ? "default" : "outline";
  };

  const getButtonColor = () => {
    if (variant === "heart") {
      return isBookmarkedState ? "text-red-500" : "text-muted-foreground hover:text-red-500";
    }
    return isBookmarkedState ? "text-blue-500" : "text-muted-foreground hover:text-blue-500";
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        size={getButtonSize()}
        onClick={handleBookmarkClick}
        className={`${getButtonColor()} ${className}`}
      >
        {getIcon()}
        {showText && <span className="ml-2">{t('bookmarks.save')}</span>}
      </Button>
    );
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={getButtonVariant()}
            size={getButtonSize()}
            onClick={handleBookmarkClick}
            disabled={loading}
            className={`${getButtonColor()} ${className}`}
          >
            {getIcon()}
            {showText && (
              <span className="ml-2">
                {isBookmarkedState ? t('bookmarks.saved') : t('bookmarks.save')}
              </span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('bookmarks.addToCollection')}</DialogTitle>
            <DialogDescription>
              {t('bookmarks.addToCollectionDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Collection Selection */}
            <div className="space-y-2">
              <Label>{t('bookmarks.selectCollection')}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!createNewCollection ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreateNewCollection(false)}
                  className="flex-1"
                >
                  {t('bookmarks.existingCollection')}
                </Button>
                <Button
                  type="button"
                  variant={createNewCollection ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreateNewCollection(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('bookmarks.newCollection')}
                </Button>
              </div>
            </div>

            {createNewCollection ? (
              <div className="space-y-2">
                <Label htmlFor="newCollection">{t('bookmarks.collectionName')}</Label>
                <Input
                  id="newCollection"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder={t('bookmarks.collectionNamePlaceholder')}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('bookmarks.chooseCollection')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Favorites">
                      💙 {t('bookmarks.favorites')}
                    </SelectItem>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.name}>
                        {collection.icon} {collection.name}
                        <span className="text-muted-foreground ml-2">
                          ({collection.bookmarkCount})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Optional Note */}
            <div className="space-y-2">
              <Label htmlFor="note">{t('bookmarks.note')} ({t('common.optional')})</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('bookmarks.notePlaceholder')}
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddBookmark}
                disabled={loading || (!selectedCollection && !newCollectionName)}
              >
                {loading ? t('common.loading') : t('bookmarks.addBookmark')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 