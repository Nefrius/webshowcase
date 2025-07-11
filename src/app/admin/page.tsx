'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  AlertCircle, 
  Ban, 
  Edit, 
  Trash2, 
  Plus,
  UserCheck,
  Badge,
  Megaphone,
  Search
} from 'lucide-react';
import { 
  getAllUsers, 
  banUser, 
  unbanUser, 
  getAllBadges, 
  createBadge, 
  assignBadgeToUser, 
  removeBadgeFromUser, 
  createSystemAnnouncement, 
  getActiveAnnouncements,
  initializeDefaultBadges,
  deleteBadge,
  updateBadge,
  deleteAnnouncement,
  updateUserData
} from '@/lib/admin';
import { UserManagementModal } from '@/components/ui/admin/UserManagementModal';
import { AdminUserData, UserBadge, SystemAnnouncement, CreateBadgeData } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserBadge as UserBadgeComponent } from '@/components/ui/UserBadge';

export default function AdminPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  
  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  
  // Admin permission check
  const hasAdminAccess = user && (user.role === 'admin' || user.role === 'moderator');

  const initializeAdminData = useCallback(async () => {
    try {
      setLoading(true);
      await initializeDefaultBadges();
      await Promise.all([
        loadUsers(),
        loadBadges(),
        loadAnnouncements()
      ]);
    } catch (error) {
      console.error('Error initializing admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (hasAdminAccess) {
      initializeAdminData();
    }
  }, [hasAdminAccess, initializeAdminData]);

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadBadges = async () => {
    try {
      const badgesData = await getAllBadges();
      setBadges(badgesData);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const announcementsData = await getActiveAnnouncements();
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const stats = {
    totalUsers: users.length,
    bannedUsers: users.filter(u => u.isBlocked).length,
    totalBadges: badges.length,
    activeAnnouncements: announcements.length
  };

  // Handle user actions
  const handleBanUser = async (userId: string, reason: string) => {
    try {
      await banUser(userId, { reason }, user!.uid);
      await loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId, user!.uid);
      await loadUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleAssignBadge = async (userId: string, badgeId: string) => {
    try {
      await assignBadgeToUser(userId, badgeId, user!.uid);
      await loadUsers();
    } catch (error) {
      console.error('Error assigning badge:', error);
    }
  };

  const handleRemoveBadge = async (userId: string) => {
    try {
      await removeBadgeFromUser(userId, user!.uid);
      await loadUsers();
    } catch (error) {
      console.error('Error removing badge:', error);
    }
  };

  // Handle badge actions
  const handleCreateBadge = async (badgeData: CreateBadgeData) => {
    try {
      await createBadge(badgeData);
      await loadBadges();
      setIsBadgeModalOpen(false);
    } catch (error) {
      console.error('Error creating badge:', error);
    }
  };

  const handleUpdateBadge = async (badgeId: string, badgeData: Partial<CreateBadgeData>) => {
    try {
      await updateBadge(badgeId, badgeData);
      await loadBadges();
      setIsBadgeModalOpen(false);
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      await deleteBadge(badgeId);
      await loadBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  // Handle announcements
  const handleCreateAnnouncement = async (announcementData: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    expiresAt?: Date;
  }) => {
    try {
      await createSystemAnnouncement({
        title: announcementData.title,
        content: announcementData.message, // Map message to content
        type: announcementData.type,
        expiresAt: announcementData.expiresAt,
        createdBy: user!.uid,
        isActive: true
      });
      await loadAnnouncements();
      setIsAnnouncementModalOpen(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await deleteAnnouncement(announcementId);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleSendMessage = async (userId: string, title: string, message: string, type: 'info' | 'warning' | 'success' | 'error') => {
    try {
      const { createNotification } = await import('@/lib/notifications');
      const { NotificationType } = await import('@/types/notification');
      await createNotification({
        recipientId: userId,
        type: NotificationType.SYSTEM,
        title,
        message,
        metadata: { type, isPersonal: true }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold">
              {t('admin.accessDenied')}
            </CardTitle>
            <CardDescription>
              {t('admin.accessDeniedDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="space-y-8">
        {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('admin.title')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('admin.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button 
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Megaphone className="h-4 w-4" />
                {t('admin.createAnnouncement')}
            </Button>
            </div>
          </div>

        {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.totalUsers')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.bannedUsers')}
                </CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.totalBadges')}
                </CardTitle>
                <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalBadges}</div>
            </CardContent>
          </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.activeAnnouncements')}
                </CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAnnouncements}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
              <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
              <TabsTrigger value="badges">{t('admin.badges')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t('admin.recentUsers')}
              </CardTitle>
            </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.uid} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.displayName?.[0] || user.email[0]}
                    </span>
                  </div>
                            <div>
                              <p className="text-sm font-medium">{user.displayName || user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                    </div>
                          {user.badge && (
                            <UserBadgeComponent badge={user.badge} size="sm" />
                  )}
                </div>
              ))}
                    </div>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5" />
                      {t('admin.recentAnnouncements')}
                </CardTitle>
              </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {announcements.slice(0, 5).map((announcement) => (
                        <div key={announcement.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{announcement.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {announcement.content}
                              </p>
                      </div>
                            <div className="flex items-center gap-2">
                              <BadgeComponent variant={announcement.type === 'error' ? 'destructive' : 'default'}>
                                {announcement.type}
                              </BadgeComponent>
                    <Button 
                                variant="ghost"
                      size="sm" 
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                                <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                            </div>
                          </div>
                  </div>
                ))}
                    </div>
              </CardContent>
            </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.searchUsers')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

          <Card>
            <CardHeader>
                  <CardTitle>{t('admin.users')}</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} {t('admin.usersFound')}
                  </CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.user')}</TableHead>
                          <TableHead>{t('admin.role')}</TableHead>
                          <TableHead>{t('admin.badge')}</TableHead>
                          <TableHead>{t('admin.status')}</TableHead>
                          <TableHead>{t('admin.joinDate')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((userData) => (
                          <TableRow key={userData.uid}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {userData.displayName?.[0] || userData.email[0]}
                                  </span>
                  </div>
                                <div>
                                  <p className="font-medium">{userData.displayName || userData.email}</p>
                                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <BadgeComponent variant={userData.role === 'admin' ? 'destructive' : 'default'}>
                                {userData.role}
                              </BadgeComponent>
                            </TableCell>
                            <TableCell>
                              {userData.badge ? (
                                <UserBadgeComponent badge={userData.badge} size="sm" />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <BadgeComponent variant={userData.isBlocked ? 'destructive' : 'default'}>
                                {userData.isBlocked ? t('admin.banned') : t('admin.active')}
                              </BadgeComponent>
                            </TableCell>
                            <TableCell>
                              {userData.createdAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setIsUserModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {userData.isBlocked ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnbanUser(userData.uid)}
                                  >
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBanUser(userData.uid, 'Kullanıcı kuralları ihlali')}
                                  >
                                    <Ban className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{t('admin.badgeManagement')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('admin.badgeManagementDesc')}
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedBadge(null);
                    setIsBadgeModalOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('admin.createBadge')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Card key={badge.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <UserBadgeComponent badge={badge} size="lg" />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBadge(badge);
                            setIsBadgeModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBadge(badge.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <UserManagementModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={async (userData) => {
          if (selectedUser) {
            await updateUserData(selectedUser.uid, userData, user!.uid);
            await loadUsers();
          }
        }}
        onBan={handleBanUser}
        onUnban={handleUnbanUser}
        badges={badges}
        onAssignBadge={handleAssignBadge}
        onRemoveBadge={handleRemoveBadge}
        onSendMessage={handleSendMessage}
        isLoading={loading}
      />

      <BadgeManagementModal
        badge={selectedBadge}
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        onSave={(badgeId, badgeData) => {
          if (badgeId && badgeData) {
            handleUpdateBadge(badgeId, badgeData);
          } else if (badgeData) {
            handleCreateBadge(badgeData as CreateBadgeData);
          }
        }}
      />

      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSave={handleCreateAnnouncement}
      />
    </div>
  );
}



// Badge Management Modal Component
function BadgeManagementModal({
  badge,
  isOpen,
  onClose,
  onSave
}: {
  badge: UserBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (badgeId?: string, badgeData?: Partial<CreateBadgeData>) => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'Badge',
    priority: 1,
    isDefault: false
  });

  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name || '',
        displayName: badge.displayName || '',
        description: badge.description || '',
        color: badge.color || 'text-gray-600',
        bgColor: badge.bgColor || 'bg-gray-100',
        icon: badge.icon || 'Badge',
        priority: badge.priority || 1,
        isDefault: badge.isDefault || false
      });
    } else {
      setFormData({
        name: '',
        displayName: '',
        description: '',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: 'Badge',
        priority: 1,
        isDefault: false
      });
    }
  }, [badge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (badge) {
      onSave(badge.id, formData);
    } else {
      onSave(undefined, formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {badge ? t('admin.editBadge') : t('admin.createBadge')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('admin.badgeName')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="displayName">{t('admin.displayName')}</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t('admin.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">{t('admin.textColor')}</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-gray-600">Gray</SelectItem>
                  <SelectItem value="text-red-600">Red</SelectItem>
                  <SelectItem value="text-blue-600">Blue</SelectItem>
                  <SelectItem value="text-green-600">Green</SelectItem>
                  <SelectItem value="text-yellow-600">Yellow</SelectItem>
                  <SelectItem value="text-purple-600">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bgColor">{t('admin.backgroundColor')}</Label>
              <Select value={formData.bgColor} onValueChange={(value) => setFormData({ ...formData, bgColor: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-gray-100">Gray</SelectItem>
                  <SelectItem value="bg-red-100">Red</SelectItem>
                  <SelectItem value="bg-blue-100">Blue</SelectItem>
                  <SelectItem value="bg-green-100">Green</SelectItem>
                  <SelectItem value="bg-yellow-100">Yellow</SelectItem>
                  <SelectItem value="bg-purple-100">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">{t('admin.icon')}</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Badge">Badge</SelectItem>
                  <SelectItem value="Shield">Shield</SelectItem>
                  <SelectItem value="Crown">Crown</SelectItem>
                  <SelectItem value="Star">Star</SelectItem>
                  <SelectItem value="Zap">Zap</SelectItem>
                  <SelectItem value="Building">Building</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">{t('admin.priority')}</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            />
            <Label htmlFor="isDefault">{t('admin.isDefault')}</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit">
              {badge ? t('admin.update') : t('admin.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Announcement Modal Component
function AnnouncementModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    expiresAt?: Date;
  }) => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    expiresAt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    setFormData({ title: '', message: '', type: 'info', expiresAt: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('admin.createAnnouncement')}</DialogTitle>
          <DialogDescription>
            Tüm kullanıcılara gönderilecek sistem duyurusu oluşturun.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">{t('admin.title')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">{t('admin.message')}</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">{t('admin.type')}</Label>
            <Select value={formData.type} onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiresAt">{t('admin.expiresAt')}</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit">
              {t('admin.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 