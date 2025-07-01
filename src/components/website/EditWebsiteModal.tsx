"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Globe, AlertCircle } from "lucide-react";
import { Website, WebsiteCategory, Technology, WebsitePurpose } from "@/types/website";
import { updateWebsite } from "@/lib/firestore";
import { useLanguage } from "@/contexts/LanguageContext";

const categoryLabels = {
  [WebsiteCategory.ECOMMERCE]: "E-ticaret",
  [WebsiteCategory.PORTFOLIO]: "Portfolio", 
  [WebsiteCategory.BLOG]: "Blog",
  [WebsiteCategory.CORPORATE]: "Kurumsal",
  [WebsiteCategory.LANDING]: "Landing Page",
  [WebsiteCategory.DASHBOARD]: "Dashboard",
  [WebsiteCategory.SOCIAL]: "Sosyal Medya",
  [WebsiteCategory.EDUCATIONAL]: "Eğitim",
  [WebsiteCategory.NEWS]: "Haber",
  [WebsiteCategory.OTHER]: "Diğer"
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

interface EditWebsiteModalProps {
  website: Website;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWebsite: Website) => void;
}

export default function EditWebsiteModal({ website, isOpen, onClose, onSuccess }: EditWebsiteModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const [formData, setFormData] = useState({
    title: website.title,
    description: website.description,
    url: website.url,
    imageUrl: website.imageUrl || null,
    category: website.category,
    technologies: website.technologies,
    purpose: website.purpose
  });

  // Update form data when website prop changes
  useEffect(() => {
    setFormData({
      title: website.title,
      description: website.description,
      url: website.url,
      imageUrl: website.imageUrl || null,
      category: website.category,
      technologies: website.technologies,
      purpose: website.purpose
    });
  }, [website]);

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

      // Update website
      await updateWebsite(website.id, {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        ...(formData.imageUrl !== null && { imageUrl: formData.imageUrl }),
        category: formData.category,
        technologies: formData.technologies,
        purpose: formData.purpose
      });

      // Create updated website object for callback
      const updatedWebsite: Website = {
        ...website,
        title: formData.title,
        description: formData.description,
        url: formData.url,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category,
        technologies: formData.technologies,
        purpose: formData.purpose,
        updatedAt: new Date()
      };

      onSuccess(updatedWebsite);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      setError(error instanceof Error ? error.message : "Website güncellenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('common.edit')} {t('common.website')}</DialogTitle>
          <DialogDescription>
            {t('submit.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Website Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Website Başlığı *</Label>
            <Input
              id="edit-title"
              placeholder="Örn: Harika E-ticaret Mağazam"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-url">Website URL *</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-url"
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
            <Label htmlFor="edit-description">Açıklama *</Label>
            <Textarea
              id="edit-description"
              placeholder="Websitenizin ne hakkında olduğunu ve özelliklerini açıklayın..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
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
              websiteId={website.id}
              currentImageUrl={formData.imageUrl || undefined}
              onImageChange={handleImageChange}
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
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
            <Label>Amaç *</Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => handleInputChange("purpose", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Website amacını seçin" />
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
            <Label>Teknolojiler</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Kullandığınız teknolojileri seçin (opsiyonel)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {Object.entries(technologyLabels).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.technologies.includes(value as Technology) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTechnologyToggle(value as Technology)}
                  disabled={isLoading}
                  className="justify-start text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 