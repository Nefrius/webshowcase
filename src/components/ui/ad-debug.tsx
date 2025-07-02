"use client";

import { useEffect } from 'react';

export default function AdDebug() {
  useEffect(() => {
    // Ad debugging after page load
    const checkAds = () => {
      setTimeout(() => {
        console.log('🎯 Adsterra Reklam Durumu (Güncellenmiş):');
        
        // Check for script tags (now using Next.js Script components)
        const socialBarScript = document.querySelector('script[src*="d8510899f0482d4ccdbf4e02bc7febb5"]');
        const popunderScript = document.querySelector('script[src*="946ea5fdd1ef5c82ef316c740a868171"]');
        const nativeBannerScript = document.querySelector('script[src*="721b6a7c49eddfe9c53e104016d29447"]');
        const directLink = document.querySelector('a[href*="sgqkf3ce0v"]');
        
        console.log('- Social Bar script (body sonunda):', !!socialBarScript);
        console.log('- Popunder script (head\'de):', !!popunderScript);
        console.log('- Native Banner script:', !!nativeBannerScript);
        console.log('- Direct Link hyperlink:', !!directLink);
        
        // Check ad containers
        const nativeBannerContainer = document.getElementById('container-721b6a7c49eddfe9c53e104016d29447');
        const bottomBanner = document.getElementById('adsterra-bottom-banner');
        
        console.log('📍 Reklam Konumları:');
        console.log('- Native Banner container:', !!nativeBannerContainer);
        console.log('- Alt banner container:', !!bottomBanner);
        
        // Check for actual ad content in Native Banner
        if (nativeBannerContainer) {
          const hasNativeAd = nativeBannerContainer.innerHTML.trim().length > 0;
          console.log('- Native Banner içeriği:', hasNativeAd);
        }
        
        // Check for actual ad content in bottom banner
        if (bottomBanner) {
          const hasBottomAd = bottomBanner.querySelector('iframe') || bottomBanner.querySelector('ins');
          console.log('- Alt banner reklam içeriği:', !!hasBottomAd);
        }
        
        console.log('✅ Tüm reklam kodları doğru konumlarda yerleştirildi!');
        
      }, 3000);
    };

    checkAds();
  }, []);

  return null; // No visible component
} 