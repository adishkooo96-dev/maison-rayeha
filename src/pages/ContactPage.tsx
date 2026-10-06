import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  HelpCircle,
  Compass,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { Seo } from '../components/seo/Seo';
import { useI18n } from '../hooks/useI18n';
import { normalizeDigits } from '../lib/formatters';
import { SOCIAL_LINKS } from '../components/layout/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const ContactPage: React.FC = () => {
  const { lang, t } = useI18n();

  // Firestore contact document data with independent per-field fallbacks
  const [firestoreContact, setFirestoreContact] = useState<{
    address?: { fa?: string; en?: string };
    phone?: string;
    email?: string;
    workingHours?: { fa?: string; en?: string };
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchContactDoc() {
      try {
        const docRef = doc(db, 'siteContent', 'contact');
        const snap = await getDoc(docRef);
        if (isMounted) {
          if (snap.exists()) {
            setFirestoreContact(snap.data() as any);
          } else {
            setFirestoreContact(null);
          }
        }
      } catch (err) {
        console.error('[ContactPage] Error loading siteContent/contact:', err);
        if (isMounted) setFirestoreContact(null);
      }
    }
    fetchContactDoc();
    return () => {
      isMounted = false;
    };
  }, []);

  // Independent per-field fallback: if document exists and field is non-empty, use it; else fallback
  const displayAddress =
    (lang === 'fa'
      ? firestoreContact?.address?.fa?.trim()
      : firestoreContact?.address?.en?.trim()) ||
    t('contact.addressVal');

  const displayPhone =
    firestoreContact?.phone?.trim() ||
    t('contact.phoneVal');

  const displayEmail =
    firestoreContact?.email?.trim() ||
    t('contact.emailVal');

  const displayHours =
    (lang === 'fa'
      ? firestoreContact?.workingHours?.fa?.trim()
      : firestoreContact?.workingHours?.en?.trim()) ||
    t('contact.hoursVal');

  const phoneTelHref = `tel:${normalizeDigits(displayPhone).replace(/[^\d+]/g, '')}`;
  const emailMailtoHref = `mailto:${displayEmail}`;

  const faqItems: AccordionItem[] = [
    {
      id: 'faq-1',
      title: t('contact.faq1Q'),
      content: t('contact.faq1A'),
      icon: <Sparkles className="w-4 h-4 stroke-[1.5]" />,
    },
    {
      id: 'faq-2',
      title: t('contact.faq2Q'),
      content: t('contact.faq2A'),
      icon: <Clock className="w-4 h-4 stroke-[1.5]" />,
    },
    {
      id: 'faq-3',
      title: t('contact.faq3Q'),
      content: t('contact.faq3A'),
      icon: <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />,
    },
    {
      id: 'faq-4',
      title: t('contact.faq4Q'),
      content: t('contact.faq4A'),
      icon: <Sparkles className="w-4 h-4 stroke-[1.5]" />,
    },
    {
      id: 'faq-5',
      title: t('contact.faq5Q'),
      content: t('contact.faq5A'),
      icon: <Share2 className="w-4 h-4 stroke-[1.5]" />,
    },
    {
      id: 'faq-6',
      title: t('contact.faq6Q'),
      content: t('contact.faq6A'),
      icon: <HelpCircle className="w-4 h-4 stroke-[1.5]" />,
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
        name: t('nav.contact'),
        item: `https://maisonrayeha.com/${lang}/contact`,
      },
    ],
  };

  return (
    <>
      <Seo
        title={t('contact.metaTitle')}
        description={t('contact.metaDescription')}
        jsonLd={breadcrumbJsonLd}
      />

      <div className="bg-ivory text-near-black py-12 sm:py-16 lg:py-24">
        <Container size="lg">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/40 bg-gold/5 text-gold-dark text-xs uppercase tracking-widest rtl:tracking-normal font-medium rounded-xs">
              <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{t('contact.eyebrow')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-normal sm:font-medium rtl:font-extrabold rtl:leading-[1.32] text-near-black leading-tight">
              {t('contact.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted font-light leading-relaxed rtl:leading-loose">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Main Showcase Section: Side-by-Side Balanced Cards (Info & Architectural GPS Sanctuary) */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch pb-16 sm:pb-20 border-b border-border/60">
            {/* Left Card: Info & Contact Card */}
            <div className="p-7 sm:p-9 bg-ivory-surface border border-border/80 rounded-xs shadow-2xs flex flex-col justify-between text-start space-y-8">
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2 text-gold-dark text-xs uppercase tracking-widest rtl:tracking-normal font-medium mb-1">
                    <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{t('contact.eyebrow')}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-light rtl:font-normal rtl:leading-[1.4] text-near-black">
                    {t('contact.infoTitle')}
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold-dark shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider rtl:tracking-normal text-muted font-medium">
                        {t('contact.addressTitle')}
                      </h3>
                      <p className="text-xs sm:text-sm text-near-black mt-1 leading-relaxed rtl:leading-loose font-light">
                        {displayAddress}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold-dark shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider rtl:tracking-normal text-muted font-medium">
                        {t('contact.phoneTitle')}
                      </h3>
                      <a
                        href={phoneTelHref}
                        className="text-xs sm:text-sm text-near-black hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors mt-1 block font-mono"
                      >
                        <bdi dir="ltr">{displayPhone}</bdi>
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold-dark shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider rtl:tracking-normal text-muted font-medium">
                        {t('contact.emailTitle')}
                      </h3>
                      <a
                        href={emailMailtoHref}
                        className="text-xs sm:text-sm text-near-black hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors mt-1 block font-mono"
                      >
                        <bdi dir="ltr">{displayEmail}</bdi>
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold-dark shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider rtl:tracking-normal text-muted font-medium">
                        {t('contact.hoursTitle')}
                      </h3>
                      <p className="text-xs sm:text-sm text-near-black mt-1 leading-relaxed rtl:leading-loose font-light">
                        {displayHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels Footer */}
              <div className="pt-5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-muted font-light">Maison Channels:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { name: 'Instagram', href: SOCIAL_LINKS.instagram },
                    { name: 'Telegram', href: SOCIAL_LINKS.telegram },
                    { name: 'WhatsApp', href: SOCIAL_LINKS.whatsapp },
                  ].map((network) => (
                    <a
                      key={network.name}
                      href={network.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Maison Rayeha ${network.name}`}
                      className="px-3 py-1.5 text-[11px] border border-border/80 text-near-black/80 hover:text-gold-dark hover:border-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors cursor-pointer rounded-xs"
                    >
                      {network.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card: Styled Map & GPS Sanctuary Card (Architectural Blueprint Style) */}
            <div className="p-7 sm:p-9 bg-near-black text-ivory border border-border/80 rounded-xs shadow-2xs relative overflow-hidden flex flex-col justify-between text-start space-y-6">
              {/* Subtle blueprint grid overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #C5A880 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-ivory/15 pb-4">
                  <div className="flex items-center gap-2 text-gold-light">
                    <Compass className="w-4 h-4 stroke-[1.5] animate-spin-slow motion-reduce:animate-none" />
                    <span className="text-xs uppercase tracking-widest rtl:tracking-normal font-mono">
                      {t('contact.mapPlaceholderTitle')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-ivory/60 border border-ivory/20 px-2 py-0.5 rounded-xs">
                    GPS SANCTUARY
                  </span>
                </div>

                {/* Stylized Architectural Compass Canvas */}
                <div className="h-44 w-full border border-gold/25 bg-near-black/80 rounded-xs flex flex-col items-center justify-center relative overflow-hidden p-4 text-center">
                  {/* Concentric rings */}
                  <div className="w-32 h-32 rounded-full border border-gold/20 absolute animate-pulse motion-reduce:animate-none" />
                  <div className="w-20 h-20 rounded-full border border-gold/30 absolute" />
                  <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_14px_#C5A880] relative z-10" />

                  <div className="absolute bottom-3 inset-x-0 text-center px-4">
                    <p className="text-[10px] sm:text-[11px] font-mono text-gold-light tracking-wider rtl:tracking-normal">
                      {t('contact.mapPlaceholderCoords')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-ivory/70 font-light leading-relaxed rtl:leading-loose">
                  {t('contact.mapPlaceholderNotice')}
                </p>
              </div>

              {/* Direct VIP hotline action link */}
              <div className="relative z-10 pt-4 border-t border-ivory/15">
                <a
                  href={phoneTelHref}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gold/15 hover:bg-gold text-gold-light hover:text-near-black border border-gold/40 hover:border-gold rounded-xs text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>{lang === 'fa' ? 'تماس مستقیم با کارشناس تشریفات' : 'Direct Call to VIP Concierge'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Section (6 Questions in both languages) */}
          <div className="pt-16 sm:pt-20 max-w-3xl mx-auto">
            <div className="text-center mb-10 space-y-2">
              <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                {t('contact.faqEyebrow')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black">
                {t('contact.faqTitle')}
              </h2>
            </div>

            <Accordion items={faqItems} defaultOpenId="faq-1" />
          </div>
        </Container>
      </div>
    </>
  );
};
