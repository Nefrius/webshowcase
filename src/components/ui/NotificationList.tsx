'use client';

import { useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  markNotificationAsRead, 
  deleteNotification
} from '../../lib/notifications';
import { Notification, NotificationFilters } from '../../types/notification';

interface NotificationListProps {
  notifications: Notification[];
  showActions?: boolean;
  compact?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationUpdate?: (notification: Notification) => void;
  onNotificationDelete?: (notificationId: string) => void;
  filters?: NotificationFilters;
}

export const NotificationList = ({
  notifications,
  showActions = true,
  compact = false,
  onNotificationClick,
  onNotificationUpdate,
  onNotificationDelete,
  filters
}: NotificationListProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      setLoading(notification.id);
      await markNotificationAsRead(notification.id);
      
      // Parent component'e bildir
      if (onNotificationUpdate) {
        onNotificationUpdate({ ...notification, isRead: true });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(null);
    }
  };

  // Bildirimi sil
  const handleDelete = async (notificationId: string) => {
    try {
      setLoading(notificationId);
      await deleteNotification(notificationId);
      
      // Parent component'e bildir
      if (onNotificationDelete) {
        onNotificationDelete(notificationId);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setLoading(null);
    }
  };

  // Bildirime tıklama
  const handleNotificationClick = async (notification: Notification) => {
    // Okunmamışsa okundu olarak işaretle
    if (!notification.isRead) {
      await handleMarkAsRead(notification);
    }

    // Parent component'e bildir
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // Filtreleme
  const filteredNotifications = notifications.filter(notification => {
    if (!filters) return true;

    if (filters.isRead !== undefined && notification.isRead !== filters.isRead) {
      return false;
    }

    if (filters.type && notification.type !== filters.type) {
      return false;
    }

    if (filters.senderId && notification.senderId !== filters.senderId) {
      return false;
    }

    return true;
  });

  if (filteredNotifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-sm">
          {t('notifications.empty')}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${compact ? 'p-0' : 'p-4'}`}>
      {filteredNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          compact={compact}
          showActions={showActions}
          loading={loading === notification.id}
          onClick={() => handleNotificationClick(notification)}
          onMarkAsRead={() => handleMarkAsRead(notification)}
          onDelete={() => handleDelete(notification.id)}
        />
      ))}
    </div>
  );
}; 