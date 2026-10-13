import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Wind, Flower2, TreePine, Flame, Citrus } from 'lucide-react';
import { scentFamilies } from '../../data/scentFamilies';
import { ScentFamilyId } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { LocaleLink } from '../navigation/LocaleLink';

export const ScentFamilySection: React.FC = () => {
  const { lang, isRTL, t, getLocalized, formatNumber } = useI18n();
  const [activeFamilyId, setActiveFamilyId] = useState<ScentFamilyId>('oriental');

  const activeFamily = scentFamilies.find((f) => f.id === activeFamilyId) || scentFamilies[0];
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const familyIcons: Record<ScentFamilyId, React.ReactNode> = {
    floral: <Flower2 className="w-4 h-4" />,
    woody: <TreePine className="w-4 h-4" />,
    oriental: <Flame className="w-4 h-4" />,
    fresh: <Wind className="w-4 h-4" />,
    citrus: <Citrus className="w-4 h-4" />,
  };

  return (
    <section
      id="scent-families-section"
      className="py-16 sm:py-24 bg-[var(--bg-page)] text-[var(--text-primary)]"
      aria-labelledby="scent-families-heading"
    >
      <Container size="lg">
        <SectionHeading
          eyebrow={t('scentFamilies.eyebrow')}
          title={t('scentFamilies.title')}
          subtitle={t('scentFamilies.subtitle')}
        />

        {/* 5 Family Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {scentFamilies.map((family) => {
            const isCurrent = family.id === activeFamilyId;
            return (
              <button
                key={family.id}
                type="button"
                onClick={() => setActiveFamilyId(family.id)}
                className={`p-4 border transition-all duration-300 text-start flex flex-col justify-between h-24 rounded-[10px] cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--chip-selected-bg)] text-[var(--chip-selected-text)] border-[var(--chip-selected-bg)] shadow-md font-semibold'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border-[var(--border)] hover:border-gold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={isCurrent ? 'text-gold' : 'text-[var(--text-secondary)]'}>
                    {familyIcons[family.id]}
                  </span>
                  <span className={`text-[10px] tracking-widest rtl:tracking-normal uppercase ${isCurrent ? 'text-gold' : 'text-[var(--text-secondary)]'}`}>
                    {formatNumber(scentFamilies.indexOf(family) + 1, { minimumIntegerDigits: 2, useGrouping: false })}
                  </span>
                </div>

                <span className="text-sm font-medium">
                  {family.name[lang].split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured Family Showcase Card */}
        <div className="bg-[var(--bg-surface)] border-[1.5px] border-gold rounded-[12px] shadow-sm p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Mood Photograph */}
          <div className="w-full lg:w-1/2 aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[var(--bg-surface-raised)] relative border border-gold/40 rounded-[8px] shrink-0">
            <img
              src={activeFamily.image}
              alt={getLocalized(activeFamily.name, lang)}
              loading="lazy"
              width="600"
              height="450"
              referrerPolicy="no-referrer"
              decoding="async"
              className="w-full h-full object-cover object-center transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 start-4 text-white">
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold block">
                {t('scentFamilies.pureElements')}
              </span>
              <span className="text-lg font-light font-display rtl:font-normal rtl:leading-[1.45]">
                {getLocalized(activeFamily.name, lang)}
              </span>
            </div>
          </div>

          {/* Scent Information & Notes */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between text-start">
            <div>
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold font-medium block mb-2">
                {getLocalized(activeFamily.tagline, lang)}
              </span>

              <h3 className="text-2xl sm:text-4xl font-normal sm:font-medium font-display rtl:font-bold rtl:leading-[1.35] text-[var(--text-primary)]">
                {getLocalized(activeFamily.name, lang)}
              </h3>

              <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed rtl:leading-loose font-light">
                {getLocalized(activeFamily.description, lang)}
              </p>

              {/* Characteristic Notes Chips */}
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <span className="text-xs font-medium uppercase tracking-wider rtl:tracking-normal text-[var(--text-primary)] block mb-3">
                  {t('scentFamilies.signatureNotes')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {getLocalized(activeFamily.characteristicNotes, lang).map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1 bg-[var(--bg-surface-raised)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-light rounded-xs"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <LocaleLink
                to={`/shop?scentFamily=${activeFamily.id}`}
                className="inline-flex items-center min-h-[44px] gap-2.5 text-xs uppercase tracking-widest rtl:tracking-normal font-medium text-[var(--text-primary)] hover:text-gold transition-colors group"
              >
                <span>{t('scentFamilies.exploreFamily')}</span>
                <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </LocaleLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
