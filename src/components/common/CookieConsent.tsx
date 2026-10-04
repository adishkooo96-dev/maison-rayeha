import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { LocaleLink } from '../navigation/LocaleLink';

const CONSENT_STORAGE_KEY = 'maison_rayeha_cookie_consent';

export const CookieConsent: React.FC = () => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!consent) {
        // Delay slightly for smooth page entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage disabled or restricted
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    } catch {
      // storage unavailable
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'declined');
    } catch {
      // storage unavailable
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:end-6 z-50 max-w-lg"
        >
          <div className="bg-near-black text-ivory border border-gold/40 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5 text-gold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-widest font-medium">
                  {t('cookie.title')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDecline}
                aria-label={t('common.close')}
                className="text-ivory/60 hover:text-gold transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-ivory/80 font-light leading-relaxed">
              {t('cookie.description')}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <LocaleLink
                to="/about"
                className="text-[11px] text-gold/80 hover:text-gold underline underline-offset-4 transition-colors font-light"
              >
                {t('cookie.learnMore')}
              </LocaleLink>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecline}
                  className="px-3.5 py-1.5 border border-ivory/20 hover:border-ivory/40 text-ivory/70 hover:text-ivory text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                >
                  {t('cookie.decline')}
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-4 py-1.5 bg-gold text-near-black hover:bg-gold-light text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer shadow-xs"
                >
                  {t('cookie.accept')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
