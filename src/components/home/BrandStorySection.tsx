import React from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Feather } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Container } from '../ui/Container';
import { LocaleLink } from '../navigation/LocaleLink';
import { BRAND_STORY_IMAGES } from '../../data/images';

export const BrandStorySection: React.FC = () => {
  const { lang, isRTL, t } = useI18n();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      id="brand-story-section"
      className="pt-16 sm:pt-24 pb-20 sm:pb-28 bg-ivory text-near-black relative overflow-hidden"
      aria-labelledby="brand-story-heading"
    >
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Visual Composition Side (5 columns) */}
          <div className="lg:col-span-5 relative">
            {/* Primary Artisan Photography */}
            <div className="relative aspect-[3/4] overflow-hidden bg-ivory-subtle border-[1.5px] border-gold rounded-[10px] shadow-sm">
              {/* Real brand asset placeholder: Artisanal fragrance distillation atelier with crystal flacons */}
              <img
                src={BRAND_STORY_IMAGES.primary}
                alt="Maison Rayeha Fragrance Atelier"
                loading="lazy"
                referrerPolicy="no-referrer"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-near-black/50 via-transparent to-transparent" />
            </div>

            {/* Overlapping secondary detail frame */}
            <div className="hidden sm:block absolute -bottom-8 -end-8 w-44 h-56 bg-ivory-surface p-2 border-[1.5px] border-gold rounded-[8px] shadow-xl">
              <div className="w-full h-full overflow-hidden bg-near-black relative rounded-[4px]">
                {/* Real brand asset placeholder: Dark amber extrait de parfum flacon */}
                <img
                  src={BRAND_STORY_IMAGES.secondary}
                  alt="Maison Rayeha Extrait Flacon"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Decorative seal badge */}
            <div className="absolute top-4 start-4 bg-near-black/85 backdrop-blur-xs text-gold-light border border-gold/40 px-3 py-1 text-[11px] uppercase tracking-widest rtl:tracking-normal flex items-center gap-1.5 font-medium rounded-xs">
              <Sparkles className="w-3 h-3 stroke-[1.5]" />
              <span>{t('story.atelierBadge')}</span>
            </div>
          </div>

          {/* Story Narrative Content Side (7 columns) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-start">
            <span className="text-xs font-medium uppercase tracking-widest rtl:tracking-normal text-gold-dark mb-3 flex items-center gap-2">
              <Feather className="w-3.5 h-3.5 stroke-[1.5]" />
              {t('story.eyebrow')}
            </span>

            <h2
              id="brand-story-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal sm:font-medium font-display rtl:font-extrabold rtl:leading-[1.35] text-near-black leading-tight"
            >
              {t('story.title')}
            </h2>

            <p className="mt-6 text-base sm:text-lg text-near-black/90 font-serif italic border-s-2 border-gold ps-4 py-1 leading-relaxed rtl:leading-loose">
              {t('story.lead')}
            </p>

            <div className="mt-6 space-y-4 text-sm text-muted leading-relaxed rtl:leading-loose font-light">
              <p>{t('story.paragraph1')}</p>
              <p>{t('story.paragraph2')}</p>
            </div>

            {/* Poetic quote block */}
            <div className="mt-8 p-6 bg-ivory-subtle border-[1.5px] border-gold/50 relative rounded-[10px] shadow-sm">
              <p className="text-sm font-light text-near-black italic leading-relaxed rtl:leading-loose">
                {t('story.quote')}
              </p>
              <span className="block mt-2 text-xs font-medium text-gold-dark uppercase tracking-wider rtl:tracking-normal">
                — {t('story.quoteAuthor')}
              </span>
            </div>

            {/* Link to about/chronicle */}
            <div className="mt-8 pt-4">
              <LocaleLink
                to="/about"
                className="inline-flex items-center gap-3 text-xs uppercase tracking-widest rtl:tracking-normal font-semibold text-near-black hover:text-gold-dark transition-colors group pb-1 border-b border-near-black/30 hover:border-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
              >
                <span>{t('story.cta')}</span>
                <ArrowIcon className="w-4 h-4 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </LocaleLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
