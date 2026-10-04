import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';

export interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  userName,
}) => {
  const { lang, isRTL } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Store previous active element and handle Escape key + Tab trapping
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Focus the continue button initially for smooth keyboard flow
    const focusTimer = setTimeout(() => {
      const btn = document.getElementById('welcome-continue-btn');
      if (btn) {
        btn.focus();
      } else {
        closeButtonRef.current?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll behind modal
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore previous focus
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      aria-describedby="welcome-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity motion-reduce:transition-none duration-200"
      onClick={(e) => {
        // Dismiss if clicking outside the modal content card
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-ivory-surface text-near-black border border-gold/40 rounded-xs shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 motion-reduce:animate-none duration-200"
      >
        {/* Close (×) Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={lang === 'fa' ? 'بستن پیام خوش‌آمدگویی' : 'Close welcome modal'}
          className="absolute top-3.5 end-3.5 p-2 rounded-xs text-muted hover:text-near-black hover:bg-gold/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Decorative Top Accent: Maison Rayeha Monogram / Diamond */}
        <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold/50 to-gold" />
          <div className="w-3.5 h-3.5 rotate-45 border border-gold bg-ivory flex items-center justify-center shadow-[0_0_8px_rgba(184,155,94,0.35)]">
            <div className="w-1 h-1 bg-gold-dark rotate-45" />
          </div>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-gold/50 to-gold" />
        </div>

        {/* Brand Kicker */}
        <span className="text-[11px] uppercase tracking-[0.25em] rtl:tracking-normal text-gold-dark font-medium block mb-2">
          Maison Rayeha • Haute Parfumerie
        </span>

        {/* Greeting Title */}
        <h2
          id="welcome-modal-title"
          className="text-2xl sm:text-3xl font-display font-light text-near-black mb-3 leading-snug"
        >
          {lang === 'fa' ? (
            <>
              خوش آمدید، <span className="font-normal text-gold-dark">{userName}</span>
            </>
          ) : (
            <>
              Welcome, <span className="font-normal text-gold-dark">{userName}</span>
            </>
          )}
        </h2>

        {/* Warm Message */}
        <p
          id="welcome-modal-desc"
          className="text-xs sm:text-sm text-muted font-light leading-relaxed mb-6 max-w-xs mx-auto"
        >
          {lang === 'fa'
            ? 'به دنیای رایحه‌های نیش میسون رایحه خوش آمدید. مجموعه‌ای از شاهکارهای بویایی در انتظار شماست.'
            : 'Glad to have you back. Your bespoke sanctuary of fine fragrances awaits.'}
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            id="welcome-continue-btn"
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full justify-center min-h-[44px]"
            rightIcon={<Sparkles className="w-4 h-4 stroke-[1.5] text-gold-light" />}
          >
            {lang === 'fa' ? 'ورود به دنیای عطرها' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
