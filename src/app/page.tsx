"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Globe, 
  Plus, 
  Rocket, 
  BarChart3, 
  Zap, 
  Users, 
  Eye,
  Heart,
  Star,
  Search,
  Code,
  Monitor,
  Smartphone,
  Shield
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";


import { useLanguage } from "@/contexts/LanguageContext";
import { Website } from "@/types/website";
import { getWebsites } from "@/lib/firestore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {
  const { t } = useLanguage();
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalUsers: 0,
    totalViews: 0,
    totalLikes: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Popüler ve yeni websiteleri eşit oranda getir
        const popularWebsites = await getWebsites({ sortBy: 'popular' }, 3);
        const newestWebsites = await getWebsites({ sortBy: 'recent' }, 3);
        
        // Websiteleri karıştır
        const combined = [...popularWebsites, ...newestWebsites]
          .filter((website, index, self) => 
            index === self.findIndex(w => w.id === website.id)
          )
          .slice(0, 6);
        
        setFeaturedWebsites(combined);

        // Gerçek istatistikleri hesapla
        if (!db) {
          console.warn('Firebase not initialized');
          return;
        }
        
        const websitesSnapshot = await getDocs(collection(db, "websites"));
        const usersSnapshot = await getDocs(collection(db, "users"));
        
        let totalViews = 0;
        let totalLikes = 0;
        
        websitesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          totalViews += data.views || 0;
          totalLikes += data.likes || 0;
        });

        setStats({
          totalWebsites: websitesSnapshot.size,
          totalUsers: usersSnapshot.size,
          totalViews,
          totalLikes
        });
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { name: t('explore.categories.ecommerce'), icon: <Monitor className="w-8 h-8" />, count: "120+" },
    { name: t('explore.categories.portfolio'), icon: <Code className="w-8 h-8" />, count: "98+" },
    { name: t('explore.categories.blog'), icon: <Globe className="w-8 h-8" />, count: "76+" },
    { name: t('explore.categories.corporate'), icon: <Shield className="w-8 h-8" />, count: "54+" },
    { name: t('explore.categories.dashboard'), icon: <BarChart3 className="w-8 h-8" />, count: "43+" },
    { name: t('explore.categories.social'), icon: <Smartphone className="w-8 h-8" />, count: "32+" },
  ];

  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: t('home.features.easySharing.title'),
      description: t('home.features.easySharing.description')
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: t('home.features.realTimeData.title'),
      description: t('home.features.realTimeData.description')
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('home.features.modernTech.title'),
      description: t('home.features.modernTech.description')
    }
  ];

  const howItWorksSteps = [
    {
      icon: <Users className="w-12 h-12" />,
      title: t('home.howItWorks.register.title'),
      description: t('home.howItWorks.register.description'),
      number: "01"
    },
    {
      icon: <Plus className="w-12 h-12" />,
      title: t('home.howItWorks.submit.title'),
      description: t('home.howItWorks.submit.description'),
      number: "02"
    },
    {
      icon: <Search className="w-12 h-12" />,
      title: t('home.howItWorks.discover.title'),
      description: t('home.howItWorks.discover.description'),
      number: "03"
    }
  ];

  const testimonials = [
    {
      content: t('home.testimonials.testimonial1.content'),
      author: t('home.testimonials.testimonial1.author'),
      role: t('home.testimonials.testimonial1.role'),
      avatar: "/default-avatar.png"
    },
    {
      content: t('home.testimonials.testimonial2.content'),
      author: t('home.testimonials.testimonial2.author'),
      role: t('home.testimonials.testimonial2.role'),
      avatar: "/default-avatar.png"
    },
    {
      content: t('home.testimonials.testimonial3.content'),
      author: t('home.testimonials.testimonial3.author'),
      role: t('home.testimonials.testimonial3.role'),
      avatar: "/default-avatar.png"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gray-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gray-50/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300 mb-6">
              <Star className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                {t('home.heroBadge')}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-black">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-black hover:bg-gray-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/explore" className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  {t('home.exploreWebsites')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-black text-black hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                <Link href="/submit" className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('home.addWebsite')}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { 
                icon: <Globe className="w-8 h-8 text-gray-700" />, 
                number: loading ? "..." : stats.totalWebsites.toLocaleString(), 
                label: t('home.stats.totalWebsites') 
              },
              { 
                icon: <Users className="w-8 h-8 text-gray-700" />, 
                number: loading ? "..." : stats.totalUsers.toLocaleString(), 
                label: t('home.stats.totalUsers') 
              },
              { 
                icon: <Eye className="w-8 h-8 text-gray-700" />, 
                number: loading ? "..." : `${Math.floor(stats.totalViews / 1000)}K+`, 
                label: t('home.stats.totalViews') 
              },
              { 
                icon: <Heart className="w-8 h-8 text-gray-700" />, 
                number: loading ? "..." : `${Math.floor(stats.totalLikes / 100)}K+`, 
                label: t('home.stats.totalLikes') 
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Websites Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              {t('home.featuredSection.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.featuredSection.subtitle')}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{t('home.loading')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWebsites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 hover:border-blue-300 transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={website.imageUrl || "/placeholder-website.jpg"}
                      alt={website.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/95 backdrop-blur-md rounded-full p-2.5 shadow-2xl ring-1 ring-white/20">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {t('home.featured')}
                      </div>
                    </div>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-3">
                                          <h3 className="text-xl font-bold text-black group-hover:text-gray-700 transition-colors duration-300 truncate">
                      {website.title}
                    </h3>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                      {website.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                          <Eye className="w-4 h-4 mr-1 text-gray-400" />
                          {website.views?.toLocaleString() || '0'}
                        </span>
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
                          <Heart className="w-4 h-4 mr-1 text-red-400" />
                          {website.likes?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <Button size="sm" asChild className="bg-black hover:bg-gray-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <Link href={`/website/${website.id}`} className="flex items-center">
                          {t('home.viewSite')}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button size="lg" variant="outline" asChild className="border-black text-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-300">
              <Link href="/explore" className="flex items-center">
                {t('home.viewAllWebsites')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              {t('home.popularCategories.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.popularCategories.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group cursor-pointer border border-gray-100 hover:border-gray-300 hover:-translate-y-2"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-black mb-2 group-hover:text-gray-700 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-2xl font-bold text-gray-800">{category.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-black rounded-full mb-6 shadow-xl text-white">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-black">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full">
                      <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                    </div>
                  )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:border-gray-300 hover:-translate-y-2"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.testimonials.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-300 hover:-translate-y-2"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gray-600 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              {t('home.cta.subtitle')}
            </p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
              <Link href="/register" className="flex items-center">
                {t('home.cta.joinNow')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Sponsorlu İçerik */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500 font-medium">Sponsorlu İçerik</span>
        </div>
        <div className="max-w-4xl mx-auto">
          <Script
            src="//pl27063545.profitableratecpm.com/721b6a7c49eddfe9c53e104016d29447/invoke.js"
            strategy="lazyOnload"
          />
          <div id="container-721b6a7c49eddfe9c53e104016d29447"></div>
        </div>
      </div>
    </div>
  );
}
