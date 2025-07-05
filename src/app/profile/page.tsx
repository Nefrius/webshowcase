"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { User, Mail, Calendar, Settings, Save, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserBadge } from "@/components/ui/UserBadge";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    photoURL: null as string | null,
    website: "",
    location: "",
    twitter: "",
    github: "",
    linkedin: ""
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        photoURL: user.photoURL || null,
        website: user.website || "",
        location: user.location || "",
        twitter: user.social?.twitter || "",
        github: user.social?.github || "",
        linkedin: user.social?.linkedin || ""
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      photoURL: imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Check if Firebase is available
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }
      
      // Update Firebase Auth profile using current auth user
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
          photoURL: formData.photoURL || undefined
        });
      }

      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL || null,
        bio: formData.bio,
        website: formData.website,
        location: formData.location,
        social: {
          twitter: formData.twitter,
          github: formData.github,
          linkedin: formData.linkedin
        },
        updatedAt: new Date()
      });

      setSuccess("Profil başarıyla güncellendi!");
      
      // Clear success message after 3 seconds and reload to update context
      setTimeout(() => {
        setSuccess("");
        window.location.reload();
      }, 2000);
      
    } catch (updateError) {
      console.error("Profile update error:", updateError);
      setError("Profil güncellenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Profil Ayarları</h1>
            <p className="text-muted-foreground">
              Profil bilgilerinizi güncelleyin ve kişiselleştirin
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md"
            >
              <Settings className="h-4 w-4" />
              {success}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil Bilgileri
                </CardTitle>
                <CardDescription>
                  Temel hesap bilgileriniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <ImageUpload
                    websiteId={`user_${user.uid}`}
                    currentImageUrl={formData.photoURL || undefined}
                    onImageChange={handleImageChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Hesap:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Gizli (Güvenlik)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Katılma Tarihi:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user.createdAt.toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* User Badge */}
                {user.badge && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Rozet:</span>
                    </div>
                    <div className="pl-6">
                      <UserBadge badge={user.badge} size="sm" />
                    </div>
                  </div>
                )}

                {/* User Role */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Rol:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {user.role === 'admin' ? 'Yönetici' : 
                     user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profil Düzenle</CardTitle>
                <CardDescription>
                  Profil bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Görünen Ad *</Label>
                      <Input
                        id="displayName"
                        placeholder="John Doe"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange("displayName", e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Konum</Label>
                      <Input
                        id="location"
                        placeholder="İstanbul, Türkiye"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Hakkında</Label>
                    <Textarea
                      id="bio"
                      placeholder="Kendinizi tanıtın..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Social Media */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Sosyal Medya</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          placeholder="@username"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange("twitter", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          placeholder="username"
                          value={formData.github}
                          onChange={(e) => handleInputChange("github", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          placeholder="username"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange("linkedin", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? "Kaydediliyor..." : "Profili Kaydet"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 