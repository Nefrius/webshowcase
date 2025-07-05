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
import { UserBadge, CreateBadgeData } from '@/types/user';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Edit, Save } from 'lucide-react';

interface BadgeManagementModalProps {
  badge: UserBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (badgeData: CreateBadgeData) => Promise<void>;
  onUpdate: (badgeId: string, badgeData: Partial<UserBadge>) => Promise<void>;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const colorOptions = [
  { value: 'text-gray-600', label: 'Gray', bg: 'bg-gray-100' },
  { value: 'text-blue-600', label: 'Blue', bg: 'bg-blue-100' },
  { value: 'text-green-600', label: 'Green', bg: 'bg-green-100' },
  { value: 'text-yellow-600', label: 'Yellow', bg: 'bg-yellow-100' },
  { value: 'text-red-600', label: 'Red', bg: 'bg-red-100' },
  { value: 'text-purple-600', label: 'Purple', bg: 'bg-purple-100' },
  { value: 'text-pink-600', label: 'Pink', bg: 'bg-pink-100' },
  { value: 'text-orange-600', label: 'Orange', bg: 'bg-orange-100' },
];

const iconOptions = [
  { value: 'User', label: 'User' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Crown', label: 'Crown' },
  { value: 'Building', label: 'Building' },
  { value: 'Star', label: 'Star' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Badge', label: 'Badge' },
];

export const BadgeManagementModal: React.FC<BadgeManagementModalProps> = ({
  badge,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  isLoading,
  mode
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateBadgeData>({
    name: badge?.name || '',
    displayName: badge?.displayName || '',
    color: badge?.color || 'text-gray-600',
    bgColor: badge?.bgColor || 'bg-gray-100',
    icon: badge?.icon || 'Badge',
    description: badge?.description || '',
    isDefault: badge?.isDefault || false,
    priority: badge?.priority || 1
  });

  const handleSave = async () => {
    if (mode === 'create') {
      await onSave(formData);
    } else if (badge) {
      await onUpdate(badge.id, formData);
    }
    onClose();
  };

  const handleColorChange = (color: string) => {
    const selectedColor = colorOptions.find(option => option.value === color);
    if (selectedColor) {
      setFormData({
        ...formData,
        color: selectedColor.value,
        bgColor: selectedColor.bg
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Plus className="h-5 w-5" />
                {t('admin.createBadge')}
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                {t('admin.editBadge')}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 
              'Yeni rozet oluşturun ve özelliklerini belirleyin.' : 
              'Mevcut rozet özelliklerini düzenleyin.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('admin.badgeName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="member, admin, premium"
              />
            </div>
            <div>
              <Label htmlFor="displayName">{t('admin.displayName')}</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Üye, Admin, Premium"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t('admin.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.badgeDescriptionPlaceholder')}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">{t('admin.color')}</Label>
              <Select
                value={formData.color}
                onValueChange={handleColorChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${option.bg}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="icon">{t('admin.icon')}</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">{t('admin.priority')}</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isDefault">{t('admin.isDefault')}</Label>
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4">
            <Label>{t('admin.preview')}</Label>
            <div className="mt-2">
              <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium ${formData.color} ${formData.bgColor}`}>
                {formData.displayName || t('admin.badgePreview')}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !formData.name.trim() || !formData.displayName.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {mode === 'create' ? t('admin.createBadge') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 