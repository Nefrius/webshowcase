'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Download, RefreshCw, X, Sparkles } from 'lucide-react';

interface AppUpdatePromptProps {
  onDismiss?: () => void;
}

export default function AppUpdatePrompt({ onDismiss }: AppUpdatePromptProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Service Worker registration olup olmadığını kontrol et
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Update available kontrolü
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Yeni versiyon mevcut!
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Anında kontrol et
        if (reg.waiting) {
          setUpdateAvailable(true);
        }
      });

      // Service Worker kontrolü - yeni versiyon var mı?
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });

      // Manual update check
      const checkForUpdates = () => {
        navigator.serviceWorker.ready.then((reg) => {
          reg.update().catch((error) => {
            console.error('Update check failed:', error);
          });
        });
      };

      // Her 30 saniyede bir güncelleme kontrolü
      const updateInterval = setInterval(checkForUpdates, 30000);

      return () => clearInterval(updateInterval);
    }
  }, []);

  const handleUpdate = async () => {
    if (!registration?.waiting) return;

    setIsUpdating(true);

    try {
      // Service Worker'a güncelleme mesajı gönder
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Service Worker değiştiğinde sayfayı yenile
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Fallback - 2 saniye sonra yenile
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    onDismiss?.();
    
    // 10 dakika sonra tekrar göster
    setTimeout(() => {
      setUpdateAvailable(true);
    }, 10 * 60 * 1000);
  };

  if (!updateAvailable) return null;

  return (
    <Card className="max-w-md mx-auto border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Yeni Güncelleme Mevcut!</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-1">
                v2.1.0
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          InferyHub&apos;ın yeni versiyonu performans iyileştirmeleri ve yeni özellikler içeriyor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Yeni özellikler listesi */}
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">✨ Yeni Özellikler:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 🚀 %40 daha hızlı yükleme</li>
              <li>• 🔔 Gelişmiş bildirim sistemi</li>
              <li>• 🎨 Yeni arayüz iyileştirmeleri</li>
              <li>• 🐛 Hata düzeltmeleri</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Şimdi Güncelle
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Daha Sonra
            </Button>
          </div>
          
          <p className="text-xs text-blue-600">
            Güncelleme otomatik olarak yüklenecek ve sayfa yenilenecek.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 