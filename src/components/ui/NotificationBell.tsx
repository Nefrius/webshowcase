'use client';

import { useState, useEffect } from 'react';
import { Bell, BellRing, Settings } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { NotificationList } from './NotificationList';
import { NotificationSettings } from './NotificationSettings';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  getUnreadNotificationCount, 
  subscribeToNotifications,
  markAllNotificationsAsRead 
} from '../../lib/notifications';
import { Notification } from '../../types/notification';

export const NotificationBell = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Okunmamış bildirim sayısını getir
  useEffect(() => {
    if (!user?.uid) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [user?.uid]);

  // Real-time bildirim dinleyicisi
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        // Okunmamış sayısını güncelle
        const unreadCount = newNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
      },
      (error) => {
        console.error('Notification subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await markAllNotificationsAsRead(user.uid);
      setUnreadCount(0);
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı giriş yapmamışsa gösterme
  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5 text-gray-600" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">
            {t('notifications.title')}
          </h3>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                t('notifications.markAllAsRead')
              )}
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          <NotificationList 
            notifications={notifications}
            showActions={false}
            compact={true}
            onNotificationClick={() => setIsOpen(false)}
          />
        </div>

        {notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">
              {t('notifications.empty')}
            </p>
          </div>
        )}

        {/* Settings Button */}
        <div className="border-t p-2">
          <NotificationSettings 
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('notifications.settings')}
              </Button>
            }
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 