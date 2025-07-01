"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, AlertTriangle } from "lucide-react";
import { createReport } from "@/lib/moderation";
import { ReportReason } from "@/types/moderation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportModalProps {
  targetType: 'website' | 'user' | 'comment';
  targetId: string;
  targetTitle?: string;
  children?: React.ReactNode;
}

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Uygunsuz İçerik' },
  { value: 'copyright_violation', label: 'Telif Hakkı İhlali' },
  { value: 'false_information', label: 'Yanlış Bilgi' },
  { value: 'harassment', label: 'Taciz' },
  { value: 'offensive_language', label: 'Saldırgan Dil' },
  { value: 'malicious_website', label: 'Zararlı Website' },
  { value: 'duplicate_content', label: 'Tekrarlanan İçerik' },
  { value: 'other', label: 'Diğer' },
];

export function ReportModal({ targetType, targetId, targetTitle, children }: ReportModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Rapor göndermek için giriş yapmalısınız');
      return;
    }

    if (!reason) {
      toast.error('Lütfen bir sebep seçin');
      return;
    }

    setLoading(true);
    try {
      await createReport(
        user.uid,
        user.displayName || 'Anonim Kullanıcı',
        user.email,
        targetType,
        targetId,
        targetTitle,
        reason,
        description || undefined
      );

      toast.success('Rapor başarıyla gönderildi');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Rapor gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (targetType) {
      case 'website':
        return 'website';
      case 'user':
        return 'kullanıcı';
      case 'comment':
        return 'yorum';
      default:
        return 'içerik';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-2" />
            Bildir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {getTypeLabel().charAt(0).toUpperCase() + getTypeLabel().slice(1)} Bildir
          </DialogTitle>
          <DialogDescription>
            Bu {getTypeLabel()}i moderatörlere bildirin. Raporunuz incelenecek ve gerekli aksiyonlar alınacaktır.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Bildirim Sebebi *</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Sebep seçin..." />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rapor hakkında ek detaylar..."
              rows={3}
            />
          </div>

          {targetTitle && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Bildirilen içerik:</p>
              <p className="text-sm font-medium">{targetTitle}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Gönderiliyor...' : 'Rapor Gönder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 