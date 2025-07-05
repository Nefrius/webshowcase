'use client';

import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationList } from '@/components/ui/NotificationList';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getUserNotifications, 
  getNotificationStats,
  markAllNotificationsAsRead,
  deleteAllNotifications,
  subscribeToNotifications
} from '@/lib/notifications';
import { Notification, NotificationStats } from '@/types/notification';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        
        // Bildirimleri ve istatistikleri yükle
        const [notificationsData, statsData] = await Promise.all([
          getUserNotifications(user.uid, { limit: 50 }),
          getNotificationStats(user.uid)
        ]);

        setNotifications(notificationsData.notifications);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Real-time dinleme
    const unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
    }, (error) => {
      console.error('Notification subscription error:', error);
    });

    return unsubscribe;
  }, [user]);

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await markAllNotificationsAsRead(user.uid);
      
      // Local state güncelle
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => prev ? { ...prev, unreadCount: 0 } : null);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await deleteAllNotifications(user.uid);
      
      // Local state güncelle
      setNotifications([]);
      setStats(prev => prev ? { ...prev, totalCount: 0, unreadCount: 0 } : null);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationUpdate = (updatedNotification: Notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
    );
  };

  const handleNotificationDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setStats(prev => prev ? { ...prev, totalCount: prev.totalCount - 1 } : null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Yapın</h1>
          <p className="text-gray-600">Bildirimlerinizi görmek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            {t('notifications.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('notifications.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={actionLoading || !stats?.unreadCount}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            {t('notifications.markAllAsRead')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={actionLoading || !notifications.length}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('notifications.clearAll')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Bildirim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Okunmamış
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unreadCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Bu Hafta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.thisWeekCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bildirimler</span>
            {stats?.unreadCount ? (
              <Badge variant="secondary">
                {stats.unreadCount} {t('notifications.unreadCount')}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <NotificationList
              notifications={notifications}
              showActions={true}
              onNotificationUpdate={handleNotificationUpdate}
              onNotificationDelete={handleNotificationDelete}
            />
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('notifications.noNotifications')}
              </h3>
              <p className="text-gray-600">
                {t('notifications.noNotificationsDesc')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 