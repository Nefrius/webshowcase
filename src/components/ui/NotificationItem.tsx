'use client';

import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Globe, 
  Bell, 
  Star,
  MoreHorizontal,
  Check,
  Trash2
} from 'lucide-react';
import { Button } from './button';
import { Avatar } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { useLanguage } from '../../contexts/LanguageContext';
import { Notification, NotificationType } from '../../types/notification';

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  showActions?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

export const NotificationItem = ({
  notification,
  compact = false,
  showActions = true,
  loading = false,
  onClick,
  onMarkAsRead,
  onDelete
}: NotificationItemProps) => {
  const { language } = useLanguage();

  // Bildirim tipine göre ikon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return <Heart className="h-4 w-4 text-red-500" />;
      case NotificationType.COMMENT:
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case NotificationType.FOLLOW:
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case NotificationType.WEBSITE:
        return <Globe className="h-4 w-4 text-purple-500" />;
      case NotificationType.RATING:
        return <Star className="h-4 w-4 text-yellow-500" />;
      case NotificationType.SYSTEM:
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Tarih formatla
  const formatDate = (timestamp: unknown) => {
    try {
      const date = timestamp && typeof timestamp === 'object' && 'toDate' in timestamp 
        ? (timestamp as { toDate: () => Date }).toDate() 
        : new Date(timestamp as string);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: language === 'tr' ? tr : enUS
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`
        relative border-l-4 transition-all duration-200 cursor-pointer
        ${notification.isRead 
          ? 'border-l-gray-200 bg-gray-50 hover:bg-gray-100' 
          : 'border-l-blue-500 bg-blue-50 hover:bg-blue-100'
        }
        ${compact ? 'p-3' : 'p-4'}
        ${loading ? 'opacity-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {notification.senderPhotoURL ? (
            <Avatar className="h-8 w-8">
              <img
                src={notification.senderPhotoURL}
                alt={notification.senderName || 'User'}
                className="h-full w-full rounded-full object-cover"
              />
            </Avatar>
          ) : (
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center space-x-2">
            <p className={`text-sm font-medium ${
              notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
            }`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>

          {/* Message */}
          <p className={`text-sm mt-1 ${
            notification.isRead ? 'text-gray-600' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>

          {/* Website Preview */}
          {notification.websiteImageUrl && notification.websiteTitle && (
            <div className="mt-2 flex items-center space-x-2 p-2 bg-white rounded-lg border">
              <img
                src={notification.websiteImageUrl}
                alt={notification.websiteTitle}
                className="h-8 w-8 rounded object-cover"
              />
              <span className="text-xs text-gray-600 truncate">
                {notification.websiteTitle}
              </span>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </p>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1">
                {!notification.isRead && onMarkAsRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    disabled={loading}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {!notification.isRead && onMarkAsRead && (
                      <DropdownMenuItem onClick={onMarkAsRead}>
                        <Check className="h-4 w-4 mr-2" />
                        Okundu İşaretle
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={onDelete}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}; 