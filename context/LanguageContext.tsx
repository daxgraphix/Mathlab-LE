import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import i18n from 'i18next';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fallback translations when context is not available
const fallbackTranslations: Record<string, string> = {
  appName: 'GAAS',
  level: 'LEVEL',
  mathLabOperative: 'GAAS OPERATIVE',
  back: 'Back',
  settings: 'Settings',
  achievements: 'Achievements',
  calculator: 'Calculator',
  exit: 'Exit',
  campaign: 'Campaign',
  arcade: 'Arcade',
  practice: 'Practice',
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  initialLanguage = Language.ENGLISH 
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage
    const saved = localStorage.getItem('math_language');
    if (saved && (saved === Language.ENGLISH || saved === Language.SWAHILI)) {
      return saved as Language;
    }
    return initialLanguage;
  });

  useEffect(() => {
    localStorage.setItem('math_language', language);
    // Sync with i18next
    i18n.changeLanguage(language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  }, []);

  const t = useCallback((key: string): string => {
    return i18n.t(key);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Return default values with fallback translations
    return {
      language: Language.ENGLISH,
      setLanguage: () => {},
      t: (key: string) => fallbackTranslations[key] || key,
    };
  }
  
  return context;
};
