"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Bookmark className="h-16 w-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-4xl font-bold mb-4">{t('bookmarks.myBookmarks')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('bookmarks.noBookmarksDescription')}
          </p>
          <Button onClick={() => router.push('/explore')}>
            {t('nav.explore')}
          </Button>
        </div>
      </div>
    </div>
  );
} 