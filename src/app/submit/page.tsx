"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Globe, Plus, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { WebsiteCategory, Technology, WebsitePurpose } from "@/types/website";
import { addWebsite } from "@/lib/firestore";

export default function SubmitWebsitePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const categoryLabels = {
    [WebsiteCategory.ECOMMERCE]: t('explore.categories.ecommerce'),
    [WebsiteCategory.PORTFOLIO]: t('explore.categories.portfolio'), 
    [WebsiteCategory.BLOG]: t('explore.categories.blog'),
    [WebsiteCategory.CORPORATE]: t('explore.categories.corporate'),
    [WebsiteCategory.LANDING]: t('explore.categories.landing'),
    [WebsiteCategory.DASHBOARD]: t('explore.categories.dashboard'),
    [WebsiteCategory.SOCIAL]: t('explore.categories.social'),
    [WebsiteCategory.EDUCATIONAL]: t('explore.categories.educational'),
    [WebsiteCategory.NEWS]: t('explore.categories.news'),
    [WebsiteCategory.OTHER]: t('explore.categories.other')
  };

  const technologyLabels = {
    [Technology.REACT]: "React",
    [Technology.VUE]: "Vue.js",
    [Technology.ANGULAR]: "Angular",
    [Technology.NEXTJS]: "Next.js",
    [Technology.NUXTJS]: "Nuxt.js",
    [Technology.SVELTE]: "Svelte",
    [Technology.NODEJS]: "Node.js",
    [Technology.PYTHON]: "Python",
    [Technology.PHP]: "PHP",
    [Technology.JAVA]: "Java",
    [Technology.CSHARP]: "C#",
    [Technology.RUBY]: "Ruby",
    [Technology.TAILWIND]: "Tailwind CSS",
    [Technology.BOOTSTRAP]: "Bootstrap",
    [Technology.BULMA]: "Bulma",
    [Technology.CHAKRA]: "Chakra UI",
    [Technology.MONGODB]: "MongoDB",
    [Technology.MYSQL]: "MySQL",
    [Technology.POSTGRESQL]: "PostgreSQL",
    [Technology.FIREBASE]: "Firebase",
    [Technology.SUPABASE]: "Supabase",
    [Technology.WORDPRESS]: "WordPress",
    [Technology.WEBFLOW]: "Webflow",
    [Technology.SHOPIFY]: "Shopify",
    [Technology.REACT_NATIVE]: "React Native",
    [Technology.FLUTTER]: "Flutter"
  };

  const purposeLabels = {
    [WebsitePurpose.BUSINESS]: "İş/Ticaret",
    [WebsitePurpose.PERSONAL]: "Kişisel",
    [WebsitePurpose.STARTUP]: "Startup",
    [WebsitePurpose.AGENCY]: "Ajans",
    [WebsitePurpose.FREELANCE]: "Freelance",
    [WebsitePurpose.EDUCATION]: "Eğitim",
    [WebsitePurpose.NON_PROFIT]: "Kar Amacı Gütmeyen",
    [WebsitePurpose.GOVERNMENT]: "Devlet",
    [WebsitePurpose.OTHER]: "Diğer"
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    technologies: [] as Technology[],
    purpose: "",
    imageUrl: null as string | null
  });

  // Giriş yapmamış kullanıcıları yönlendir
  useEffect(() => {
    if (user === null) { // null means not logged in, undefined means loading
      router.push("/login");
    }
  }, [user, router]);

  // Loading state for auth
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechnologyToggle = (tech: Technology) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter(t => t !== tech)
        : [...prev.technologies, tech]
    }));
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };

  // Generate a temporary ID for image uploads before website is created
  const tempWebsiteId = `temp_${user?.uid}_${Date.now()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // URL validation
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.url)) {
        setError("Geçerli bir URL girin (https:// ile başlamalı)");
        return;
      }

      // Form validation
      if (!formData.title || !formData.description || !formData.category || !formData.purpose) {
        setError("Lütfen tüm zorunlu alanları doldurun");
        return;
      }

      // Check if user is blocked
      if (user.isBlocked) {
        setError("Hesabınız engellenmiş durumda. Yeni website ekleyemezsiniz.");
        return;
      }

      // Import spam detection here to avoid build issues
      const { detectSpam } = await import('@/lib/moderation');

      // Spam detection
      const spamResult = await detectSpam({
        title: formData.title,
        description: formData.description,
        url: formData.url,
        userId: user.uid
      });

      let status = 'approved'; // Default status
      
      if (spamResult.isSpam) {
        // If spam is detected with high confidence, set to pending for manual review
        if (spamResult.confidence > 0.7) {
          status = 'pending';
          setError(`İçeriğiniz moderasyon için beklemede. Sebep: ${spamResult.reasons.join(', ')}`);
        } else {
          // Lower confidence, approve but flag
          console.log('Low confidence spam detected:', spamResult.reasons);
        }
      }

      // Firestore'a kaydet
      const websiteData = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
        category: formData.category as WebsiteCategory,
        technologies: formData.technologies,
        purpose: formData.purpose as WebsitePurpose,
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Anonim",
        isPremium: user.isPremium || false,
        featured: false,
        status,
        ...(spamResult.isSpam && { 
          spamFlags: spamResult.flags,
          spamConfidence: spamResult.confidence 
        })
      };

      const websiteId = await addWebsite(websiteData);
      console.log("Website added with ID:", websiteId);

      setSuccess(true);
      
      // Show different messages based on status
      if (status === 'pending') {
        setTimeout(() => {
          router.push("/my-websites");
        }, 3000);
      } else {
        setTimeout(() => {
          router.push("/my-websites");
        }, 2000);
      }

    } catch (error) {
      console.error("Submit error:", error);
      setError(error instanceof Error ? error.message : "Website eklenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('common.success')}</h2>
          <p className="text-muted-foreground">{t('submit.success')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('submit.title')}</h1>
            <p className="text-muted-foreground">
              {t('submit.subtitle')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('submit.title')}
              </CardTitle>
              <CardDescription>
                {t('submit.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-6">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Website Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{t('submit.websiteTitle')} *</Label>
                  <Input
                    id="title"
                    placeholder={t('submit.websiteTitle')}
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="url">{t('submit.websiteUrl')} *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.url}
                      onChange={(e) => handleInputChange("url", e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t('submit.description')} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t('submit.description')}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Website Image */}
                <div className="space-y-2">
                  <Label>Website Görseli</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Websitenizin önizleme görseli (opsiyonel)
                  </p>
                  <ImageUpload
                    websiteId={tempWebsiteId}
                    currentImageUrl={formData.imageUrl || undefined}
                    onImageChange={handleImageChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>{t('submit.category')} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('submit.category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label>{t('submit.purpose')} *</Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => handleInputChange("purpose", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('submit.purpose')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(purposeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                  <Label>{t('submit.technologies')}</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('submit.technologies')}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(technologyLabels).map(([value, label]) => (
                      <Button
                        key={value}
                        type="button"
                        variant={formData.technologies.includes(value as Technology) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTechnologyToggle(value as Technology)}
                        disabled={isLoading}
                        className="justify-start"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? t('submit.submitting') : t('submit.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 