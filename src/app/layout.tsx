import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Infery - Web Sitesi Vitrin Platformu",
    template: "%s | Infery"
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
  authors: [{ name: "Infery Team" }],
  creator: "Infery",
  publisher: "Infery",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://infery.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'Infery - Web Sitesi Vitrin Platformu',
    description: 'Web sitelerinizi keşfedin, paylaşın ve beğenin. Türkiye\'nin en kapsamlı web sitesi vitrin platformu.',
    siteName: 'Infery',
    images: [
      {
        url: '/logows.png',
        width: 1200,
        height: 630,
        alt: 'Infery - Web Sitesi Vitrin Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infery - Web Sitesi Vitrin Platformu',
    description: 'Web sitelerinizi keşfedin, paylaşın ve beğenin.',
    images: ['/logows.png'],
    creator: '@infery',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logows.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
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
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
