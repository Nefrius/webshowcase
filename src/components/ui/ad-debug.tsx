"use client";

import { useEffect } from 'react';

export default function AdDebug() {
  useEffect(() => {
    // Ad debugging after page load
    const checkAds = () => {
      setTimeout(() => {
        console.log('🎯 Sponsorlu İçerik Durumu:');
        
        // Check for native banner script (only sponsored content remaining)
        const nativeBannerScript = document.querySelector('script[src*="721b6a7c49eddfe9c53e104016d29447"]');
        const directLink = document.querySelector('a[href*="sgqkf3ce0v"]');
        
        console.log('- Native Banner script:', !!nativeBannerScript);
        console.log('- Direct Link hyperlink:', !!directLink);
        
        // Check ad containers
        const nativeBannerContainer = document.getElementById('container-721b6a7c49eddfe9c53e104016d29447');
        
        console.log('📍 Sponsorlu İçerik Konumları:');
        console.log('- Native Banner container:', !!nativeBannerContainer);
        
        // Check for actual ad content in Native Banner
        if (nativeBannerContainer) {
          const hasNativeAd = nativeBannerContainer.innerHTML.trim().length > 0;
          console.log('- Native Banner içeriği:', hasNativeAd);
        }
        
        console.log('✅ Sadece sponsorlu içerik korundu, diğer reklamlar kaldırıldı!');
        
      }, 3000);
    };

    checkAds();
  }, []);

  return null; // No visible component
} 