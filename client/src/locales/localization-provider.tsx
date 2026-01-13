import { useMemo, useState, useContext, useCallback, createContext } from 'react';

import { translations, DEFAULT_LOCALE } from './index';

import type { TranslationKeys, SupportedLocale } from './index';

// ----------------------------------------------------------------------

type LocalizationContextValue = {
  locale: SupportedLocale;
  translations: TranslationKeys;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

type LocalizationProviderProps = {
  children: React.ReactNode;
};

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const savedLocale = localStorage.getItem('locale') as SupportedLocale;
    return savedLocale && translations[savedLocale] ? savedLocale : DEFAULT_LOCALE;
  });

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  const currentTranslations = useMemo(() => translations[locale], [locale]);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      const value = keys.reduce<any>(
        (acc, k) => (acc && typeof acc === 'object' && k in acc ? acc[k] : undefined),
        currentTranslations
      );

      return typeof value === 'string' ? value : key;
    },
    [currentTranslations]
  );

  const memoizedValue = useMemo(
    () => ({
      locale,
      translations: currentTranslations,
      setLocale,
      t,
    }),
    [locale, currentTranslations, setLocale, t]
  );

  return (
    <LocalizationContext.Provider value={memoizedValue}>{children}</LocalizationContext.Provider>
  );
}

// ----------------------------------------------------------------------

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }

  return context;
}
