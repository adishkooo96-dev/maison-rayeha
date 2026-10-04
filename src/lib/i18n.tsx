import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import faTranslations from '../locales/fa.json';
import enTranslations from '../locales/en.json';
import { Language, Direction } from '../types';
import {
  formatPrice as formatPriceLib,
  formatNumber as formatNumberLib,
  formatPercent as formatPercentLib,
  getLocalized as getLocalizedLib,
  FormatNumberOptions,
} from './formatters';

export type { FormatNumberOptions };

const STORAGE_KEY = 'maison_rayeha_lang';
const DEFAULT_LANG: Language = 'fa';

const translations: Record<Language, Record<string, any>> = {
  fa: faTranslations,
  en: enTranslations,
};

export interface I18nContextType {
  lang: Language;
  dir: Direction;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number> | string) => string;
  changeLanguage: (newLang: Language) => void;
  formatPrice: (price: { fa: number; en: number } | number) => string;
  formatNumber: (value: number, options?: FormatNumberOptions | boolean) => string;
  formatPercent: (value: number) => string;
  getLocalized: <T>(field: { fa: T; en: T } | T | undefined | null, customLang?: Language) => T;
}

const I18nContext = createContext<I18nContextType | null>(null);

function resolveTranslation(obj: any, path: string): string {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // URL :lang prefix is the single source of truth
  const segments = location.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const lang: Language = firstSegment === 'en' ? 'en' : 'fa';

  const dir: Direction = lang === 'fa' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  const changeLanguage = useCallback(
    (newLang: Language) => {
      // Save preference
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // ignore
      }

      // Replace language prefix in URL, keeping current subpath and query params/hash
      const currentSegments = location.pathname.split('/').filter(Boolean);
      if (currentSegments[0] === 'fa' || currentSegments[0] === 'en') {
        currentSegments[0] = newLang;
      } else {
        currentSegments.unshift(newLang);
      }
      const newPath = '/' + currentSegments.join('/') + location.search + location.hash;
      navigate(newPath);
    },
    [location.pathname, location.search, location.hash, navigate]
  );

  const t = useCallback((key: string, params?: Record<string, string | number> | string): string => {
    const langDict = translations[lang] || translations[DEFAULT_LANG];
    let val = resolveTranslation(langDict, key);
    if (val === key) {
      // Try English as fallback
      const enVal = resolveTranslation(translations.en, key);
      val = enVal !== key ? enVal : (typeof params === 'string' ? params : key);
    }

    if (params && typeof params === 'object') {
      let interpolated = val;
      for (const [k, v] of Object.entries(params)) {
        interpolated = interpolated.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
      return interpolated;
    }

    return val;
  }, [lang]);

  const formatPrice = useCallback((price: { fa: number; en: number } | number) => {
    return formatPriceLib(price, lang);
  }, [lang]);

  const formatNumber = useCallback((val: number, options?: FormatNumberOptions | boolean) => {
    return formatNumberLib(val, lang, options);
  }, [lang]);

  const formatPercent = useCallback((val: number) => {
    return formatPercentLib(val, lang);
  }, [lang]);

  const getLocalized = useCallback(<T,>(field: { fa: T; en: T } | T | undefined | null, customLang?: Language): T => {
    return getLocalizedLib(field, customLang || lang);
  }, [lang]);

  const value = useMemo<I18nContextType>(() => ({
    lang,
    dir,
    isRTL,
    t,
    changeLanguage,
    formatPrice,
    formatNumber,
    formatPercent,
    getLocalized,
  }), [lang, dir, isRTL, t, changeLanguage, formatPrice, formatNumber, formatPercent, getLocalized]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
