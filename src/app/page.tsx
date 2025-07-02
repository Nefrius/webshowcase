"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Plus, Rocket, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import WebsiteGrid from "@/components/website/WebsiteGrid";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Website } from "@/types/website";
import { getWebsites } from "@/lib/firestore";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedWebsites = async () => {
      try {
        const websites = await getWebsites({ sortBy: 'popular' }, 6);
        setFeaturedWebsites(websites);
      } catch (error) {
        console.error('Error loading featured websites:', error);
        setFeaturedWebsites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedWebsites();
  }, []);

  const handleLikeUpdate = (websiteId: string, newLikes: number) => {
    setFeaturedWebsites(prev =>
      prev.map(website =>
        website.id === websiteId
          ? { ...website, likes: newLikes }
          : website
      )
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Gelişmiş Arkaplan Efekti - Gri Tonları */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 rounded-3xl opacity-60" />
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
            <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000" />
          </div>
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-600 via-gray-800 to-black dark:from-gray-400 dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                {t('home.heroTitle')}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/explore">
                  <Button size="lg" className="text-lg px-8 py-4 h-14 rounded-full group shadow-lg hover:shadow-xl transition-all bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                    <Globe className="mr-2 h-5 w-5 group-hover:animate-spin" />
                    {t('home.exploreWebsites')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                {!user && (
                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8 py-4 h-14 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 shadow-lg hover:shadow-xl transition-all text-black dark:text-white"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {t('home.joinFree')}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Websites Section */}
        <section className="py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('home.featuredSection.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('home.featuredSection.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">{t('home.loading')}</p>
              </div>
            ) : featuredWebsites.length > 0 ? (
              <>
                <WebsiteGrid
                  websites={featuredWebsites}
                  loading={false}
                  onLikeUpdate={handleLikeUpdate}
                />
                
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg" asChild className="rounded-full px-8 py-4 h-14 text-lg shadow-lg hover:shadow-xl transition-all border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link href="/explore">
                      {t('home.viewAllWebsites')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="max-w-md mx-auto">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {t('home.noWebsites')}
                  </p>
                  {user && (
                    <Button asChild className="rounded-full px-6 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                      <Link href="/submit">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('home.addFirstWebsite')}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 relative">
          {/* Subtil Arkaplan Efekti */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-900/50 rounded-3xl" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  icon: Rocket,
                  title: t('home.features.fast.title'),
                  description: t('home.features.fast.description'),
                  gradient: 'from-gray-500 to-gray-700'
                },
                {
                  icon: BarChart3,
                  title: t('home.features.analytics.title'),
                  description: t('home.features.analytics.description'),
                  gradient: 'from-gray-600 to-gray-800'
                },
                {
                  icon: Zap,
                  title: t('home.features.easy.title'),
                  description: t('home.features.easy.description'),
                  gradient: 'from-gray-700 to-gray-900'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 lg:p-16 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Hemen Başlayın
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Websitelerinizi topluluğa katın ve harika projeler keşfedin
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button asChild size="lg" className="rounded-full px-8 py-4 h-14 text-lg bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                  <Link href="/submit">
                    <Plus className="mr-2 h-5 w-5" />
                    Website Ekle
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="rounded-full px-8 py-4 h-14 text-lg bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black">
                    <Link href="/register">
                      <Plus className="mr-2 h-5 w-5" />
                      Ücretsiz Kayıt Ol
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg" className="rounded-full px-8 py-4 h-14 text-lg border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link href="/explore">
                      <Globe className="mr-2 h-5 w-5" />
                      Keşfet
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </section>
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
              id="container-721b6a7c49eddfe9c53e104016d29447"
              className="w-full max-w-[728px] min-h-[90px]"
            />
          </div>
        </div>
      </section>

      {/* Direct Link - Hidden hyperlink for ad network */}
      <div className="hidden">
        <a 
          href="https://www.profitableratecpm.com/sgqkf3ce0v?key=c19ddf51e49165810489d5693a26be94" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          DirectLink
        </a>
      </div>

      {/* Native Banner Script */}
      <Script 
        async
        data-cfasync="false" 
        src="//pl27063604.profitableratecpm.com/721b6a7c49eddfe9c53e104016d29447/invoke.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
