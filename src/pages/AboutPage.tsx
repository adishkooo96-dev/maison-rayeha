import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Droplets, Leaf, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { LocaleLink } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';
import { useI18n } from '../hooks/useI18n';
import { BRAND_STORY_IMAGES, HERO_BACKGROUND_IMAGE, COLLECTION_IMAGES } from '../data/images';
import { AboutContent, DEFAULT_ABOUT_CONTENT, getAboutContent } from '../lib/contentApi';

export const AboutPage: React.FC = () => {
  const { lang, isRTL, t, formatNumber } = useI18n();

  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    let isMounted = true;
    getAboutContent().then((data) => {
      if (isMounted) setContent(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const valueIcons = [Sparkles, Droplets, Leaf, ShieldCheck];

  // Numbers stored as pure numeric values and formatted at render time
  const stats = [
    { value: 38, label: t('about.statsYears'), suffix: '+' },
    { value: 24, label: t('about.statsFragrances'), suffix: '' },
    { value: 48, label: t('about.statsCountries'), suffix: '+' },
    { value: 30, label: t('about.statsPurity'), suffix: '%' },
  ];

  const values = [
    {
      icon: Sparkles,
      title: t('about.craftsmanshipTitle'),
      description: t('about.craftsmanshipDesc'),
    },
    {
      icon: Droplets,
      title: t('about.rareIngredientsTitle'),
      description: t('about.rareIngredientsDesc'),
    },
    {
      icon: Leaf,
      title: t('about.sustainabilityTitle'),
      description: t('about.sustainabilityDesc'),
    },
    {
      icon: ShieldCheck,
      title: t('about.authenticityTitle'),
      description: t('about.authenticityDesc'),
    },
  ];

  const steps = [
    {
      number: 1,
      title: t('about.step1Title'),
      description: t('about.step1Desc'),
      image: COLLECTION_IMAGES.botanicalNocturne,
    },
    {
      number: 2,
      title: t('about.step2Title'),
      description: t('about.step2Desc'),
      image: BRAND_STORY_IMAGES.secondary,
    },
    {
      number: 3,
      title: t('about.step3Title'),
      description: t('about.step3Desc'),
      image: BRAND_STORY_IMAGES.primary,
    },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('nav.home'),
        item: `https://maisonrayeha.com/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('nav.about'),
        item: `https://maisonrayeha.com/${lang}/about`,
      },
    ],
  };

  return (
    <>
      <Seo
        title={t('about.metaTitle')}
        description={t('about.metaDescription')}
        image={BRAND_STORY_IMAGES.primary}
        jsonLd={breadcrumbJsonLd}
      />

      <div className="bg-ivory text-near-black">
        {/* 1. Hero Section */}
        <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-near-black text-ivory">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_BACKGROUND_IMAGE}
              alt={t('about.heroTitle')}
              className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105"
              loading="eager"
              width="1920"
              height="1080"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/70 to-near-black/40" />
          </div>

          <Container size="lg" className="relative z-10 pt-28 pb-20 sm:py-24 px-5 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto space-y-6 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-gold/40 bg-near-black/60 backdrop-blur-sm text-gold-light text-xs tracking-widest rtl:tracking-normal uppercase">
                <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{t('about.heroEyebrow')}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-normal sm:font-medium rtl:font-extrabold rtl:leading-[1.32] leading-tight text-ivory tracking-wide rtl:tracking-normal">
                {content.heroHeadline[lang] || t('about.heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-ivory/80 font-light leading-relaxed rtl:leading-loose max-w-2xl mx-auto whitespace-pre-line">
                {content.heroSubtext[lang] || t('about.heroSubtitle')}
              </p>
            </motion.div>
          </Container>
        </section>

        {/* 2. Brand Story (Split Layout: Image + Text) */}
        <section className="py-20 lg:py-28 border-b border-border/60">
          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Visual Flacon Atelier */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative">
                  <div className="aspect-[4/5] bg-ivory-subtle border border-border/80 overflow-hidden shadow-2xs rounded-xs">
                    <img
                      src={BRAND_STORY_IMAGES.primary}
                      alt={t('about.storyTitle')}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      width="800"
                      height="1000"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Subtle decorative gold framing accent */}
                  <div className="absolute -bottom-4 -end-4 w-32 h-32 border-b-2 border-e-2 border-gold/40 pointer-events-none hidden sm:block" />
                </div>
              </div>

              {/* Story Narrative */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-start">
                <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                  {t('about.storyEyebrow')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black leading-snug">
                  {t('about.storyTitle')}
                </h2>

                <div className="space-y-4">
                  {(content.storyText[lang] || t('about.storyParagraph1'))
                    .split('\n\n')
                    .map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className={
                          pIdx === 0
                            ? 'text-base text-near-black font-medium leading-relaxed rtl:leading-loose'
                            : 'text-sm text-muted leading-relaxed rtl:leading-loose font-light'
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>

                <div className="pt-4 border-t border-border/60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-gold-dark flex-shrink-0">
                      <Sparkles className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-xs tracking-wider rtl:tracking-normal text-muted uppercase">
                        {t('story.atelierBadge')}
                      </p>
                      <p className="text-sm font-display text-near-black">
                        <bdi dir="ltr">Maison Rayeha Haute Parfumerie</bdi>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 3. Values Section (Thin-line icons) */}
        <section className="py-20 lg:py-28 bg-ivory-surface border-b border-border/60">
          <Container size="lg">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                {t('about.valuesEyebrow')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black">
                {content.valuesTitle[lang] || t('about.valuesTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(content.values && content.values.length > 0 ? content.values : DEFAULT_ABOUT_CONTENT.values).map((val, idx) => {
                const IconComponent = valueIcons[idx % valueIcons.length];
                return (
                  <div
                    key={idx}
                    className="p-8 bg-ivory border border-border/80 hover:border-gold/50 transition-colors duration-300 space-y-4 flex flex-col text-start rounded-xs shadow-2xs"
                  >
                    <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center text-gold-dark bg-gold/5 flex-shrink-0">
                      <IconComponent className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-display font-normal rtl:leading-[1.45] text-near-black">
                      {val.title[lang]}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed rtl:leading-loose font-light flex-grow">
                      {val.description[lang]}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* 4. "How We Make Our Perfumes" 3-Step Creation Ritual */}
        <section className="py-20 lg:py-28 border-b border-border/60">
          <Container size="lg">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                {t('about.processEyebrow')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black">
                {t('about.processTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light leading-relaxed rtl:leading-loose">
                {t('about.processSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-ivory border border-border/80 overflow-hidden flex flex-col text-start rounded-xs shadow-2xs"
                >
                  <div className="aspect-[4/3] bg-ivory-subtle overflow-hidden border-b border-border/60">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105 motion-reduce:transform-none"
                      loading="lazy"
                      width="600"
                      height="450"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="inline-block text-xs font-mono text-gold-dark font-medium border border-gold/30 px-2 py-0.5 rounded-xs">
                        {formatNumber(step.number, { minimumIntegerDigits: 2, useGrouping: false })}
                      </div>
                      <h3 className="text-base font-display font-medium rtl:leading-[1.45] text-near-black">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted leading-relaxed rtl:leading-loose font-light">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* 5. Dark Statistics Band */}
        <section className="py-14 sm:py-20 bg-near-black text-ivory border-y border-border/40">
          <Container size="lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-2 sm:p-0 space-y-2">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-light font-display text-gold-light tracking-tight rtl:tracking-normal">
                    {formatNumber(stat.value, { useGrouping: false })}
                    <span className="text-2xl sm:text-3xl text-gold-light/80">{stat.suffix}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-ivory/70 font-light max-w-[180px] mx-auto leading-relaxed rtl:leading-loose">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* 6. Closing CTA to Shop */}
        <section className="py-20 lg:py-28 bg-ivory text-center">
          <Container size="md">
            <div className="space-y-6 max-w-xl mx-auto">
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                <bdi dir="ltr">Maison Rayeha Gallery</bdi>
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black">
                {t('about.ctaTitle')}
              </h2>
              <p className="text-sm text-muted font-light leading-relaxed rtl:leading-loose">
                {t('about.ctaSubtitle')}
              </p>
              <div className="pt-4">
                <LocaleLink
                  to="/shop"
                  className="inline-flex items-center justify-center min-h-[44px] gap-3 px-8 py-3.5 bg-near-black text-ivory hover:bg-gold hover:text-near-black transition-colors duration-300 text-xs uppercase tracking-widest rtl:tracking-normal font-medium group rounded-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <span>{t('about.ctaButton')}</span>
                  <ArrowIcon className="w-4 h-4 stroke-[1.5] motion-reduce:transition-none transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </LocaleLink>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
};
