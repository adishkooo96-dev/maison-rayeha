import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { Seo } from '../components/seo/Seo';
import { HeroSection } from '../components/home/HeroSection';
import { BestsellersSection } from '../components/home/BestsellersSection';
import { ScentFamilySection } from '../components/home/ScentFamilySection';
import { BrandStorySection } from '../components/home/BrandStorySection';
import { SectionDivider } from '../components/ui/SectionDivider';

export const HomePage: React.FC = () => {
  const { lang, t } = useI18n();

  const title = t('home.metaTitle');
  const description = t('home.metaDescription');

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maison Rayeha',
    url: 'https://maisonrayeha.com',
    logo: 'https://maisonrayeha.com/favicon.svg',
    sameAs: [
      'https://instagram.com/maisonrayeha',
      'https://t.me/maisonrayeha',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+98-21-2200-0000',
      contactType: 'concierge',
      availableLanguage: ['Persian', 'English'],
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: lang === 'fa' ? 'میسون رایحه' : 'Maison Rayeha',
    url: `https://maisonrayeha.com/${lang}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://maisonrayeha.com/${lang}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <Seo
        title={title}
        description={description}
        jsonLd={[organizationSchema, webSiteSchema]}
      />

      <div className="bg-ivory">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* Decorative Divider */}
        <SectionDivider />

        {/* 2. Bestsellers Section with ProductCard Grid */}
        <BestsellersSection />

        {/* Decorative Divider */}
        <SectionDivider />

        {/* 3. Scent Family Section */}
        <ScentFamilySection />

        {/* Decorative Divider */}
        <SectionDivider />

        {/* 4. Brand Story Teaser */}
        <BrandStorySection />
      </div>
    </>
  );
};
