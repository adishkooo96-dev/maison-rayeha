import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Wind, Flower2, TreePine, Flame, Citrus } from 'lucide-react';
import { scentFamilies } from '../../data/scentFamilies';
import { products as initialProducts } from '../../data/products';
import { subscribeToProducts } from '../../lib/productsApi';
import { ScentFamilyId, Product } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { ProductCard } from '../product/ProductCard';
import { LocaleLink } from '../navigation/LocaleLink';

export const ScentFamilySection: React.FC = () => {
  const { lang, isRTL, t, getLocalized, formatNumber } = useI18n();
  const [activeFamilyId, setActiveFamilyId] = useState<ScentFamilyId>('oriental');
  const [productList, setProductList] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      if (data && data.length > 0) {
        setProductList(data);
      }
    });
    return () => unsub();
  }, []);

  const activeFamily = scentFamilies.find((f) => f.id === activeFamilyId) || scentFamilies[0];
  const familyProducts = productList.filter((p) => p.scentFamily === activeFamilyId).slice(0, 4);
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
      className="py-16 sm:py-24 bg-ivory text-near-black"
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
                    ? 'bg-near-black text-ivory border-near-black shadow-md'
                    : 'bg-ivory-subtle text-near-black border-border hover:border-gold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={isCurrent ? 'text-gold' : 'text-muted'}>
                    {familyIcons[family.id]}
                  </span>
                  <span className={`text-[10px] tracking-widest rtl:tracking-normal uppercase ${isCurrent ? 'text-gold' : 'text-muted'}`}>
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
        <div className="bg-ivory-surface border-[1.5px] border-gold rounded-[12px] shadow-sm p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Mood Photograph */}
          <div className="w-full lg:w-1/2 aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-ivory-subtle relative border border-gold/40 rounded-[8px] shrink-0">
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
            <div className="absolute inset-0 bg-gradient-to-t from-near-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 start-4 text-ivory">
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

              <h3 className="text-2xl sm:text-4xl font-normal sm:font-medium font-display rtl:font-bold rtl:leading-[1.35] text-near-black">
                {getLocalized(activeFamily.name, lang)}
              </h3>

              <p className="mt-4 text-sm text-muted leading-relaxed rtl:leading-loose font-light">
                {getLocalized(activeFamily.description, lang)}
              </p>

              {/* Characteristic Notes Chips */}
              <div className="mt-6 pt-6 border-t border-border">
                <span className="text-xs font-medium uppercase tracking-wider rtl:tracking-normal text-near-black block mb-3">
                  {t('scentFamilies.signatureNotes')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {getLocalized(activeFamily.characteristicNotes, lang).map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1 bg-ivory-subtle border border-border text-xs text-near-black/90 font-light"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-border">
              <LocaleLink
                to={`/shop?scentFamily=${activeFamily.id}`}
                className="inline-flex items-center min-h-[44px] gap-2.5 text-xs uppercase tracking-widest rtl:tracking-normal font-medium text-near-black hover:text-gold transition-colors group"
              >
                <span>{t('scentFamilies.exploreFamily')}</span>
                <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </LocaleLink>
            </div>
          </div>
        </div>

        {/* Active Family Products Grid: 2-col mobile, 3-col tablet, 4-col desktop */}
        {familyProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/80">
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                {lang === 'fa'
                  ? `شاهکارهای منتخب خانواده ${getLocalized(activeFamily.name, lang)}`
                  : `Curated ${getLocalized(activeFamily.name, lang)} Creations`}
              </span>
              <LocaleLink
                to={`/shop?scentFamily=${activeFamily.id}`}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-near-black hover:text-gold-dark font-medium transition-colors group"
              >
                <span>{lang === 'fa' ? 'مشاهده همه' : 'View all'}</span>
                <ArrowIcon className="w-3.5 h-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </LocaleLink>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {familyProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};
