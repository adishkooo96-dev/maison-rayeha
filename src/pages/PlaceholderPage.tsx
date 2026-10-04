import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { LocaleLink } from '../components/navigation/LocaleLink';

export interface PlaceholderPageProps {
  pageKey: 'shop' | 'collections' | 'scentFamilies' | 'about' | 'contact' | 'cart';
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ pageKey }) => {
  const { lang, isRTL, t } = useI18n();
  const pageTitle = t(`nav.${pageKey}`);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} | Maison Rayeha`}</title>
      </Helmet>

      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center bg-ivory text-near-black">
        <Container size="md" className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold-dark text-xs uppercase tracking-widest mb-4 border border-gold/40 rounded-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{t('placeholder.architecture')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-light font-display text-near-black mb-4">
            {pageTitle}
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-lg mx-auto leading-relaxed font-light">
            {t('placeholder.description', { title: pageTitle })}
          </p>

          <div className="mt-8">
            <LocaleLink to="/">
              <Button
                variant="primary"
                size="md"
                className="shadow-2xs"
                rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
              >
                {t('nav.home')}
              </Button>
            </LocaleLink>
          </div>
        </Container>
      </div>
    </>
  );
};
