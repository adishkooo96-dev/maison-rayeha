import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { LocaleLink } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';
import { useI18n } from '../hooks/useI18n';

export const NotFoundPage: React.FC = () => {
  const { lang, isRTL, t } = useI18n();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${lang}/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Seo
        title={t('notFound.metaTitle')}
        description={t('notFound.metaDescription')}
        noindex={true}
      />

      <div className="min-h-[75vh] flex items-center justify-center bg-ivory text-near-black pt-28 sm:pt-32 pb-16 sm:pb-24">
        <Container size="sm" className="text-center">
          <div className="space-y-8 max-w-lg mx-auto">
            {/* Elegant Flacon Silhouette Emblem */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-gold/40 bg-gold/5 animate-pulse motion-reduce:animate-none" />
              <svg
                viewBox="0 0 64 64"
                fill="none"
                className="w-14 h-14 text-gold-dark"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Flacon Stopper */}
                <path d="M26 12h12v4H26z" />
                <path d="M29 8h6v4h-6z" />
                {/* Flacon Body */}
                <path d="M20 22h24l4 10v22a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V32l4-10z" />
                {/* Liquid Level Line */}
                <path d="M20 42c4-2 8-2 12 0s8 2 12 0" strokeDasharray="2 2" />
                {/* Delicate 404 Monogram */}
                <circle cx="32" cy="34" r="3" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>

            {/* Error Code & Poetic Copy */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                {t('notFound.code')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black tracking-wide rtl:tracking-normal">
                {t('notFound.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted font-light leading-relaxed rtl:leading-loose max-w-md mx-auto">
                {t('notFound.description')}
              </p>
            </div>

            {/* Working Search Box */}
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('notFound.searchPlaceholder')}
                  className="w-full text-base sm:text-sm bg-ivory-surface border border-border px-4 py-3 pe-12 min-h-[44px] text-near-black placeholder:text-muted/60 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold rounded-xs shadow-2xs"
                />
                <button
                  type="submit"
                  aria-label={t('notFound.searchButton')}
                  className="absolute end-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="pt-6 border-t border-border/80 space-y-3">
              <p className="text-xs uppercase tracking-wider rtl:tracking-normal text-muted font-medium">
                {t('notFound.quickLinksTitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <LocaleLink
                  to="/"
                  className="inline-flex items-center justify-center min-h-[44px] gap-2 px-4 py-2 border border-border bg-ivory text-near-black hover:border-gold hover:text-gold-dark transition-colors text-xs uppercase tracking-wider rtl:tracking-normal font-medium rounded-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Home className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{t('notFound.backHome')}</span>
                </LocaleLink>

                <LocaleLink
                  to="/shop"
                  className="inline-flex items-center justify-center min-h-[44px] gap-2 px-4 py-2 border border-border bg-ivory text-near-black hover:border-gold hover:text-gold-dark transition-colors text-xs uppercase tracking-wider rtl:tracking-normal font-medium rounded-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{t('notFound.exploreShop')}</span>
                </LocaleLink>

                <LocaleLink
                  to="/contact"
                  className="inline-flex items-center justify-center min-h-[44px] gap-2 px-4 py-2 border border-border bg-ivory text-near-black hover:border-gold hover:text-gold-dark transition-colors text-xs uppercase tracking-wider rtl:tracking-normal font-medium rounded-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span>{t('notFound.contactConcierge')}</span>
                  <ArrowIcon className="w-3 h-3 stroke-[1.5]" />
                </LocaleLink>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
