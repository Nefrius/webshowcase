"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Heart, Eye, Plus, Sparkles, Rocket, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
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

  // Load featured/recent websites from Firestore
  useEffect(() => {
    const loadFeaturedWebsites = async () => {
      try {
        // Get recent websites since we don't have featured flag set yet
        const websites = await getWebsites({ sortBy: "recent" }, 6);
        setFeaturedWebsites(websites);
      } catch (error) {
        console.error("Error loading featured websites:", error);
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

  const stats = [
    { label: t('home.stats.totalWebsites'), value: "500+", icon: Globe },
    { label: t('home.stats.totalLikes'), value: "2.5K+", icon: Heart },
    { label: t('home.stats.totalViews'), value: "50K+", icon: Eye },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('home.heroBadge')}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
              {t('home.heroTitle')}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="group">
                <Link href="/explore">
                  {t('home.exploreWebsites')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              {user ? (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/submit">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('home.addWebsite')}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('home.joinFree')}
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Websites Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('home.featuredSection.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.featuredSection.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('home.loading')}</p>
              </div>
            ) : featuredWebsites.length > 0 ? (
              <>
                <WebsiteGrid
                  websites={featuredWebsites}
                  loading={false}
                  onLikeUpdate={handleLikeUpdate}
                />
                
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/explore">
                      {t('home.viewAllWebsites')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {t('home.noWebsites')}
                </p>
                {user && (
                  <Button asChild>
                    <Link href="/submit">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('home.addFirstWebsite')}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('home.features.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: t('home.features.easySharing.title'),
                description: t('home.features.easySharing.description'),
                icon: Rocket
              },
              {
                title: t('home.features.realTimeData.title'),
                description: t('home.features.realTimeData.description'),
                icon: BarChart3
              },
              {
                title: t('home.features.modernTech.title'),
                description: t('home.features.modernTech.description'),
                icon: Zap
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border bg-background">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
