"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Chrome, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const { user, register, loginWithGoogle, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Giriş yapmış kullanıcıları ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.errors.passwordMismatch'));
        return;
      }

      if (formData.password.length < 6) {
        setError(t('auth.errors.passwordTooShort'));
        return;
      }

      await register(formData.email, formData.password, formData.displayName);
      router.push("/"); // Başarılı kayıt sonrası ana sayfaya yönlendir
    } catch (error) {
      const errorCode = (error as { code?: string })?.code;
      if (errorCode === 'auth/email-already-in-use') {
        setError(t('auth.errors.emailInUse'));
      } else if (errorCode === 'auth/weak-password') {
        setError(t('auth.errors.weakPassword'));
      } else if (errorCode === 'auth/invalid-email') {
        setError(t('auth.errors.invalidEmail'));
      } else {
        setError(t('auth.errors.registerFailed'));
      }
      console.error("Register error:", error);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    
    try {
      await loginWithGoogle();
      router.push("/"); // Başarılı kayıt sonrası ana sayfaya yönlendir
    } catch (error) {
      setError(t('auth.errors.googleLoginFailed'));
      console.error("Google register error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 bg-gradient-to-br from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{t('auth.signUp')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.registerDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Google Register */}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleRegister}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {t('auth.signUpWithGoogle')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('auth.or')}
                </span>
              </div>
            </div>

            {/* Email Register Form */}
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    placeholder="Your Full Name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{" "}
              <Link 
                href="/login" 
                className="text-primary hover:underline font-medium"
              >
                {t('auth.signIn')}
              </Link>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {t('auth.termsAndPrivacy')}{" "}
              <Link href="/terms" className="text-primary hover:underline">
                {t('auth.terms')}
              </Link>
              {" "}{t('auth.and')}{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                {t('auth.privacy')}
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 