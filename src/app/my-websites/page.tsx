"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Heart, ExternalLink, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Website, WebsiteCategory, Technology} from "@/types/website";
import { getUserWebsites, deleteWebsite } from "@/lib/firestore";
import EditWebsiteModal from "@/components/website/EditWebsiteModal";

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

export default function MyWebsitesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Giriş yapmamış kullanıcıları yönlendir
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Kullanıcının websitelerini yükle
  useEffect(() => {
    const loadUserWebsites = async () => {
      if (!user) return;
      
      setLoading(true);
      setError("");
      
      try {
        const userWebsites = await getUserWebsites(user.uid);
        setWebsites(userWebsites);
      } catch (error) {
        console.error("Error loading user websites:", error);
        setError("Websiteleriniz yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadUserWebsites();
  }, [user]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleDeleteWebsite = async (websiteId: string, websiteTitle: string) => {
    if (window.confirm(`"${websiteTitle}" websitesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        await deleteWebsite(websiteId);
        setWebsites(prev => prev.filter(website => website.id !== websiteId));
        setSuccess(`"${websiteTitle}" başarıyla silindi.`);
        setError("");
        
        // Success mesajını 3 saniye sonra temizle
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error('Error deleting website:', error);
        setError('Website silinirken hata oluştu. Lütfen tekrar deneyin.');
        setSuccess("");
      }
    }
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedWebsite: Website) => {
    setWebsites(prev => 
      prev.map(website => 
        website.id === updatedWebsite.id ? updatedWebsite : website
      )
    );
    setSuccess(`"${updatedWebsite.title}" başarıyla güncellendi.`);
    setError("");
    
    // Success mesajını 3 saniye sonra temizle
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWebsite(null);
  };

  if (!user) {
    return null; // Loading state while redirecting
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('myWebsites.title')}</h1>
            <p className="text-muted-foreground">
              {t('myWebsites.subtitle')}
            </p>
          </div>
          <Button asChild size="lg" className="mt-4 md:mt-0">
            <Link href="/submit">
              <Plus className="mr-2 h-4 w-4" />
              {t('myWebsites.addNewWebsite')}
            </Link>
          </Button>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('myWebsites.loadingWebsites')}</p>
          </div>
        ) : websites.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('myWebsites.noWebsites')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('myWebsites.noWebsitesDescription')}
            </p>
            <Button asChild>
              <Link href="/submit">
                <Plus className="mr-2 h-4 w-4" />
                {t('myWebsites.addFirstWebsite')}
              </Link>
            </Button>
          </motion.div>
        ) : (
          /* Websites List */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6"
          >
            {websites.map((website, index) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{website.title}</CardTitle>
                          {website.isPremium && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                              Premium
                            </Badge>
                          )}
                          {website.featured && (
                            <Badge variant="secondary">
                              Öne Çıkan
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {website.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={website.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditWebsite(website)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteWebsite(website.id, website.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Website Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>{categoryLabels[website.category]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{website.views} görüntülenme</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{website.likes} beğeni</span>
                      </div>
                    </div>

                    {/* Technologies */}
                    {website.technologies.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Teknolojiler:</p>
                        <div className="flex flex-wrap gap-2">
                          {website.technologies.slice(0, 5).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {technologyLabels[tech]}
                            </Badge>
                          ))}
                          {website.technologies.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{website.technologies.length - 5} daha
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Eklenme tarihi: {formatDate(website.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats Summary */}
        {websites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 bg-muted/30 rounded-lg"
          >
            <h3 className="font-semibold mb-4">İstatistikler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {websites.length}
                </div>
                <div className="text-sm text-muted-foreground">Toplam Website</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {websites.reduce((sum, website) => sum + website.views, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Toplam Görüntülenme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {websites.reduce((sum, website) => sum + website.likes, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Toplam Beğeni</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit Website Modal */}
        {editingWebsite && (
          <EditWebsiteModal
            website={editingWebsite}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  );
} 