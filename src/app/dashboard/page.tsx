"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Users, 
  Globe, 
  Eye, 
  Heart, 
  MessageSquare,
  Calendar,
  Activity,
  Star,
  ArrowUp,
  ArrowDown,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { getPlatformAnalytics, getUserAnalytics, AnalyticsData, UserAnalytics } from "@/lib/analytics";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [platformData, setPlatformData] = useState<AnalyticsData | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'platform' | 'personal'>('personal');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
        const [platformAnalytics, userStats] = await Promise.all([
          getPlatformAnalytics(),
          getUserAnalytics(user.uid)
        ]);
        
        setPlatformData(platformAnalytics);
        setUserAnalytics(userStats);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant={selectedTab === 'personal' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('personal')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              {t('dashboard.personalStats')}
            </Button>
            <Button
              variant={selectedTab === 'platform' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('platform')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {t('dashboard.platformStats')}
            </Button>
          </div>
        </motion.div>

        {selectedTab === 'personal' && userAnalytics && (
          <PersonalAnalytics data={userAnalytics} />
        )}

        {selectedTab === 'platform' && platformData && (
          <PlatformAnalytics data={platformData} />
        )}
      </div>
    </div>
  );
}

// Personal Analytics Component
function PersonalAnalytics({ data }: { data: UserAnalytics }) {
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboard.totalWebsites')}
          value={data.totalWebsites}
          icon={<Globe className="h-5 w-5" />}
          trend={data.totalWebsites > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title={t('dashboard.totalViews')}
          value={data.totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          trend={data.totalViews > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title={t('dashboard.totalLikes')}
          value={data.totalLikes.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
          trend={data.totalLikes > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          title={t('dashboard.totalFollowers')}
          value={data.totalFollowers}
          icon={<Users className="h-5 w-5" />}
          trend={data.totalFollowers > 0 ? 'up' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Websites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t('dashboard.topWebsites')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topWebsites.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('dashboard.noWebsites')}
              </p>
            ) : (
              <div className="space-y-4">
                {data.topWebsites.map((website, index) => (
                  <div key={website.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{website.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {website.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {website.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {website.comments.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Website Kategorileri</CardTitle>
          </CardHeader>
          <CardContent>
            {data.websitesByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Henüz kategori verisi yok
              </p>
            ) : (
              <div className="space-y-3">
                {data.websitesByCategory.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.count} (%{category.percentage.toFixed(1)})
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Platform Analytics Component
function PlatformAnalytics({ data }: { data: AnalyticsData }) {
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Toplam Website"
          value={data.totalWebsites.toLocaleString()}
          icon={<Globe className="h-5 w-5" />}
          trend="up"
          subtitle={`Bu ay: +${data.websitesThisMonth}`}
        />
        <StatsCard
          title="Toplam Kullanıcı"
          value={data.totalUsers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          trend="up"
          subtitle={`Bu ay: +${data.usersThisMonth}`}
        />
        <StatsCard
          title="Toplam Görüntüleme"
          value={data.totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="Toplam Beğeni"
          value={data.totalLikes.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>En Popüler Kategoriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCategories.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      #{index + 1} {category.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {category.count} (%{category.percentage.toFixed(1)})
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Technologies */}
        <Card>
          <CardHeader>
            <CardTitle>En Popüler Teknolojiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topTechnologies.map((tech, index) => (
                <div key={tech.technology} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      #{index + 1} {tech.technology}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tech.count} (%{tech.percentage.toFixed(1)})
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tech.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Henüz aktivite yok
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user.photoURL} />
                    <AvatarFallback>
                      {activity.user.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {activity.createdAt.toDate().toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {activity.type === 'website_created' && 'Yeni Website'}
                    {activity.type === 'user_joined' && 'Yeni Üye'}
                    {activity.type === 'website_liked' && 'Beğeni'}
                    {activity.type === 'comment_added' && 'Yorum'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
            {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
            <div className="text-primary">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 