"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Globe, 
  Code, 
  Rocket, 
  Heart, 
  ExternalLink,
  Linkedin,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Zap,
  Database,
  Server,
  Monitor
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  
  const technologies = [
    {
      category: t('about.techCategories.frontend'),
      icon: Monitor,
      items: ["Next.js 15.3.4", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Shadcn/ui"]
    },
    {
      category: t('about.techCategories.backend'),
      icon: Server,
      items: ["Firebase Auth", "Firestore", "Firebase Storage", "Cloud Functions"]
    },
    {
      category: t('about.techCategories.storage'),
      icon: Database,
      items: ["NFT.Storage", "IPFS", "Filecoin", "Firebase Storage"]
    },
    {
      category: t('about.techCategories.tools'),
      icon: Zap,
      items: ["Vercel", "ESLint", "PostCSS", "Lucide Icons"]
    }
  ];

  const stats = [
    { label: t('about.stats.developmentTime'), value: t('about.stats.developmentTimeValue'), icon: Calendar },
    { label: t('about.stats.codeLines'), value: t('about.stats.codeLinesValue'), icon: Code },
    { label: t('about.stats.components'), value: t('about.stats.componentsValue'), icon: Sparkles },
    { label: t('about.stats.pages'), value: t('about.stats.pagesValue'), icon: Globe }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm mb-6">
            <Heart className="w-4 h-4 mr-2" />
            {t('about.madeTurkey')}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('about.title')}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.techStack')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with the most modern and reliable technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mr-3">
                      <tech.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{tech.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {tech.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground flex items-center">
                        <Zap className="w-3 h-3 mr-2 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Developer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.developer.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('about.developer.subtitle')}
            </p>
          </div>

          <Card className="p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto md:mx-0 mb-4 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold mb-2">{t('about.developer.name')}</h3>
                <p className="text-primary font-medium mb-3">{t('about.developer.role')}</p>
                <p className="text-muted-foreground mb-6">
                  {t('about.developer.description')}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://www.linkedin.com/in/enes-ba%C5%9F-8430b81b1/" target="_blank">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://enesbas.vercel.app/" target="_blank">
                      <Globe className="w-4 h-4 mr-2" />
                      {t('about.developer.portfolio')}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Company Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.company.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('about.company.subtitle')}
            </p>
          </div>

          <Card className="p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="w-32 h-32 mx-auto md:mx-0 mb-4 flex items-center justify-center">
                  <Image
                    src="/sirket.png" 
                    alt="Nefrius Logo" 
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold mb-2">{t('about.company.name')}</h3>
                <p className="text-blue-600 font-medium mb-3">Software Development Company</p>
                <p className="text-muted-foreground mb-4">
                  {t('about.company.description')}
                </p>
                
                <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Founded: 2025
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Turkey
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://www.linkedin.com/company/nefrius/" target="_blank">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://nefrius.vercel.app/" target="_blank">
                      <Globe className="w-4 h-4 mr-2" />
                      {t('about.company.website')}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mb-16"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">{t('about.mission')}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              {t('about.missionDescription')}
            </p>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">{t('about.cta.title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('about.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/submit">
                <Rocket className="mr-2 h-4 w-4" />
                {t('about.cta.addWebsite')}
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <Link href="/explore">
                <Globe className="mr-2 h-4 w-4" />
                {t('about.cta.exploreProjects')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 