import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/layout/navbar";
import AdDebug from "@/components/ui/ad-debug";
import PWAInstallPrompt from "@/components/ui/pwa-install-prompt";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "InferyHub - Web Sitesi Vitrin Platformu",
    template: "%s | InferyHub"
  },
  description: "Web sitelerinizi keşfedin, paylaşın ve beğenin. Türkiye'nin en kapsamlı web sitesi vitrin platformu.",
  keywords: [
    "web sitesi vitrini",
    "website showcase",
    "web tasarım",
    "portfolio",
    "web development",
    "Türkiye",
    "teknoloji",
    "yazılım",
    "web designer",
    "frontend",
    "UI/UX"
  ],
  authors: [{ name: "InferyHub Team" }],
  creator: "InferyHub",
  publisher: "InferyHub",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://inferyhub.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'InferyHub - Web Sitesi Vitrin Platformu',
    description: 'Web sitelerinizi keşfedin, paylaşın ve beğenin. Türkiye\'nin en kapsamlı web sitesi vitrin platformu.',
    siteName: 'InferyHub',
    images: [
      {
        url: '/logows.png',
        width: 1200,
        height: 630,
        alt: 'InferyHub - Web Sitesi Vitrin Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InferyHub - Web Sitesi Vitrin Platformu',
    description: 'Web sitelerinizi keşfedin, paylaşın ve beğenin.',
    images: ['/logows.png'],
    creator: '@inferyhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/infery.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logows.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="InferyHub" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="InferyHub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        
        {/* Apple Splash Screens */}
        <link rel="apple-touch-startup-image" href="/logows.png" />
        
        {/* Disable automatic detection */}
        <meta name="format-detection" content="telephone=no" />
        
      </head>
      <body
        className="antialiased min-h-screen bg-background font-sans"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="relative pt-16">
              {children}
            </main>
            <Toaster position="top-right" />
            <PWAInstallPrompt />
          </AuthProvider>
        </LanguageProvider>
        
        {/* Development only debug component */}
        {process.env.NODE_ENV === 'development' && <AdDebug />}
        <Analytics />
      </body>
    </html>
  );
}
