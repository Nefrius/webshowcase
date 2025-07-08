"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Globe, 
  Users, 
  Eye, 
  Heart, 
  Search, 
  Zap,
  Shield,
  Star,
  Code,
  Rocket,
  Monitor,
  Smartphone,
  Sparkles as SparklesIcon,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Website } from "@/types/website";
import { getWebsites } from "@/lib/firestore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FloatingDot {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [floatingDots, setFloatingDots] = useState<FloatingDot[]>([]);
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

  // Generate floating dots only on client side to fix hydration error
  useEffect(() => {
    const dots = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 80 + Math.random() * 20,
      delay: Math.random() * 10,
      duration: 12 + Math.random() * 8
    }));
    setFloatingDots(dots);
  }, []);

  const categories = [
    { name: t('explore.categories.ecommerce'), icon: <Monitor className="w-6 h-6" />, count: "120+" },
    { name: t('explore.categories.portfolio'), icon: <Code className="w-6 h-6" />, count: "98+" },
    { name: t('explore.categories.blog'), icon: <Globe className="w-6 h-6" />, count: "76+" },
    { name: t('explore.categories.corporate'), icon: <Shield className="w-6 h-6" />, count: "54+" },
    { name: t('explore.categories.dashboard'), icon: <BarChart3 className="w-6 h-6" />, count: "43+" },
    { name: t('explore.categories.social'), icon: <Smartphone className="w-6 h-6" />, count: "32+" },
  ];

  const features = [
    {
      icon: <Rocket className="w-6 h-6" />,
      title: t('home.features.easySharing.title'),
      description: t('home.features.easySharing.description')
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t('home.features.realTimeData.title'),
      description: t('home.features.realTimeData.description')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('home.features.modernTech.title'),
      description: t('home.features.modernTech.description')
    }
  ];

  const howItWorksSteps = [
    {
      icon: <Users className="w-8 h-8" />,
      title: t('home.howItWorks.register.title'),
      description: t('home.howItWorks.register.description'),
      number: "01"
    },
    {
      icon: <Plus className="w-8 h-8" />,
      title: t('home.howItWorks.submit.title'),
      description: t('home.howItWorks.submit.description'),
      number: "02"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: t('home.howItWorks.discover.title'),
      description: t('home.howItWorks.discover.description'),
      number: "03"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated mesh gradient - updated to grayscale */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, rgba(55, 65, 81, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(75, 85, 99, 0.08) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(107, 114, 128, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(55, 65, 81, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(75, 85, 99, 0.08) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(107, 114, 128, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(55, 65, 81, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(75, 85, 99, 0.08) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(107, 114, 128, 0.08) 0%, transparent 50%)'
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          />
        </div>

        {/* Enhanced floating elements - fixed hydration error */}
        <div className="absolute inset-0">
          {floatingDots.map((dot) => (
            <motion.div
              key={dot.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full opacity-20"
              animate={{
                y: [0, -100, -200, -300],
                opacity: [0, 0.6, 0.3, 0],
                scale: [1, 1.2, 0.8, 0.5]
              }}
              transition={{
                duration: dot.duration,
                repeat: Infinity,
                delay: dot.delay,
                ease: "easeOut"
              }}
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated background blobs - updated to grayscale */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gray-200/20 to-gray-300/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.1, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-10"
          >
            {/* Enhanced Badge - updated to grayscale */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <SparklesIcon className="w-4 h-4 text-gray-600" />
              </motion.div>
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-semibold">
                {t('home.hero.badge') || 'Dijital Dünyada Farkınızı Yaratın'}
              </span>
            </motion.div>

            {/* Enhanced Main Heading */}
            <div className="space-y-8">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight"
              >
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {t('home.hero.title')}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
              >
                {t('home.hero.subtitle')}
              </motion.p>

              {/* InferyHub Announcement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="mt-6"
              >
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 backdrop-blur-sm rounded-full border border-emerald-200 shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
                                     <span className="text-emerald-700 font-medium text-sm">
                     🎉 Artık InferyHub.com&apos;dayız!
                   </span>
                </div>
              </motion.div>
            </div>

            {/* Enhanced CTA Buttons - updated to grayscale */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            >
              <Link href="/explore">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Button size="lg" className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl">
                    {t('home.hero.exploreButton')}
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/submit">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm bg-white/80 shadow-lg hover:shadow-xl">
                    {t('home.hero.submitButton')}
                    <motion.div
                      animate={{ rotate: [0, 90, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="ml-2 group-hover:rotate-90 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Social Proof - updated with real data */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="pt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full border-2 border-white" />
                  ))}
                </div>
                <span>{loading ? 'Yükleniyor...' : `${stats.totalUsers}+ aktif kullanıcı`}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-600 fill-current" />
                <span>4.9/5 kullanıcı memnuniyeti</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <span>Güvenli ve hızlı</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Section - updated to grayscale */}
      <section className="py-24 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(55,65,81,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(75,85,99,0.05)_0%,transparent_50%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                Rakamlarla Başarımız
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Her geçen gün büyüyen topluluğumuzla birlikte dijital dünyada iz bırakıyoruz
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('home.stats.websites'), value: stats.totalWebsites, icon: <Globe className="w-7 h-7" />, color: 'from-gray-600 to-gray-800' },
              { label: t('home.stats.users'), value: stats.totalUsers, icon: <Users className="w-7 h-7" />, color: 'from-gray-500 to-gray-700' },
              { label: t('home.stats.views'), value: stats.totalViews.toLocaleString(), icon: <Eye className="w-7 h-7" />, color: 'from-gray-700 to-gray-900' },
              { label: t('home.stats.likes'), value: stats.totalLikes.toLocaleString(), icon: <Heart className="w-7 h-7" />, color: 'from-gray-600 to-gray-800' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-6 text-white shadow-lg`}
                  >
                    {stat.icon}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full mx-auto"
                      />
                    ) : (
                      stat.value
                    )}
                  </motion.div>
                  
                  <div className="text-gray-600 font-medium text-lg">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section - updated to grayscale */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(55,65,81,0.03)_0%,transparent_70%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                {t('home.features.title')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('home.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-2xl mb-6 shadow-lg"
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Enhanced with animations */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                {t('home.categories.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                {t('home.categories.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-all duration-300"
                    >
                      {category.icon}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.count} websites</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced with animations */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/30 via-transparent to-gray-50/30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                {t('home.howItWorks.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="text-center relative group"
              >
                <div className="relative mb-8">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl group-hover:bg-black group-hover:text-white transition-all duration-300"
                  >
                    {step.icon}
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold"
                  >
                    {step.number}
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Websites Section - Enhanced with animations */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.03)_0%,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                {t('home.featured.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                {t('home.featured.subtitle')}
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full"
              />
              <p className="mt-4 text-gray-600">{t('home.loading')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWebsites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg overflow-hidden group cursor-pointer"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {website.imageUrl && (
                      <Image
                        src={website.imageUrl}
                        alt={website.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {website.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {website.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{website.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{website.likes}</span>
                        </span>
                      </div>
                      <Link href={`/website/${website.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                            {t('home.viewSite')}
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/explore">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300">
                  {t('home.viewAllWebsites')}
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced with animations */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                    {t('home.cta.joinNow')}
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/explore">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-black text-white hover:bg-gray-800 border-2 border-white hover:border-gray-300 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                    {t('home.cta.explore')}
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Search className="ml-2 w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Adsterra Ad Script */}
      <Script
        id="adsterra-ad-script"
        src="https://pl22508146.profitablegatecpm.com/cf/47/88/cf478885031b7b93e8a7e0e2e8b5b8b4.js"
        strategy="afterInteractive"
      />
      
      {/* Ad Placement Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">
                {t('common.advertisement')}
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('common.yourAdHere')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('common.contactForAdvertising')}
              </p>
            </motion.div>
          </div>
          
          {/* Ad Banner */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 p-8 text-center max-w-4xl w-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center"
                >
                  <Sparkles className="w-10 h-10 text-gray-500" />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {t('common.adSpace')}
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                    {t('common.adSpaceDescription')}
                  </p>
                </div>
                
                {/* Adsterra unit placeholder */}
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-8 text-gray-500 border-2 border-dashed border-gray-300">
                  <div className="space-y-3">
                    <p className="text-xl font-bold">320 x 50</p>
                    <p className="text-lg">Adsterra Ad Unit</p>
                    <p className="text-sm opacity-75">Mobile Banner</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    {t('common.contactForAdvertising')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
