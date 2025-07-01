"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-12">
            
            {/* 404 Animation */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 100 
              }}
              className="mb-8"
            >
              <div className="relative">
                <h1 className="text-9xl font-bold text-primary/20 select-none">
                  404
                </h1>
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <AlertTriangle className="h-16 w-16 text-amber-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold mb-4">
                {t('notFound.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                {t('notFound.subtitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('notFound.subtitle')}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>

              <Button
                asChild
                size="lg"
                className="flex items-center gap-2"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  {t('nav.home')}
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="flex items-center gap-2"
              >
                <Link href="/explore">
                  <Search className="h-4 w-4" />
                  {t('nav.explore')}
                </Link>
              </Button>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-8 pt-8 border-t border-muted"
            >
              <p className="text-sm text-muted-foreground">
                Problem devam ediyorsa, bize{" "}
                <Link 
                  href="/profile" 
                  className="text-primary hover:underline font-medium"
                >
                  iletişim sayfasından
                </Link>{" "}
                ulaşabilirsiniz.
              </p>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 