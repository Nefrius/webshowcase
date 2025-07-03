'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, UserPlus, Heart, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFollowStats, getFollowStatus } from '@/lib/follows';
import { type FollowStats, type FollowStatus } from '@/types/follow';
import FollowButton from './FollowButton';
import { FollowListModal } from './FollowList';

interface FollowStatsProps {
  userId: string;
  userName?: string;
  userDisplayName?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showFollowButton?: boolean;
  showMutualBadge?: boolean;
}

export default function FollowStats({
  userId,
  userName,
  userDisplayName,
  className = '',
  variant = 'default',
  showFollowButton = true,
  showMutualBadge = true
}: FollowStatsProps) {
  const { user } = useAuth();
  const { } = useLanguage();
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'followers' | 'following'>('followers');

  // Load follow stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getFollowStats(userId);
        setFollowStats(stats);
      } catch (error) {
        console.error('Error loading follow stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  // Load follow status for current user
  useEffect(() => {
    if (!user || user.uid === userId) return;

    const loadFollowStatus = async () => {
      try {
        const status = await getFollowStatus(user.uid, userId);
        setFollowStatus(status);
      } catch (error) {
        console.error('Error loading follow status:', error);
      }
    };

    loadFollowStatus();
  }, [user, userId]);

  const openFollowersDialog = () => {
    setDialogTab('followers');
    setDialogOpen(true);
  };

  const openFollowingDialog = () => {
    setDialogTab('following');
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!followStats) {
    return null;
  }

  // Minimal variant - sadece sayılar
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}>
        <button
          onClick={openFollowersDialog}
          className="hover:text-foreground transition-colors"
        >
          <span className="font-medium text-foreground">{followStats.followersCount}</span> takipçi
        </button>
        <button
          onClick={openFollowingDialog}
          className="hover:text-foreground transition-colors"
        >
          <span className="font-medium text-foreground">{followStats.followingCount}</span> takip
        </button>
        
        {showMutualBadge && followStatus?.mutualFollow && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Karşılıklı
          </Badge>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {dialogTab === 'followers' ? 'Takipçiler' : 'Takip Edilenler'} - {userDisplayName || userName}
              </DialogTitle>
            </DialogHeader>
            <FollowListModal
              userId={userId}
              userName={userDisplayName || userName}
              initialTab={dialogTab}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Compact variant - kart olmadan
  if (variant === 'compact') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={openFollowersDialog}
              className="text-center hover:bg-muted/50 p-2 rounded-lg transition-colors"
            >
              <div className="text-xl font-bold">{followStats.followersCount}</div>
              <div className="text-sm text-muted-foreground">Takipçi</div>
            </button>
            
            <button
              onClick={openFollowingDialog}
              className="text-center hover:bg-muted/50 p-2 rounded-lg transition-colors"
            >
              <div className="text-xl font-bold">{followStats.followingCount}</div>
              <div className="text-sm text-muted-foreground">Takip</div>
            </button>
          </div>

          {showFollowButton && user && user.uid !== userId && (
            <div className="flex items-center gap-2">
              {showMutualBadge && followStatus?.mutualFollow && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Karşılıklı
                </Badge>
              )}
              <FollowButton
                targetUserId={userId}
                targetUserName={userDisplayName || userName || 'kullanıcı'}
                variant="default"
              />
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {dialogTab === 'followers' ? 'Takipçiler' : 'Takip Edilenler'} - {userDisplayName || userName}
              </DialogTitle>
            </DialogHeader>
            <FollowListModal
              userId={userId}
              userName={userDisplayName || userName}
              initialTab={dialogTab}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default variant - kart ile
  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={openFollowersDialog}
              className="text-center hover:bg-muted/50 p-3 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="text-2xl font-bold">{followStats.followersCount}</div>
              <div className="text-sm text-muted-foreground">Takipçi</div>
            </button>
            
            <div className="w-px h-12 bg-border" />
            
            <button
              onClick={openFollowingDialog}
              className="text-center hover:bg-muted/50 p-3 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-center mb-2">
                <UserPlus className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="text-2xl font-bold">{followStats.followingCount}</div>
              <div className="text-sm text-muted-foreground">Takip</div>
            </button>
          </div>

          {/* Follow Button and Mutual Badge */}
          {showFollowButton && user && user.uid !== userId && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t">
              {showMutualBadge && followStatus?.mutualFollow && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Karşılıklı Takip
                </Badge>
              )}
              <FollowButton
                targetUserId={userId}
                targetUserName={userDisplayName || userName || 'kullanıcı'}
                variant="default"
                className="flex-1"
              />
            </div>
          )}

          {/* Engagement Rate (if available) */}
          {followStats.followersCount > 0 && followStats.followingCount > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>
                Takip Oranı: {Math.round((followStats.followersCount / (followStats.followersCount + followStats.followingCount)) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Follow Lists Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {dialogTab === 'followers' ? (
                  <>
                    <Users className="h-5 w-5" />
                    Takipçiler
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Takip Edilenler
                  </>
                )}
                <span className="text-muted-foreground">- {userDisplayName || userName}</span>
              </DialogTitle>
            </DialogHeader>
            <FollowListModal
              userId={userId}
              userName={userDisplayName || userName}
              initialTab={dialogTab}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Profil sayfası için özel variant
export function ProfileFollowStats({ 
  userId, 
  userName,
  userDisplayName,
  className = '' 
}: Pick<FollowStatsProps, 'userId' | 'userName' | 'userDisplayName' | 'className'>) {
  return (
    <FollowStats
      userId={userId}
      userName={userName}
      userDisplayName={userDisplayName}
      className={className}
      variant="compact"
      showFollowButton={true}
      showMutualBadge={true}
    />
  );
}

// Sidebar için minimal variant
export function SidebarFollowStats({ 
  userId, 
  userName,
  userDisplayName,
  className = '' 
}: Pick<FollowStatsProps, 'userId' | 'userName' | 'userDisplayName' | 'className'>) {
  return (
    <FollowStats
      userId={userId}
      userName={userName}
      userDisplayName={userDisplayName}
      className={className}
      variant="minimal"
      showFollowButton={false}
      showMutualBadge={true}
    />
  );
}

// Kart içinde tam özellikli variant
export function CardFollowStats({ 
  userId, 
  userName,
  userDisplayName,
  className = '' 
}: Pick<FollowStatsProps, 'userId' | 'userName' | 'userDisplayName' | 'className'>) {
  return (
    <FollowStats
      userId={userId}
      userName={userName}
      userDisplayName={userDisplayName}
      className={className}
      variant="default"
      showFollowButton={true}
      showMutualBadge={true}
    />
  );
} 