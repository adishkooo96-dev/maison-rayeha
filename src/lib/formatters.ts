import { Language } from '../types';

export interface FormatNumberOptions {
  useGrouping?: boolean;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formats a generic count or number with localized digits:
 * - 'fa': uses Persian digits (۰-۹)
 * - 'en': uses Latin digits (0-9)
 * Supports disabling grouping via { useGrouping: false } or boolean `false` (for years, badge numbers, ratings).
 */
export function formatNumber(
  value: number,
  lang: Language,
  options?: FormatNumberOptions | boolean
): string {
  const opts: Intl.NumberFormatOptions = {};
  if (typeof options === 'boolean') {
    opts.useGrouping = options;
  } else if (options && typeof options === 'object') {
    if (options.useGrouping !== undefined) {
      opts.useGrouping = options.useGrouping;
    }
    if (options.minimumIntegerDigits !== undefined) {
      opts.minimumIntegerDigits = options.minimumIntegerDigits;
    }
    if (options.minimumFractionDigits !== undefined) {
      opts.minimumFractionDigits = options.minimumFractionDigits;
    }
    if (options.maximumFractionDigits !== undefined) {
      opts.maximumFractionDigits = options.maximumFractionDigits;
    }
  }

  // Default useGrouping to true if not specified
  if (opts.useGrouping === undefined) {
    opts.useGrouping = true;
  }

  if (lang === 'fa') {
    try {
      return new Intl.NumberFormat('fa-IR', opts).format(value);
    } catch {
      return value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
    }
  }
  return new Intl.NumberFormat('en-US', opts).format(value);
}

/**
 * Formats a percentage with localized digits and symbols:
 * - 'fa': Persian digits + Persian percent sign (e.g. ۳۰٪)
 * - 'en': Latin digits + English percent sign (e.g. 30%)
 */
export function formatPercent(value: number, lang: Language): string {
  if (lang === 'fa') {
    return `${formatNumber(value, 'fa', { useGrouping: false })}٪`;
  }
  return `${formatNumber(value, 'en', { useGrouping: false })}%`;
}

/**
 * Formats a price according to current active language:
 * - 'fa': uses Persian digits with thousand separators + "تومان"
 * - 'en': uses USD format ($XXX)
 */
export function formatPrice(price: { fa: number; en: number } | number, lang: Language): string {
  if (lang === 'fa') {
    const amount = typeof price === 'number' ? price : price.fa;
    try {
      const formatted = new Intl.NumberFormat('fa-IR', {
        useGrouping: true,
      }).format(amount);
      return `${formatted} تومان`;
    } catch {
      return `${amount.toLocaleString('fa-IR')} تومان`;
    }
  } else {
    const amount = typeof price === 'number' ? price : price.en;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${amount.toLocaleString('en-US')}`;
    }
  }
}

/**
 * Converts Persian (۰-۹) and Arabic (٠-٩) digits to standard ASCII English digits (0-9)
 */
export function normalizeDigits(input: string): string {
  if (!input) return '';
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * Normalizes input DOM element live during typing or pasting,
 * immediately converting Persian/Arabic digits to English digits
 * while preserving caret/selection position.
 */
export function handleLiveDigitInput(
  e: React.FormEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>
): string {
  const target = (e.currentTarget || e.target) as HTMLInputElement;
  if (!target) return '';
  const raw = target.value;
  const normalized = normalizeDigits(raw);
  if (raw !== normalized) {
    const start = target.selectionStart;
    const end = target.selectionEnd;
    target.value = normalized;
    if (start !== null && end !== null) {
      target.setSelectionRange(start, end);
    }
  }
  return normalized;
}

/**
 * Standard bilingual data reader.
 * Any mock data or domain object with { fa, en } fields MUST be read through this helper.
 */
export function getLocalized<T>(
  field: { fa: T; en: T } | T | undefined | null,
  lang: Language
): T {
  if (field === undefined || field === null) {
    return '' as unknown as T;
  }
  if (typeof field === 'object' && field !== null && ('fa' in field || 'en' in field)) {
    const record = field as { fa: T; en: T };
    if (record[lang] !== undefined) {
      return record[lang];
    }
    return (record.fa ?? record.en) as T;
  }
  return field as T;
}
