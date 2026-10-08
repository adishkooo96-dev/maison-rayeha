import React from 'react';
import { ArrowRight, ArrowLeft, Sparkles, ChevronDown } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';
import { HERO_BACKGROUND_IMAGE } from '../../data/images';

export const HeroSection: React.FC = () => {
  const { lang, isRTL, t, formatPercent, formatNumber } = useI18n();

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      aria-label="Maison Rayeha Hero"
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#0F0F10] text-white"
    >
      {/* Background Image with Atmospheric Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Real brand asset placeholder: High-resolution crystal perfume flacon with warm amber backlight */}
        <img
          src={HERO_BACKGROUND_IMAGE}
          alt="Maison Rayeha Haute Parfumerie Flacon"
          referrerPolicy="no-referrer"
          decoding="async"
          className="w-full h-full object-cover object-center scale-105 animate-in fade-in duration-1000"
        />
        {/* Layered luxury scrim gradients for high-contrast readability (WCAG AAA >= 7:1) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/75 to-[#0F0F10]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-20 text-center flex flex-col items-center">
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs border border-gold/50 bg-[#0F0F10]/80 backdrop-blur-xs text-gold text-xs tracking-widest rtl:tracking-normal uppercase mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700 motion-reduce:animate-none shadow-sm">
          <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
          <span>{t('hero.badge', { year: formatNumber(2026, { useGrouping: false }) })}</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal font-display tracking-wide text-[var(--text-on-image)] leading-[1.12] rtl:font-nastaliq rtl:text-4xl rtl:sm:text-6xl rtl:md:text-7xl rtl:lg:text-8xl rtl:leading-[1.9] max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-800 motion-reduce:animate-none py-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          {t('hero.title')}
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-[var(--text-on-image)] max-w-2xl font-light leading-relaxed rtl:leading-loose animate-in fade-in slide-in-from-bottom-5 duration-900 motion-reduce:animate-none drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] opacity-95">
          {t('hero.subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 motion-reduce:animate-none">
          <Button
            variant="gold"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
            onClick={() => handleScrollToSection('bestsellers-section')}
          >
            {t('hero.ctaExplore')}
          </Button>
        </div>

        {/* Micro Credential Marks */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-[var(--border)] grid grid-cols-3 gap-6 sm:gap-12 text-center text-xs text-[var(--text-on-image)] w-full max-w-xl">
          <div>
            <span className="block text-sm sm:text-base font-bold text-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              {formatPercent(30)}
            </span>
            <span className="text-[11px] uppercase tracking-wider rtl:tracking-normal text-[var(--text-on-image)] font-medium">
              {t('hero.statConcentration')}
            </span>
          </div>
          <div>
            <span className="block text-sm sm:text-base font-bold text-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              {t('hero.statCraftsmanship')}
            </span>
            <span className="text-[11px] uppercase tracking-wider rtl:tracking-normal text-[var(--text-on-image)] font-medium">
              {t('hero.statCraftsmanshipLabel')}
            </span>
          </div>
          <div>
            <span className="block text-sm sm:text-base font-bold text-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              {t('hero.statAuthenticity')}
            </span>
            <span className="text-[11px] uppercase tracking-wider rtl:tracking-normal text-[var(--text-on-image)] font-medium">
              {t('hero.statAuthenticityLabel')}
            </span>
          </div>
        </div>
      </div>

      {/* Gentle Scroll Down Indicator */}
      <button
        type="button"
        onClick={() => handleScrollToSection('bestsellers-section')}
        aria-label="Scroll to bestsellers"
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] inset-x-0 mx-auto min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70 hover:text-gold transition-colors z-10 cursor-pointer animate-bounce"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </section>
  );
};
