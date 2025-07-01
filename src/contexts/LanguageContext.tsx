"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Supported languages
type Language = "en" | "tr";

// Language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  loading: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation type
interface Translations {
  [key: string]: any;
}

// Helper function to get nested values from object
const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr"); // Default to Turkish
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    let value = getNestedValue(translations, key);
    
    if (!value) {
      return key; // Return key if translation not found
    }

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        value = value?.replace(`{{${param}}}`, val) || value;
      });
    }

    return value || key;
  };

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error(`Error loading translations for ${language}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language preference when it changes
  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
    }
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: updateLanguage, 
        t, 
        loading 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
} 