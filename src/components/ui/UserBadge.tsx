import React from 'react';
import { UserBadge as BadgeType } from '@/types/user';
import { cn } from '@/lib/utils';
import { 
  User,
  Shield,
  Crown,
  Building,
  Star,
  Zap,
  Badge
} from 'lucide-react';

interface UserBadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const iconMap = {
  User,
  Shield,
  Crown,
  Building,
  Star,
  Zap,
  Badge
};

export const UserBadge: React.FC<UserBadgeProps> = ({
  badge,
  size = 'md',
  showTooltip = true,
  className
}) => {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Badge;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="relative inline-block">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium transition-all',
          badge.color,
          badge.bgColor,
          sizeClasses[size],
          className
        )}
        title={showTooltip ? badge.description : undefined}
      >
        <IconComponent className={iconSizes[size]} />
        {badge.displayName}
      </span>
    </div>
  );
};

export default UserBadge; 