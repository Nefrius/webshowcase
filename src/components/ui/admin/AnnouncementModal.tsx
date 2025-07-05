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
import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone, Save, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcementData: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    expiresAt?: Date;
  }) => Promise<void>;
  isLoading: boolean;
}

const typeOptions = [
  { value: 'info', label: 'Info', icon: Info, color: 'text-blue-600' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-600' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-600' },
  { value: 'error', label: 'Error', icon: AlertTriangle, color: 'text-red-600' },
];

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    expiresAt: ''
  });

  const handleSave = async () => {
    const announcementData = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
    };
    
    await onSave(announcementData);
    setFormData({ title: '', message: '', type: 'info', expiresAt: '' });
    onClose();
  };

  const selectedType = typeOptions.find(option => option.value === formData.type);
  const IconComponent = selectedType?.icon || Info;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {t('admin.createAnnouncement')}
          </DialogTitle>
          <DialogDescription>
            Tüm kullanıcılara gönderilecek sistem duyurusu oluşturun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">{t('admin.announcementTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('admin.announcementTitlePlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="message">{t('admin.announcementMessage')}</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t('admin.announcementMessagePlaceholder')}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">{t('admin.announcementType')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => {
                    const IconComp = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComp className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
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
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4">
            <Label>{t('admin.preview')}</Label>
            <div className="mt-2 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className={`h-5 w-5 ${selectedType?.color}`} />
                <h4 className="font-semibold">
                  {formData.title || t('admin.announcementTitle')}
                </h4>
              </div>
              <p className="text-sm text-gray-600">
                {formData.message || t('admin.announcementMessage')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !formData.title.trim() || !formData.message.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {t('admin.createAnnouncement')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 