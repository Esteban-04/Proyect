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
    if (typeof stringOrFn === 'function') {
        // Fix for: A spread argument must either have a tuple type or be passed to a rest parameter.
        // Using .apply() to call the function with an array of arguments resolves this.
        return stringOrFn.apply(null, args);
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
