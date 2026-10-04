import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Compass,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { Seo } from '../components/seo/Seo';
import { useI18n } from '../hooks/useI18n';
import { normalizeDigits, handleLiveDigitInput } from '../lib/formatters';
import { SOCIAL_LINKS } from '../components/layout/Footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const ContactPage: React.FC = () => {
  const { lang, isRTL, t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

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

  // Dynamic schema evaluated at render time for current language
  const contactSchema = useMemo(() => {
    return z.object({
      name: z
        .string()
        .trim()
        .min(2, t('contact.nameMin')),
      email: z
        .string()
        .trim()
        .email(t('contact.emailInvalid')),
      phone: z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val || val.trim() === '') return true;
            const normalized = normalizeDigits(val.trim());
            return /^[\d\s+\-()]{7,20}$/.test(normalized);
          },
          { message: t('contact.phoneInvalid') }
        ),
      subject: z
        .string()
        .min(1, t('contact.subjectRequired')),
      message: z
        .string()
        .trim()
        .min(10, t('contact.messageMin')),
    });
  }, [t]);

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'consultation',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    // Normalize phone digits before dispatch
    const normalizedData = {
      ...data,
      phone: data.phone ? normalizeDigits(data.phone) : '',
    };

    // TODO: Connect to real backend API or transactional email service (e.g. Resend, SendGrid, or custom API route)
    // Example: await fetch('/api/concierge/inquiries', { method: 'POST', body: JSON.stringify(normalizedData) });
    console.log('[Maison Concierge] Inquiry submitted:', normalizedData);

    // Simulated network latency
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
    }, 1500);
  };

  const subjectOptions = [
    { value: 'consultation', label: t('contact.subjectConsultation') },
    { value: 'order', label: t('contact.subjectOrder') },
    { value: 'atelier', label: t('contact.subjectAtelier') },
    { value: 'press', label: t('contact.subjectPress') },
    { value: 'other', label: t('contact.subjectOther') },
  ];

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
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
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

          {/* Main 2-Column Section: Form & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 border-b border-border/60">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 bg-ivory-surface border border-border/80 p-6 sm:p-10 shadow-2xs rounded-xs text-start">
              <h2 className="text-xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black mb-6">
                {t('contact.formTitle')}
              </h2>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 px-6 text-center space-y-5 bg-ivory border border-gold/40 rounded-xs shadow-2xs"
                  >
                    <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold-dark mx-auto">
                      <CheckCircle2 className="w-7 h-7 stroke-[1.75]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-normal text-near-black">
                        {t('contact.successTitle')}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted font-light max-w-md mx-auto leading-relaxed">
                        {t('contact.successDesc')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSuccess(false)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 border border-near-black text-near-black hover:bg-near-black hover:text-ivory transition-colors text-xs uppercase tracking-widest font-medium cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span>{t('contact.sendAnother')}</span>
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name */}
                    <Input
                      label={t('contact.nameLabel')}
                      placeholder={t('contact.namePlaceholder')}
                      error={errors.name?.message}
                      {...register('name')}
                    />

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="email"
                        label={t('contact.emailLabel')}
                        placeholder={t('contact.emailPlaceholder')}
                        error={errors.email?.message}
                        dir="ltr"
                        className="text-start"
                        {...register('email')}
                      />
                      <Input
                        type="tel"
                        label={t('contact.phoneLabel')}
                        placeholder={t('contact.phonePlaceholder')}
                        error={errors.phone?.message}
                        dir="ltr"
                        className="text-start"
                        normalizeDigits
                        {...register('phone', {
                          onChange: handleLiveDigitInput,
                        })}
                      />
                    </div>

                    {/* Subject */}
                    <div className="w-full text-start">
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-medium text-near-black mb-1.5"
                      >
                        {t('contact.subjectLabel')}
                      </label>
                      <Select
                        id="contact-subject"
                        options={subjectOptions}
                        containerClassName="w-full"
                        className="w-full"
                        {...register('subject')}
                      />
                      {errors.subject?.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <Textarea
                      label={t('contact.messageLabel')}
                      placeholder={t('contact.messagePlaceholder')}
                      rows={5}
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] gap-3 px-8 py-3.5 bg-near-black text-ivory hover:bg-gold hover:text-near-black transition-colors duration-200 text-xs uppercase tracking-widest font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                            <span>{t('contact.submitting')}</span>
                          </>
                        ) : (
                          <>
                            <span>{t('contact.submitButton')}</span>
                            <Send className="w-3.5 h-3.5 stroke-[1.5] rtl:-scale-x-100" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Info & Styled Map Placeholder */}
            <div className="lg:col-span-5 space-y-8 text-start">
              <div className="p-6 sm:p-8 bg-ivory-surface border border-border/80 rounded-xs shadow-2xs space-y-6">
                <h2 className="text-lg font-display font-normal rtl:leading-[1.45] text-near-black">
                  {t('contact.infoTitle')}
                </h2>

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

                {/* Social Links */}
                <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                  <span className="text-xs text-muted font-light">Maison Channels:</span>
                  <div className="flex items-center gap-2">
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
                        className="px-2.5 py-1 text-[11px] border border-border/80 text-near-black/80 hover:text-gold-dark hover:border-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors cursor-pointer rounded-xs"
                      >
                        {network.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Styled Map Placeholder (Architectural Blueprint Style) */}
              <div className="p-6 bg-near-black text-ivory border border-border/80 rounded-xs shadow-2xs relative overflow-hidden text-start">
                {/* Subtle blueprint grid overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, #C5A880 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
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
                  <div className="h-36 w-full border border-gold/25 bg-near-black/80 rounded-xs flex flex-col items-center justify-center relative overflow-hidden p-4 text-center">
                    {/* Concentric rings */}
                    <div className="w-24 h-24 rounded-full border border-gold/20 absolute animate-pulse motion-reduce:animate-none" />
                    <div className="w-16 h-16 rounded-full border border-gold/30 absolute" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_12px_#C5A880] relative z-10" />

                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <p className="text-[10px] font-mono text-gold-light tracking-wider rtl:tracking-normal">
                        {t('contact.mapPlaceholderCoords')}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-ivory/70 font-light leading-relaxed rtl:leading-loose">
                    {t('contact.mapPlaceholderNotice')}
                  </p>
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
