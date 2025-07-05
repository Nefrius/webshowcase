'use client';

import { useState, useEffect } from 'react';
import { Settings, Mail, Smartphone, Users, Heart, MessageCircle, Globe, Bell, Star, Save } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './dialog';
import { Label } from './label';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  getNotificationSettings,
  updateNotificationSettings 
} from '../../lib/notifications';
import { NotificationSettings as NotificationSettingsType } from '../../types/notification';

interface NotificationSettingsProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NotificationSettings = ({ 
  children, 
  trigger, 
  open, 
  onOpenChange 
}: NotificationSettingsProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Modal açılma/kapanma kontrolü
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Ayarları yükle
  useEffect(() => {
    if (!user?.uid || (!isOpen && !open)) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const userSettings = await getNotificationSettings(user.uid);
        
        if (userSettings) {
          setSettings(userSettings);
        } else {
          // Varsayılan ayarlar
          setSettings({
            userId: user.uid,
            emailNotifications: true,
            pushNotifications: true,
            followNotifications: true,
            likeNotifications: true,
            commentNotifications: true,
            websiteNotifications: true,
            systemNotifications: true,
            ratingNotifications: true,
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date())
          });
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.uid, isOpen, open]);

  // Ayarları kaydet
  const handleSave = async () => {
    if (!user?.uid || !settings) return;

    try {
      setSaving(true);
      await updateNotificationSettings(user.uid, {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        followNotifications: settings.followNotifications,
        likeNotifications: settings.likeNotifications,
        commentNotifications: settings.commentNotifications,
        websiteNotifications: settings.websiteNotifications,
        systemNotifications: settings.systemNotifications,
        ratingNotifications: settings.ratingNotifications
      });
      
      handleOpenChange(false);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Ayar güncelle
  const updateSetting = (key: keyof NotificationSettingsType, value: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // Bildirim türü bilgileri
  const notificationTypes = [
    {
      key: 'followNotifications' as const,
      icon: Users,
      label: t('notifications.settingsModal.followNotifications'),
      description: 'Yeni takipçi bildirimlerini alın'
    },
    {
      key: 'likeNotifications' as const,
      icon: Heart,
      label: t('notifications.settingsModal.likeNotifications'),
      description: 'Website beğeni bildirimlerini alın'
    },
    {
      key: 'commentNotifications' as const,
      icon: MessageCircle,
      label: t('notifications.settingsModal.commentNotifications'),
      description: 'Yeni yorum bildirimlerini alın'
    },
    {
      key: 'ratingNotifications' as const,
      icon: Star,
      label: t('notifications.settingsModal.ratingNotifications'),
      description: 'Website değerlendirme bildirimlerini alın'
    },
    {
      key: 'websiteNotifications' as const,
      icon: Globe,
      label: t('notifications.settingsModal.websiteNotifications'),
      description: 'Yeni website bildirimlerini alın'
    },
    {
      key: 'systemNotifications' as const,
      icon: Bell,
      label: t('notifications.settingsModal.systemNotifications'),
      description: 'Sistem ve güvenlik bildirimlerini alın'
    }
  ];

  if (!user) return null;

  const modalContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('notifications.settingsModal.title')}
        </DialogTitle>
        <DialogDescription>
          Bildirim tercihlerinizi yönetin ve hangi bildirimleri almak istediğinizi seçin.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Genel Bildirim Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Bildirimleri */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <Label className="text-sm font-medium">
                    {t('notifications.settingsModal.emailNotifications')}
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    E-posta ile bildirim almak istiyorsanız etkinleştirin
                  </p>
                </div>
              </div>
              <Button
                variant={settings?.emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('emailNotifications', !settings?.emailNotifications)}
                disabled={loading}
              >
                {settings?.emailNotifications ? 'Açık' : 'Kapalı'}
              </Button>
            </div>

            {/* Push Bildirimleri */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-green-500" />
                <div>
                  <Label className="text-sm font-medium">
                    {t('notifications.settingsModal.pushNotifications')}
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Anlık push bildirimlerini alın
                  </p>
                </div>
              </div>
              <Button
                variant={settings?.pushNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('pushNotifications', !settings?.pushNotifications)}
                disabled={loading}
              >
                {settings?.pushNotifications ? 'Açık' : 'Kapalı'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bildirim Türleri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Bildirim Türleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              const isEnabled = settings?.[type.key] ?? true;
              
              return (
                <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label className="text-sm font-medium">{type.label}</Label>
                      <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={isEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting(type.key, !isEnabled)}
                    disabled={loading}
                  >
                    {isEnabled ? 'Açık' : 'Kapalı'}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Eylem Butonları */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            {t('notifications.settingsModal.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('notifications.settingsModal.save')}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open || isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {modalContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open || isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {t('notifications.settings')}
          </Button>
        )}
      </DialogTrigger>
      {modalContent}
    </Dialog>
  );
}; 