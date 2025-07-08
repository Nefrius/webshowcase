'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Bell, Settings, X, PlusCircle, MessageCircle, Star, Users, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  requestNotificationPermission,
  isNotificationSupported,
  getNotificationPermission,
  saveNotificationPreferences,
  onForegroundMessage,
  showLocalNotification,
  NotificationPreferences,
} from '@/lib/messaging';

interface PushNotificationPromptProps {
  onDismiss?: () => void;
  showSettings?: boolean;
}

export default function PushNotificationPrompt({
  onDismiss,
  showSettings = false,
}: PushNotificationPromptProps) {
  const { user } = useAuth();
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(showSettings);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newWebsites: true,
    comments: true,
    ratings: true,
    follows: true,
    announcements: true,
  });

  // Check if should show prompt
  const shouldShow = !permission.granted && isNotificationSupported() && user;

  useEffect(() => {
    if (!user || !permission.granted) return;

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'InferyHub';
      const body = payload.notification?.body || '';
      
      if (title && body) {
        showLocalNotification(title, {
          body,
          data: payload.data,
        });
      }
    });

    return unsubscribe;
  }, [user, permission.granted]);

  const handleRequestPermission = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      
      if (result.granted) {
        // Show success notification
        showLocalNotification('🔔 Bildirimler Aktif!', {
          body: 'InferyHub bildirimlerini almaya başladınız.',
          tag: 'permission-granted',
        });
        
        // Auto-dismiss if permission granted
        setTimeout(() => {
          onDismiss?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await saveNotificationPreferences(preferences);
      showLocalNotification('✅ Tercihler Kaydedildi', {
        body: 'Bildirim tercihleriniz başarıyla güncellendi.',
        tag: 'preferences-saved',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isNotificationSupported()) {
    return null;
  }

  // Settings view
  if (showPreferences || (permission.granted && showSettings)) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bildirim Tercihleri
          </CardTitle>
          <CardDescription>
            Hangi bildirimler almak istediğinizi seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries({
              newWebsites: 'Yeni Website Eklendiğinde',
              comments: 'Yorumlar',
              ratings: 'Değerlendirmeler',
              follows: 'Takip Bildirimleri',
              announcements: 'Duyurular',
            }).map(([key, label]) => {
              const icons = {
                newWebsites: <PlusCircle className="h-4 w-4 text-green-500" />,
                comments: <MessageCircle className="h-4 w-4 text-blue-500" />,
                ratings: <Star className="h-4 w-4 text-yellow-500" />,
                follows: <Users className="h-4 w-4 text-purple-500" />,
                announcements: <Megaphone className="h-4 w-4 text-orange-500" />,
              };
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icons[key as keyof typeof icons]}
                    <span className="text-sm">{label}</span>
                  </div>
                  <Button
                    variant={preferences[key as keyof NotificationPreferences] ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePreferenceChange(key as keyof NotificationPreferences)}
                  >
                    {preferences[key as keyof NotificationPreferences] ? 'Açık' : 'Kapalı'}
                  </Button>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            {!showSettings && (
              <Button 
                variant="outline" 
                onClick={() => setShowPreferences(false)}
              >
                Geri
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Permission request view
  if (shouldShow && !permission.granted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Bildirimleri Aç</CardTitle>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            InferyHub&apos;dan önemli güncellemeler ve aktiviteler hakkında bildirim alın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-green-500" />
                <span>Yeni Website&apos;ler</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span>Yorumlar</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Değerlendirmeler</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Takip İşlemleri</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                {isLoading ? 'İzin İsteniyor...' : 'Bildirimleri Aç'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPreferences(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status display for granted permission
  if (permission.granted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Bell className="h-3 w-3 mr-1" />
                Bildirimler Aktif
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreferences(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
} 