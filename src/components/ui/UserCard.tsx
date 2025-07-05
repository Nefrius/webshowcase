'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { UserBadge } from './UserBadge';
import { useAuth } from '../../contexts/AuthContext';
import { PublicUser } from '../../lib/users';
import { followUser, unfollowUser } from '../../lib/users';
import { Users, Globe, Calendar, UserPlus, UserMinus, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

interface UserCardProps {
  user: PublicUser;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

export function UserCard({ user, onFollowToggle }: UserCardProps) {
  const { t, language } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error(t('common.loginRequired'));
      return;
    }

    if (currentUser.uid === user.uid) {
      toast.error(t('common.cantFollowYourself'));
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.uid, user.uid);
        setIsFollowing(false);
        toast.success(t('common.unfollowed'));
      } else {
        await followUser(currentUser.uid, user.uid);
        setIsFollowing(true);
        toast.success(t('common.followed'));
      }
      
      onFollowToggle?.(user.uid, !isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: language === 'tr' ? tr : enUS 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={user.photoURL || undefined} 
              alt={user.displayName}
            />
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.displayName}
            </h3>
            {user.badge && (
              <UserBadge 
                badge={user.badge} 
                size="sm" 
                className="mt-1"
              />
            )}
          </div>
        </div>
        
        {currentUser && currentUser.uid !== user.uid && (
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={handleFollowToggle}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isFollowing ? (
              <>
                <UserMinus className="w-4 h-4" />
                <span>{t('explore.unfollow')}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t('explore.follow')}</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{user.followerCount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('explore.followers')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Globe className="w-4 h-4" />
            <span>{user.websiteCount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('explore.websites')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{formatDate(user.createdAt)}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('explore.joined')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('explore.member')}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Navigate to user profile
            window.location.href = `/profile/${user.uid}`;
          }}
        >
          {t('explore.viewProfile')}
        </Button>
      </div>
    </motion.div>
  );
}

interface UserGridProps {
  users: PublicUser[];
  loading?: boolean;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

export function UserGrid({ users, loading, onFollowToggle }: UserGridProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-background border rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-gray-300 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24" />
                <div className="h-3 bg-gray-300 rounded w-16" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="h-3 bg-gray-300 rounded w-12 mx-auto mb-1" />
                <div className="h-4 bg-gray-300 rounded w-8 mx-auto" />
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-300 rounded w-12 mx-auto mb-1" />
                <div className="h-4 bg-gray-300 rounded w-8 mx-auto" />
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-300 rounded w-12 mx-auto mb-1" />
                <div className="h-4 bg-gray-300 rounded w-8 mx-auto" />
              </div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('explore.noUsers')}</h3>
        <p className="text-muted-foreground">
          {t('explore.noUsersDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.uid}
          user={user}
          onFollowToggle={onFollowToggle}
        />
      ))}
    </div>
  );
} 