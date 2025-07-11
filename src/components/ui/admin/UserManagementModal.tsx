import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUserData, UserBadge, UpdateUserData } from '@/types/user';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Save, AlertCircle } from 'lucide-react';

interface UserManagementModalProps {
  user: AdminUserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UpdateUserData) => Promise<void>;
  onBan: (userId: string, reason: string, duration?: number) => Promise<void>;
  onUnban: (userId: string) => Promise<void>;
  badges: UserBadge[];
  onAssignBadge: (userId: string, badgeId: string) => Promise<void>;
  onRemoveBadge: (userId: string) => Promise<void>;
  onSendMessage: (userId: string, title: string, message: string, type: 'info' | 'warning' | 'success' | 'error') => Promise<void>;
  isLoading: boolean;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onBan,
  onUnban,
  badges,
  onAssignBadge,
  onRemoveBadge,
  onSendMessage,
  isLoading
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<UpdateUserData>({
    displayName: user?.displayName || '',
    role: user?.role || 'user',
    isPremium: user?.isPremium || false
  });
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<number | undefined>();
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'edit' | 'ban' | 'badge' | 'message'>('edit');
  const [messageData, setMessageData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error'
  });

  const handleSave = async () => {
    if (!user) return;
    await onSave(formData);
    onClose();
  };

  const handleBan = async () => {
    if (!user || !banReason.trim()) return;
    await onBan(user.uid, banReason, banDuration);
    onClose();
  };

  const handleUnban = async () => {
    if (!user) return;
    await onUnban(user.uid);
    onClose();
  };

  const handleAssignBadge = async () => {
    if (!user || !selectedBadge) return;
    await onAssignBadge(user.uid, selectedBadge);
    setSelectedBadge('');
  };

  const handleRemoveBadge = async () => {
    if (!user) return;
    await onRemoveBadge(user.uid);
  };

  const handleSendMessage = async () => {
    if (!user || !messageData.title.trim() || !messageData.message.trim()) return;
    await onSendMessage(user.uid, messageData.title, messageData.message, messageData.type);
    setMessageData({ title: '', message: '', type: 'info' });
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('admin.userManagement')}
            <span className="text-sm font-normal text-muted-foreground">
              {user.displayName || user.email}
            </span>
          </DialogTitle>
          <DialogDescription>
            {t('admin.userManagementDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('admin.editUser')}
            </button>
            <button
              onClick={() => setActiveTab('ban')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ban'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('admin.banManagement')}
            </button>
            <button
              onClick={() => setActiveTab('badge')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'badge'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('admin.badgeManagement')}
            </button>
            <button
              onClick={() => setActiveTab('message')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'message'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('admin.privateMessage')}
            </button>
          </div>

          {/* Edit User Tab */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">{t('admin.displayName')}</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">{t('admin.role')}</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as 'user' | 'moderator' | 'admin' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isPremium">{t('admin.isPremium')}</Label>
              </div>
            </div>
          )}

          {/* Ban Management Tab */}
          {activeTab === 'ban' && (
            <div className="space-y-4">
              {user.isBlocked ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">{t('admin.userBanned')}</span>
                  </div>
                  <p className="text-sm text-red-600 mb-4">
                    {t('admin.banReason')}: {user.blockReason}
                  </p>
                  <Button
                    onClick={handleUnban}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t('admin.unban')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="banReason">{t('admin.banReason')}</Label>
                    <Textarea
                      id="banReason"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder={t('admin.banReasonPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="banDuration">{t('admin.banDuration')}</Label>
                    <Select
                      value={banDuration?.toString() || ''}
                      onValueChange={(value) => setBanDuration(value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.selectDuration')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t('admin.day')}</SelectItem>
                        <SelectItem value="3">{t('admin.days')}</SelectItem>
                        <SelectItem value="7">{t('admin.days')}</SelectItem>
                        <SelectItem value="14">{t('admin.days')}</SelectItem>
                        <SelectItem value="30">{t('admin.days')}</SelectItem>
                        <SelectItem value="0">{t('admin.permanent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleBan}
                    disabled={isLoading || !banReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('admin.ban')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Badge Management Tab */}
          {activeTab === 'badge' && (
            <div className="space-y-4">
              {user.badge ? (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-700">{t('admin.currentBadge')}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveBadge}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium ${user.badge.color} ${user.badge.bgColor}`}>
                    {user.badge.displayName}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('admin.noBadge')}</p>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="badgeSelect">{t('admin.assignBadge')}</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedBadge}
                    onValueChange={setSelectedBadge}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t('admin.selectBadge')} />
                    </SelectTrigger>
                    <SelectContent>
                      {badges.map((badge) => (
                        <SelectItem key={badge.id} value={badge.id}>
                          {badge.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignBadge}
                    disabled={isLoading || !selectedBadge}
                    size="sm"
                  >
                    {t('admin.assign')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Message Tab */}
          {activeTab === 'message' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="messageTitle">Mesaj Başlığı</Label>
                <Input
                  id="messageTitle"
                  value={messageData.title}
                  onChange={(e) => setMessageData({ ...messageData, title: e.target.value })}
                  placeholder="Mesaj başlığını girin"
                />
              </div>
              <div>
                <Label htmlFor="messageContent">Mesaj İçeriği</Label>
                <Textarea
                  id="messageContent"
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Mesaj içeriğini girin"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="messageType">Mesaj Türü</Label>
                <Select
                  value={messageData.type}
                  onValueChange={(value) => setMessageData({ ...messageData, type: value as 'info' | 'warning' | 'success' | 'error' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Bilgi</SelectItem>
                    <SelectItem value="success">Başarı</SelectItem>
                    <SelectItem value="warning">Uyarı</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !messageData.title.trim() || !messageData.message.trim()}
                className="w-full"
              >
                Mesaj Gönder
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          {activeTab === 'edit' && (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 