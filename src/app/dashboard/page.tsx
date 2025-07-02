"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, Eye, Plus, TrendingUp, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Website } from "@/types/website";
import { getUserWebsites } from "@/lib/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [userWebsites, setUserWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadUserWebsites = async () => {
      try {
        const websites = await getUserWebsites(user.uid);
        setUserWebsites(websites);
      } catch (error) {
        console.error('Error loading user websites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserWebsites();
  }, [user, router]);

  if (!user) {
    return null;
  }

  const totalViews = userWebsites.reduce((sum, website) => sum + (website.views || 0), 0);
  const totalLikes = userWebsites.reduce((sum, website) => sum + (website.likes || 0), 0);
  const averageViews = userWebsites.length > 0 ? Math.round(totalViews / userWebsites.length) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('dashboard.subtitle')}
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-black dark:text-white font-medium">
                Hoş geldin, {user.displayName || user.email?.split('@')[0] || 'Kullanıcı'}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-8 space-y-8">
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Toplam Website
                        </p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {userWebsites.length}
                        </p>
                      </div>
                      <Globe className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Toplam Görüntülenme
                        </p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {totalViews.toLocaleString()}
                        </p>
                      </div>
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Toplam Beğeni
                        </p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                          {totalLikes.toLocaleString()}
                        </p>
                      </div>
                      <Heart className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Websitelerim */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-black dark:text-white">
                      Websitelerim
                    </CardTitle>
                    <Button asChild className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                      <Link href="/submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Ekle
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                    </div>
                  ) : userWebsites.length === 0 ? (
                    <div className="text-center py-8">
                      <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Henüz hiç website eklemedin.
                      </p>
                      <Link href="/submit">
                        <Button className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                          İlk Websiteni Ekle
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userWebsites.map((website) => (
                        <div
                          key={website.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Globe className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-black dark:text-white">
                                {website.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {website.url}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {website.views || 0}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {website.likes || 0}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {website.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Link href={`/website/${website.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Detaylar
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sağ Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Hızlı İstatistikler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Hızlı İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">Ortalama Görüntülenme</span>
                    <span className="font-semibold text-black dark:text-white">{averageViews}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">En Çok Beğenilen</span>
                    <span className="font-semibold text-black dark:text-white">
                      {userWebsites.length > 0 
                        ? Math.max(...userWebsites.map(w => w.likes || 0))
                        : 0
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">En Çok Görüntülenen</span>
                    <span className="font-semibold text-black dark:text-white">
                      {userWebsites.length > 0 
                        ? Math.max(...userWebsites.map(w => w.views || 0))
                        : 0
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hızlı Eylemler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-black dark:text-white">
                    Hızlı Eylemler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                    <Link href="/submit">
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Website Ekle
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link href="/explore">
                      <Globe className="mr-2 h-4 w-4" />
                      Keşfet
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link href="/my-websites">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Tüm Websitelerim
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Reklam Alanı - Sayfanın En Altında */}
      <section className="mt-16 py-8 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Sponsorlu İçerik
          </div>
          
          {/* Native Banner Container */}
          <div className="flex justify-center">
            <div 
              id="container-721b6a7c49eddfe9c53e104016d29447-dashboard"
              className="w-full max-w-[728px] min-h-[90px]"
            />
          </div>
        </div>
      </section>

      {/* Native Banner Script for Dashboard */}
      <Script 
        async
        data-cfasync="false" 
        src="//pl27063604.profitableratecpm.com/721b6a7c49eddfe9c53e104016d29447/invoke.js"
        strategy="lazyOnload"
      />
    </div>
  );
} 