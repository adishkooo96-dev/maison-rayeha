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

      <div className="bg-ivory text-near-black pt-28 sm:pt-32 pb-16 sm:pb-24 lg:pb-28">
        <Container size="lg">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
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

          {/* Main Showcase Section: Contact Card with Direct Call under Social Links */}
          <div className="max-w-3xl mx-auto pb-16 sm:pb-20 border-b border-border/60">
            {/* Contact Information & Direct Action Card */}
            <div className="p-7 sm:p-10 bg-ivory-surface border border-border/80 rounded-xs shadow-2xs text-start space-y-8">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Address */}
                  <div className="sm:col-span-2 flex items-start gap-3.5 p-3.5 rounded-xs bg-ivory/60 border border-border/40">
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
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xs bg-ivory/60 border border-border/40">
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
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xs bg-ivory/60 border border-border/40">
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
                  <div className="sm:col-span-2 flex items-start gap-3.5 p-3.5 rounded-xs bg-ivory/60 border border-border/40">
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

              {/* Social Channels & Direct Call */}
              <div className="pt-6 border-t border-border/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-muted font-medium">
                    {lang === 'fa' ? 'شبکه‌های اجتماعی مِزون:' : 'Maison Channels:'}
                  </span>
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
                        className="px-3.5 py-1.5 text-xs border border-border/80 text-near-black/80 hover:text-gold-dark hover:border-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors cursor-pointer rounded-xs bg-ivory/70 font-medium"
                      >
                        {network.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Direct Call (تماس مستقیم) under Social Channels */}
                <div className="pt-2">
                  <a
                    href={phoneTelHref}
                    className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-near-black hover:bg-gold-dark text-ivory hover:text-near-black border border-near-black hover:border-gold-dark rounded-xs text-sm font-medium transition-all duration-200 cursor-pointer shadow-xs group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold/20 group-hover:bg-near-black/10 flex items-center justify-center text-gold group-hover:text-near-black shrink-0 transition-colors">
                      <Phone className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    <span className="font-medium">
                      {lang === 'fa' ? 'تماس مستقیم با کارشناس' : 'Direct Call to Concierge'}
                    </span>
                    <span className="text-xs font-mono opacity-80 border-s border-ivory/30 group-hover:border-near-black/30 ps-3">
                      <bdi dir="ltr">{displayPhone}</bdi>
                    </span>
                  </a>
                </div>
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
