import { useLocation, useParams } from 'react-router-dom';
import { Language } from '../types';

/**
 * Derives the active language from the URL :lang param (single source of truth).
 */
export function useLang(): Language {
  const { lang } = useParams<{ lang?: string }>();
  if (lang === 'en' || lang === 'fa') {
    return lang;
  }
  const location = useLocation();
  const firstSegment = location.pathname.split('/').filter(Boolean)[0];
  if (firstSegment === 'en') return 'en';
  return 'fa';
}

export { getLocalized, formatNumber, formatPercent, formatPrice } from '../lib/formatters';
export type { FormatNumberOptions } from '../lib/formatters';
