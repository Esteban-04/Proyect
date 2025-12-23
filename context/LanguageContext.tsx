
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Language } from '../lib/i18n';

type Translations = typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations, ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: keyof Translations, ...args: any[]): string => {
    const stringOrFn = translations[language][key] || translations['es'][key];
    
    if (!stringOrFn) {
        console.warn(`Translation key not found: ${String(key)}`);
        return String(key);
    }

    if (typeof stringOrFn === 'function') {
        // CORRECCIÓN: Se cambió el uso de .apply para evitar errores de tipado de argumentos
        return (stringOrFn as (...args: any[]) => string)(...args);
    }
    return stringOrFn as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
