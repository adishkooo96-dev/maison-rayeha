import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { BRAND_STORY_IMAGES } from '../../data/images';

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  canonicalPath?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

// Fallback site URL for canonical and hreflang tag generation
// TODO: Replace with production custom domain once configured (e.g., https://maisonrayeha.com)
export const DEFAULT_SITE_URL = 'https://maisonrayeha.com';

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  image,
  ogType = 'website',
  noindex = false,
  canonicalPath,
  jsonLd,
}) => {
  const { lang, t } = useI18n();
  const location = useLocation();

  // Resolve base origin safely
  const origin =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : DEFAULT_SITE_URL;

  // Title formatting: "Page | Brand"
  const brandName = lang === 'fa' ? 'میسون رایحه' : 'Maison Rayeha';
  const fullTitle = title ? `${title} | ${brandName}` : `${brandName} | Haute Parfumerie`;

  // Default description
  const defaultDesc =
    lang === 'fa'
      ? 'خانه عطر نیش میسون رایحه؛ خلق شاهکارهای بویایی با پیوند کیمیای کهن شرق و عطرسازی فرانسه.'
      : 'Maison Rayeha Haute Parfumerie: artisanal niche perfumes marrying Persian alchemy with French perfumery.';
  const metaDescription = description || defaultDesc;

  // Image URL resolution
  const metaImage = image || BRAND_STORY_IMAGES.primary;
  const fullImageUrl = metaImage.startsWith('http') ? metaImage : `${origin}${metaImage}`;

  // Canonical and localized alternates
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${origin}${currentPath}`;

  // Extract path without language prefix for hreflang alternates
  const pathWithoutLang = currentPath.replace(/^\/(fa|en)/, '') || '';
  const cleanPath = pathWithoutLang.startsWith('/') ? pathWithoutLang : `/${pathWithoutLang}`;
  const faUrl = `${origin}/fa${cleanPath === '/' ? '' : cleanPath}`;
  const enUrl = `${origin}/en${cleanPath === '/' ? '' : cleanPath}`;

  // Normalize JSON-LD schemas
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Meta description */}
      <meta name="description" content={metaDescription} />

      {/* Robots meta */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang alternates */}
      <link rel="alternate" hrefLang="fa" href={faUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={faUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={brandName} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:locale" content={lang === 'fa' ? 'fa_IR' : 'en_US'} />
      <meta property="og:locale:alternate" content={lang === 'fa' ? 'en_US' : 'fa_IR'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Structured Data (JSON-LD) */}
      {schemas.map((schema, index) => (
        <script key={`jsonld-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
