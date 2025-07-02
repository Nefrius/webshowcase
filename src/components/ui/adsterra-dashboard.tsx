"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye, MousePointer, TrendingUp, RefreshCw } from "lucide-react";
import { getCurrentMonthRevenue, getDailyStats, AdsterraStats } from "@/lib/adsterra";

export default function AdsterraDashboard() {
  const [stats, setStats] = useState<AdsterraStats[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdsterraData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current month revenue
      const revenue = await getCurrentMonthRevenue();
      setMonthlyRevenue(revenue);

      // Get last 7 days stats - Fix date calculation
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Add debugging for date calculation
      console.log('Dashboard date calculation:', {
        todayObject: today,
        todayYear: today.getFullYear(),
        todayMonth: today.getMonth() + 1,
        todayDate: today.getDate(),
        sevenDaysAgoObject: sevenDaysAgo,
        note: 'These should be 2024 dates, not 2025!'
      });
      
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      const dateTo = today.toISOString().split('T')[0];
      
      console.log('Dashboard final date strings:', { dateFrom, dateTo });
      
      const dailyStats = await getDailyStats(dateFrom, dateTo);
      setStats(dailyStats);
    } catch (err) {
      setError('Adsterra verilerine ulaşılamadı');
      console.error('Adsterra API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Client-side ad network debug info
    console.log('🎯 Ad Networks Status:');
    console.log('- Google AdSense: Loaded');
    console.log('- Adsterra: Script loading...');
    console.log('- Profitable Rate CPM #1: Script loading...');
    console.log('- Profitable Rate CPM #2: Script loading...');
    console.log('⚠️ Not showing ads? Check:');
    console.log('  1. Ad blocker software disabled?');
    console.log('  2. Network requests blocked?');
    console.log('  3. Developer console for script errors');
    
    // Check if scripts loaded after a delay
    setTimeout(() => {
      const scripts = document.querySelectorAll('script[src*="profitableratecpm"]');
      console.log('📊 Found ad scripts:', scripts.length);
      
      // Check for any blocked requests in Network tab
      if (scripts.length === 0) {
        console.warn('❌ No ad scripts found - likely blocked by ad blocker');
      }
    }, 3000);
    
    fetchAdsterraData();
  }, []);

  // Calculate totals from stats
  const totalImpressions = stats.reduce((sum, day) => sum + day.impressions, 0);
  const totalClicks = stats.reduce((sum, day) => sum + day.clicks, 0);
  const weeklyRevenue = stats.reduce((sum, day) => sum + day.revenue, 0);
  const averageCTR = stats.length > 0 
    ? stats.reduce((sum, day) => sum + day.ctr, 0) / stats.length 
    : 0;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yükleniyor...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Veriler getiriliyor...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Adsterra Reklam İstatistikleri
          </CardTitle>
          <CardDescription>Son 7 günlük performans verileri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAdsterraData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Adsterra Reklam İstatistikleri</h3>
        <Button onClick={fetchAdsterraData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Mevcut aya ait toplam gelir
            </p>
          </CardContent>
        </Card>

        {/* Weekly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Haftalık Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${weeklyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Son 7 günlük toplam gelir
            </p>
          </CardContent>
        </Card>

        {/* Total Impressions (Last 7 days) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gösterimler</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Son 7 günlük toplam
            </p>
          </CardContent>
        </Card>

        {/* Total Clicks (Last 7 days) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tıklamalar</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Son 7 günlük toplam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second row for additional metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Average CTR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Son 7 günlük ortalama
            </p>
          </CardContent>
        </Card>

        {/* Total Impressions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gösterim</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Son 7 günün toplamı
            </p>
          </CardContent>
        </Card>

        {/* Active Ad Units */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Reklamlar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Adsterra + CPM ağları
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Table */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Günlük Performans</CardTitle>
            <CardDescription>Son 7 günün detaylı istatistikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Tarih</th>
                    <th className="text-right p-2">Gösterimler</th>
                    <th className="text-right p-2">Tıklamalar</th>
                    <th className="text-right p-2">CTR</th>
                    <th className="text-right p-2">CPM</th>
                    <th className="text-right p-2">Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {new Date(day.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="text-right p-2">{day.impressions.toLocaleString()}</td>
                      <td className="text-right p-2">{day.clicks.toLocaleString()}</td>
                      <td className="text-right p-2">{day.ctr.toFixed(2)}%</td>
                      <td className="text-right p-2">${day.cpm.toFixed(2)}</td>
                      <td className="text-right p-2 font-medium">${day.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 