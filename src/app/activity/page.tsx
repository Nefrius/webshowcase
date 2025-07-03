'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActivityStats } from '@/hooks/useActivityStats';
import ActivityFeed from '@/components/ui/ActivityFeed';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock,
  RefreshCw,
  Settings,
  Loader2
} from 'lucide-react';

const ActivityPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { today, thisWeek, following, loading, error } = useActivityStats(user?.uid || null);

  const activityStats = [
    {
      title: language === 'tr' ? 'Bugün' : 'Today',
      count: today,
      icon: Clock,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      title: language === 'tr' ? 'Bu Hafta' : 'This Week', 
      count: thisWeek,
      icon: TrendingUp,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      title: language === 'tr' ? 'Takip Edilenler' : 'Following',
      count: following,
      icon: Users,
      color: 'bg-gray-100 text-gray-700'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Activity className="h-8 w-8" />
                {language === 'tr' ? 'Aktivite Akışı' : 'Activity Feed'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'tr' 
                  ? 'Takip ettiğiniz kullanıcıların son aktivitelerini görün'
                  : 'See the latest activities from users you follow'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {language === 'tr' ? 'Ayarlar' : 'Settings'}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === 'tr' ? 'Yenile' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {activityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">
                        {loading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : error ? (
                          <span className="text-red-500">-</span>
                        ) : (
                          stat.count
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        {user ? (
          <ActivityFeed
            userId={user.uid}
            showFilters={true}
            limit={20}
            className="max-w-4xl mx-auto"
          />
        ) : (
          <Card className="p-8 text-center max-w-2xl mx-auto">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'tr' ? 'Giriş Yapın' : 'Sign In Required'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'tr' 
                ? 'Aktivite akışını görmek için giriş yapın'
                : 'Sign in to see your activity feed'}
            </p>
            <Button>
              {language === 'tr' ? 'Giriş Yap' : 'Sign In'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ActivityPage; 