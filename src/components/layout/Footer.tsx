import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Award, Sparkles, Check, Loader2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Container } from '../ui/Container';
import { LocaleLink } from '../navigation/LocaleLink';

// Social media links - replace with real account links
export const SOCIAL_LINKS = {
  // Telegram: replace with real account link (e.g. https://t.me/maison_rayeha)
  telegram: 'https://t.me/yourchannel',
  // WhatsApp: replace with real account link & pre-filled greeting message (e.g. https://wa.me/989120000000)
  whatsapp: 'https://wa.me/989120000000?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%A8%D8%B1%D8%A7%DB%8C%20%D9%85%D8%B4%D8%A7%D9%88%D8%B1%D9%87%20%D8%B9%D8%B7%D8%B1%20%D9%BE%DB%8C%D8%A7%D9%85%20%D9%85%DB%8C%E2%80%8C%D8%AF%D9%87%D9%85',
  // Instagram: replace with real account link (e.g. https://instagram.com/maison_rayeha)
  instagram: 'https://instagram.com/yourhandle',
};

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.675.15-.2.301-.775.979-.95 1.18-.175.2-.35.225-.65.075-.301-.15-1.27-.468-2.42-1.494-.895-.798-1.5-1.783-1.675-2.083-.175-.3-.019-.462.131-.612.136-.135.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.628-.925-2.228-.243-.584-.49-.505-.675-.515-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.027-1.05 2.505s1.075 2.905 1.225 3.106c.15.2 2.116 3.23 5.127 4.53 3.012 1.3 3.012.868 3.562.812.55-.056 1.78-.727 2.03-1.43.25-.703.25-1.305.175-1.43-.075-.125-.275-.2-.575-.35zM12.04 2C6.545 2 2.08 6.465 2.08 11.96c0 1.96.57 3.79 1.56 5.334L2 22l4.85-1.58a9.92 9.92 0 005.19 1.46c5.495 0 9.96-4.465 9.96-9.96C22 6.465 17.535 2 12.04 2zm0 18.23c-1.62 0-3.13-.48-4.41-1.31l-.31-.2-3.26 1.06 1.06-3.18-.21-.33a8.16 8.16 0 01-1.24-4.31c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { isRTL, t, formatNumber } = useI18n();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setErrorMessage(t('footer.newsletterInvalidEmail'));
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail('');
    }, 600);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <footer className="bg-near-black text-ivory border-t border-gold/20 pt-16 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <Container size="lg">
        {/* Brand Promise Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-ivory/10 text-center sm:text-start">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-gold-light shrink-0">
              <Award className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-ivory">
                {t('footer.naturalExtractsTitle')}
              </h4>
              <p className="text-xs text-ivory/60 mt-0.5">
                {t('footer.naturalExtractsSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-gold-light shrink-0">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-ivory">
                {t('footer.packagingTitle')}
              </h4>
              <p className="text-xs text-ivory/60 mt-0.5">
                {t('footer.packagingSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-gold-light shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-ivory">
                {t('footer.courierTitle')}
              </h4>
              <p className="text-xs text-ivory/60 mt-0.5">
                {t('footer.courierSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 xl:gap-16 pb-14 border-b border-ivory/10">
          {/* Brand Intro & Newsletter */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-2xl tracking-[0.2em] font-light font-display uppercase text-ivory block">
                Maison Rayeha
              </span>
              <span className="text-xs tracking-[0.25em] rtl:tracking-normal text-gold-light uppercase block mt-1 font-medium">
                {t('footer.tagline')}
              </span>

              <p className="mt-4 text-xs text-ivory/70 leading-relaxed rtl:leading-loose max-w-sm font-light">
                {t('footer.brandDescription')}
              </p>

              {/* Social Media Channels */}
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider rtl:tracking-normal text-gold-light font-medium block mb-2.5">
                  {t('footer.socialTitle')}
                </span>
                <div className="flex items-center gap-2.5">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('footer.instagramLabel')}
                    className="w-9 h-9 rounded-full border border-ivory/20 hover:border-gold bg-near-black/60 hover:bg-gold/15 flex items-center justify-center text-ivory/80 hover:text-gold-light transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xs hover:shadow-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('footer.telegramLabel')}
                    className="w-9 h-9 rounded-full border border-ivory/20 hover:border-gold bg-near-black/60 hover:bg-gold/15 flex items-center justify-center text-ivory/80 hover:text-gold-light transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xs hover:shadow-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
                  >
                    <TelegramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('footer.whatsappLabel')}
                    className="w-9 h-9 rounded-full border border-ivory/20 hover:border-gold bg-near-black/60 hover:bg-gold/15 flex items-center justify-center text-ivory/80 hover:text-gold-light transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-2xs hover:shadow-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Mini subscription */}
            <div className="mt-6">
              <span className="text-xs uppercase tracking-wider rtl:tracking-normal text-gold-light font-medium block mb-2">
                {t('footer.newsletterTitle')}
              </span>
              {isSubscribed ? (
                <div className="p-4 bg-gold/10 border border-gold/40 rounded-[8px] text-start max-w-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-gold-light text-xs font-medium">
                    <Check className="w-4 h-4 stroke-[2] shrink-0" />
                    <span>{t('footer.newsletterSuccess')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubscribed(false)}
                    className="text-[11px] text-ivory/60 hover:text-gold-light underline mt-2 block cursor-pointer transition-colors"
                  >
                    {t('footer.newsletterRegisterAnother')}
                  </button>
                </div>
              ) : (
                <div className="max-w-sm">
                  <form onSubmit={handleSubmit} className="flex">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        placeholder={t('footer.newsletterPlaceholder')}
                        required
                        aria-label={t('footer.newsletterPlaceholder')}
                        className="w-full bg-near-black/80 border border-ivory/20 px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-ivory placeholder:text-ivory/40 focus:border-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-s-[8px]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      aria-label={t('footer.newsletterButton')}
                      className="bg-gold text-near-black px-4 min-h-[44px] min-w-[48px] hover:bg-gold-light transition-colors flex items-center justify-center cursor-pointer shrink-0 rounded-e-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-near-black" />
                      ) : (
                        <ArrowIcon className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </button>
                  </form>
                  {errorMessage && (
                    <p className="mt-1.5 text-xs text-rose-400 font-sans">
                      {errorMessage}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ivory/50">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-gold/70 shrink-0" />
                    <span>{t('footer.newsletterPrivacy')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold font-medium mb-4">
              {t('footer.navigation')}
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory/70 font-light">
              <li>
                <LocaleLink to="/" className="hover:text-gold transition-colors">
                  {t('nav.home')}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink to="/shop" className="hover:text-gold transition-colors">
                  {t('nav.shop')}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink to="/cart" className="hover:text-gold transition-colors">
                  {t('nav.cart')}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink to="/scent-families" className="hover:text-gold transition-colors">
                  {t('nav.scentFamilies')}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink to="/about" className="hover:text-gold transition-colors">
                  {t('nav.about')}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink to="/contact" className="hover:text-gold transition-colors">
                  {t('nav.contact')}
                </LocaleLink>
              </li>
            </ul>
          </div>

          {/* Client Care & Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold font-medium mb-4">
              {t('footer.customerCare')}
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory/70 font-light">
              <li>
                <span className="hover:text-gold transition-colors cursor-pointer">
                  {t('footer.consultation')}
                </span>
              </li>
              <li>
                <span className="hover:text-gold transition-colors cursor-pointer">
                  {t('footer.authenticity')}
                </span>
              </li>
              <li>
                <span className="hover:text-gold transition-colors cursor-pointer">
                  {t('footer.shipping')}
                </span>
              </li>
              <li>
                <span className="hover:text-gold transition-colors cursor-pointer">
                  {t('footer.faq')}
                </span>
              </li>
              <li>
                <span className="hover:text-gold transition-colors cursor-pointer">
                  {t('footer.privacy')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ivory/50">
          <p>{t('footer.copyright', { year: formatNumber(2026, { useGrouping: false }) })}</p>

          {/* Social Icons in Bottom Bar */}
          <div className="flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.instagramLabel')}
              className="w-7 h-7 rounded-full border border-ivory/20 hover:border-gold bg-near-black/60 hover:bg-gold/15 flex items-center justify-center text-ivory/70 hover:text-gold-light transition-all duration-200 transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.telegramLabel')}
              className="w-7 h-7 rounded-full border border-ivory/20 hover:border-gold bg-near-black/60 hover:bg-gold/15 flex items-center justify-center text-ivory/70 hover:text-gold-light transition-all duration-200 transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
            >
              <TelegramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.whatsappLabel')}
              className="w-7 h-7 rounded-full border border-ivory/20 hover:border-gold bg-near-black/60 hover:bg-gold/15 flex items-center justify-center text-ivory/70 hover:text-gold-light transition-all duration-200 transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-gold transition-colors cursor-pointer">
              {t('footer.privacy')}
            </span>
            <span>•</span>
            <span className="hover:text-gold transition-colors cursor-pointer">
              {t('footer.terms')}
            </span>
            <span>•</span>
            <span className="text-gold"><bdi dir="ltr">Maison Rayeha Haute Parfumerie</bdi></span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
