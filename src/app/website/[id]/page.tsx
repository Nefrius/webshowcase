import { Metadata } from 'next';
import WebsiteDetailClient from './WebsiteDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Check if Firebase is properly configured
  const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!hasFirebaseConfig) {
    // Return default metadata if Firebase is not configured (e.g., during build)
    return {
      title: 'Website Detayları | Infery',
      description: 'Website detaylarını görüntüleyin ve inceleyin.',
      keywords: ['web tasarım', 'website showcase', 'web development'],
      openGraph: {
        title: 'Website Detayları | Infery',
        description: 'Website detaylarını görüntüleyin ve inceleyin.',
        type: 'website',
        siteName: 'Infery',
      },
    };
  }
  
  try {
    // Dynamic import to avoid build-time Firebase initialization
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    
    const websiteDoc = await getDoc(doc(db!, 'websites', resolvedParams.id));
    
    if (!websiteDoc.exists()) {
      return {
        title: 'Website Bulunamadı | Infery',
        description: 'Aradığınız website bulunamadı.',
      };
    }

    const website = websiteDoc.data();
    const title = `${website.title} | Infery`;
    const description = website.description || `${website.title} hakkında detaylar ve incelemeleri.`;

    return {
      title,
      description,
      keywords: [
        website.title,
        website.category,
        'web tasarım',
        'website showcase',
        'web development',
        ...(website.tags || [])
      ],
      openGraph: {
        title,
        description,
        url: `/website/${resolvedParams.id}`,
        type: 'website',
        images: website.imageUrl ? [
          {
            url: website.imageUrl,
            width: 1200,
            height: 630,
            alt: website.title,
          }
        ] : [],
        siteName: 'Infery',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: website.imageUrl ? [website.imageUrl] : [],
      },
      alternates: {
        canonical: `/website/${resolvedParams.id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Website Detayları | Infery',
      description: 'Website detaylarını görüntüleyin.',
    };
  }
}

export default function WebsiteDetailPage({ params }: PageProps) {
  return <WebsiteDetailClient params={params} />;
} 