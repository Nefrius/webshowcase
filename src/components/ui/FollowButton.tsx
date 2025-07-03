'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { followUser, unfollowUser, getFollowStatus } from '@/lib/follows';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FollowStatus } from '@/types/follow';

interface FollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export default function FollowButton({
  targetUserId,
  targetUserName = 'kullanıcı',
  className = '',
  variant = 'default',
  size = 'default',
  showIcon = true,
  showText = true
}: FollowButtonProps) {
  const { user } = useAuth();
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    isFollowedBy: false,
    mutualFollow: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Follow durumunu kontrol et
  useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setIsCheckingStatus(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const status = await getFollowStatus(user.uid, targetUserId);
        setFollowStatus(status);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  // Follow/Unfollow işlemi
  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Takip etmek için giriş yapmalısınız');
      return;
    }

    if (user.uid === targetUserId) {
      toast.error('Kendinizi takip edemezsiniz');
      return;
    }

    setIsLoading(true);

    try {
      if (followStatus.isFollowing) {
        await unfollowUser({
          followerId: user.uid,
          followingId: targetUserId
        });
        
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: false,
          mutualFollow: false
        }));
        
        toast.success(`${targetUserName} takibi bırakıldı`);
      } else {
        await followUser({
          followerId: user.uid,
          followingId: targetUserId
        });
        
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: true,
          mutualFollow: prev.isFollowedBy
        }));
        
        toast.success(`${targetUserName} takip edildi`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı giriş yapmamışsa veya kendi profili ise gösterme
  if (!user || user.uid === targetUserId) {
    return null;
  }

  // Durum kontrol edilirken loading göster
  if (isCheckingStatus) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {showText && <span className="ml-2">Kontrol ediliyor...</span>}
      </Button>
    );
  }

  // Button içeriği
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {showText && <span className="ml-2">İşleniyor...</span>}
        </>
      );
    }

    if (followStatus.isFollowing) {
      return (
        <>
          {showIcon && <UserMinus className="w-4 h-4" />}
          {showText && <span className={showIcon ? "ml-2" : ""}>Takibi Bırak</span>}
        </>
      );
    }

    return (
      <>
        {showIcon && <UserPlus className="w-4 h-4" />}
        {showText && <span className={showIcon ? "ml-2" : ""}>Takip Et</span>}
      </>
    );
  };

  // Button variant'ını belirle
  const getButtonVariant = () => {
    if (followStatus.isFollowing) {
      return variant === 'default' ? 'outline' : variant;
    }
    return variant;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`
        ${className}
        ${followStatus.isFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-300' : ''}
        ${followStatus.mutualFollow ? 'ring-2 ring-blue-200' : ''}
      `}
      title={
        followStatus.mutualFollow 
          ? 'Karşılıklı takip' 
          : followStatus.isFollowing 
            ? 'Takip ediliyor' 
            : 'Takip et'
      }
    >
      {getButtonContent()}
    </Button>
  );
}

// Kompakt versiyon - sadece icon
export function FollowButtonCompact({ 
  targetUserId, 
  targetUserName,
  className = '' 
}: Pick<FollowButtonProps, 'targetUserId' | 'targetUserName' | 'className'>) {
  return (
    <FollowButton
      targetUserId={targetUserId}
      targetUserName={targetUserName}
      className={className}
      variant="outline"
      size="sm"
      showIcon={true}
      showText={false}
    />
  );
}

// Büyük versiyon - tam metin
export function FollowButtonLarge({ 
  targetUserId, 
  targetUserName,
  className = '' 
}: Pick<FollowButtonProps, 'targetUserId' | 'targetUserName' | 'className'>) {
  return (
    <FollowButton
      targetUserId={targetUserId}
      targetUserName={targetUserName}
      className={className}
      variant="default"
      size="lg"
      showIcon={true}
      showText={true}
    />
  );
} 