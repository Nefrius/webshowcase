"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Clock, 
  Flag, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { hasAdminPermissions, getAdminDashboardData, approveWebsite, rejectWebsite, reviewReport } from "@/lib/moderation";
import { syncAllWebsiteCounts } from "@/lib/social";
import { AdminDashboardData } from "@/types/moderation";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasAdminPermissions(user)) {
      router.push('/');
      return;
    }

    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWebsite = async (websiteId: string) => {
    try {
      await approveWebsite(websiteId, user!.uid);
      await loadDashboardData();
    } catch (err) {
      console.error('Error approving website:', err);
    }
  };

  const handleRejectWebsite = async (websiteId: string) => {
    try {
      await rejectWebsite(websiteId, user!.uid, 'Admin tarafından reddedildi');
      await loadDashboardData();
    } catch (err) {
      console.error('Error rejecting website:', err);
    }
  };

  const handleReviewReport = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      await reviewReport(reportId, user!.uid, status);
      await loadDashboardData();
    } catch (err) {
      console.error('Error reviewing report:', err);
    }
  };

  const handleSyncWebsiteCounts = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      
      const result = await syncAllWebsiteCounts();
      
      if (result.success) {
        setSyncResult(`✅ ${result.processed} website başarıyla senkronize edildi!`);
        await loadDashboardData(); // Refresh data
      } else {
        setSyncResult(`❌ Senkronizasyon başarısız. ${result.errors.length} hata.`);
      }
      
      // Clear result after 5 seconds
      setTimeout(() => setSyncResult(null), 5000);
    } catch (err) {
      console.error('Error syncing website counts:', err);
      setSyncResult('❌ Senkronizasyon sırasında hata oluştu.');
      setTimeout(() => setSyncResult(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  if (!user || !hasAdminPermissions(user)) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Hata</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen pt-16 py-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          
          {/* Sync Result Message */}
          {syncResult && (
            <div className="bg-background border rounded-lg px-3 py-2 text-sm">
              {syncResult}
            </div>
          )}
          
          <div className="ml-auto flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSyncWebsiteCounts}
              disabled={syncing}
            >
              {syncing ? '🔄 Senkronize ediliyor...' : '🔄 Sayıları Senkronize Et'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
            >
              Yenile
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Websiteler</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingWebsites.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Raporlar</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dashboardData.stats.pendingReports}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Rapor</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.stats.totalReports}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Bloklar</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.stats.activeBlocks}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Websites */}
        {dashboardData.pendingWebsites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Onay Bekleyen Websiteler ({dashboardData.pendingWebsites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.pendingWebsites.slice(0, 5).map((website) => (
                  <div key={website.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{website.title}</h4>
                      <p className="text-sm text-muted-foreground">{website.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{website.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(website.createdAt), { 
                            addSuffix: true, 
                            locale: tr 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveWebsite(website.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectWebsite(website.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Son Raporlar ({dashboardData.recentReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentReports.slice(0, 10).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        report.status === 'pending' ? 'destructive' :
                        report.status === 'resolved' ? 'default' : 'secondary'
                      }>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.reason}</Badge>
                    </div>
                    <h4 className="font-semibold">{report.targetTitle || report.targetId}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.reporterName} tarafından rapor edildi
                    </p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        &ldquo;{report.description}&rdquo;
                      </p>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(report.createdAt.toDate(), { 
                        addSuffix: true, 
                        locale: tr 
                      })}
                    </span>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReviewReport(report.id, 'resolved')}
                      >
                        Çözüldü
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReviewReport(report.id, 'dismissed')}
                      >
                        Reddet
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Flagged Users */}
        {dashboardData.flaggedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Uyarı Almış Kullanıcılar ({dashboardData.flaggedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.flaggedUsers.slice(0, 5).map((flaggedUser) => (
                  <div key={flaggedUser.uid} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={flaggedUser.photoURL || ''} />
                        <AvatarFallback>
                          {flaggedUser.displayName?.charAt(0) || flaggedUser.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {flaggedUser.displayName || 'Anonim Kullanıcı'}
                        </h4>
                        <p className="text-sm text-muted-foreground">{flaggedUser.email}</p>
                        <Badge variant="destructive" className="mt-1">
                          {flaggedUser.warningCount} Uyarı
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/profile/${flaggedUser.uid}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Görüntüle
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Moderasyon İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.stats.resolvedReports}
                  </div>
                  <div className="text-sm text-muted-foreground">Çözülen Rapor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {dashboardData.stats.dismissedReports}
                  </div>
                  <div className="text-sm text-muted-foreground">Reddedilen Rapor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.stats.totalActions}
                  </div>
                  <div className="text-sm text-muted-foreground">Toplam Aksiyon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData.stats.spamDetected}
                  </div>
                  <div className="text-sm text-muted-foreground">Spam Tespit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 