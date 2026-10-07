import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, User, Shield, LogOut } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useAuth } from '../../context/AuthContext';
import { LocaleNavLink, LocaleLink } from '../navigation/LocaleLink';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { lang, isRTL, t } = useI18n();
  const { user, profile, isAdmin, logout } = useAuth();
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Store previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      // Focus close button on next tick
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { to: '/', label: t('nav.home'), exact: true },
    { to: '/shop', label: t('nav.shop') },
    { to: '/cart', label: t('nav.cart') },
    { to: '/scent-families', label: t('nav.scentFamilies') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  // In RTL (fa), the start edge is on the right, so offscreen is +100%.
  // In LTR (en), the start edge is on the left, so offscreen is -100%.
  const slideDirection = isRTL ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('common.menu')}
          className="fixed inset-0 z-50 overflow-hidden lg:hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-near-black/50 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel sliding strictly from logical 'start' side */}
          <div className="fixed inset-y-0 start-0 flex max-w-full z-10 pointer-events-none">
            <motion.div
              initial={{ x: slideDirection }}
              animate={{ x: 0 }}
              exit={{ x: slideDirection }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-[85vw] max-w-xs sm:max-w-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border-e border-[var(--border)] shadow-2xl flex flex-col justify-between pointer-events-auto h-full"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex flex-col text-start">
                  <span className="text-base font-medium tracking-widest text-[var(--text-primary)] uppercase font-display">
                    Maison Rayeha
                  </span>
                  <span className="text-[10px] text-gold tracking-wider uppercase font-medium">
                    {t('common.hauteParfumerie')}
                  </span>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={t('common.close')}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-6 text-start">
                <nav className="flex flex-col">
                  {navLinks.map((link) => (
                    <LocaleNavLink
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      end={link.exact}
                      className={({ isActive }) =>
                        `min-h-[44px] py-2.5 px-3 text-base transition-colors border-b border-[var(--border)]/40 font-light flex items-center justify-between rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                          isActive
                            ? 'text-gold font-medium border-gold/40'
                            : 'text-[var(--text-primary)] hover:text-gold'
                        }`
                      }
                    >
                      <span>{link.label}</span>
                      <span className="text-xs text-gold">✦</span>
                    </LocaleNavLink>
                  ))}
                </nav>

                {/* Account / Authentication Section */}
                <div className="mt-6 pt-5 border-t border-[var(--border)]">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gold text-[#111111] flex items-center justify-center font-display font-medium text-xs overflow-hidden shrink-0 ring-1 ring-gold-dark/20 shadow-2xs">
                            {user?.photoURL || profile?.photoURL ? (
                              <img
                                src={user?.photoURL || profile?.photoURL}
                                alt={profile?.name || 'User'}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span>{(profile?.name || user.displayName || user.email || 'U').trim().charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex flex-col text-start">
                            <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[140px]">
                              {profile?.name || user.displayName || user.email?.split('@')[0]}
                            </span>
                            {isAdmin && (
                              <span className="text-[10px] text-gold font-medium flex items-center gap-0.5">
                                <Shield className="w-2.5 h-2.5" />
                                <span>{lang === 'fa' ? 'مدیر آتلیه' : 'Admin'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            onClose();
                          }}
                          className="text-[11px] text-[var(--text-secondary)] hover:text-rose-500 flex items-center gap-1 cursor-pointer py-1 px-1.5 rounded-xs"
                        >
                          <LogOut className="w-3 h-3 stroke-[1.5]" />
                          <span>{lang === 'fa' ? 'خروج' : 'Sign out'}</span>
                        </button>
                      </div>

                      <LocaleLink
                        to="/account"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 text-xs font-medium bg-[var(--bg-surface-raised)] border border-[var(--border)] hover:border-gold rounded-xs text-[var(--text-primary)]"
                      >
                        <User className="w-3.5 h-3.5 stroke-[1.5] text-gold" />
                        <span>{lang === 'fa' ? 'ورود به حساب کاربری' : 'My Account & Orders'}</span>
                      </LocaleLink>

                      {isAdmin && (
                        <LocaleLink
                          to="/admin"
                          onClick={onClose}
                          className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 text-xs font-medium bg-gold text-[#111111] hover:bg-gold-light rounded-xs font-bold"
                        >
                          <Shield className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>{lang === 'fa' ? 'پنل مدیریت آتلیه (Admin)' : 'Admin Dashboard'}</span>
                        </LocaleLink>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <LocaleLink
                        to="/login"
                        onClick={onClose}
                        className="min-h-[44px] flex items-center justify-center py-2 px-3 text-xs font-medium bg-[var(--bg-surface-raised)] border border-[var(--border)] hover:border-gold text-[var(--text-primary)] text-center rounded-xs"
                      >
                        {lang === 'fa' ? 'ورود به حساب' : 'Sign In'}
                      </LocaleLink>
                      <LocaleLink
                        to="/register"
                        onClick={onClose}
                        className="min-h-[44px] flex items-center justify-center py-2 px-3 text-xs font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border border-[var(--btn-primary-bg)] text-center rounded-xs hover:bg-[var(--btn-primary-hover-bg)] transition-colors shadow-xs"
                      >
                        {lang === 'fa' ? 'ثبت‌نام' : 'Register'}
                      </LocaleLink>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer note with safe area bottom inset */}
              <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border bg-ivory-subtle text-center text-[11px] text-muted">
                {t('common.freeShipping')}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
