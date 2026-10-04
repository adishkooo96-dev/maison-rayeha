import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Sparkles } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from '../search/SearchOverlay';
import { LocaleLink, LocaleNavLink } from '../navigation/LocaleLink';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';
import { ThemeToggle } from '../navigation/ThemeToggle';
import { HeaderAccountButton } from './HeaderAccountButton';

export const Header: React.FC = () => {
  const { lang, t, changeLanguage, formatNumber } = useI18n();
  const location = useLocation();
  const { openCart, getTotalCount } = useCartStore();
  const { user, isAdmin } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Is current page home page?
  const isHomePage = location.pathname === `/${lang}` || location.pathname === `/${lang}/` || location.pathname === '/';

  const totalCartCount = getTotalCount();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home'), exact: true },
    { to: '/shop', label: t('nav.shop') },
    { to: '/scent-families', label: t('nav.scentFamilies') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  // Header style based on scroll and home page state
  const isTransparent = isHomePage && !isScrolled;

  const headerClass = isTransparent
    ? 'bg-gradient-to-b from-near-black/75 via-near-black/45 to-transparent text-ivory border-b border-ivory/10'
    : 'bg-ivory-surface/95 backdrop-blur-md text-near-black border-b border-border/80 shadow-[0_4px_24px_-4px_rgba(14,14,14,0.07)]';

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${headerClass}`}
      >
        {/* Top mini announcement bar */}
        <div
          className={`py-1.5 px-4 text-center text-[11px] tracking-widest rtl:tracking-normal uppercase transition-colors border-b ${
            isTransparent
              ? 'bg-near-black/50 text-ivory/90 border-ivory/10'
              : 'bg-near-black text-ivory border-near-black'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-gold stroke-[1.5]" aria-hidden="true" />
            <span>{t('common.freeShipping')}</span>
            <span className="hidden sm:inline text-gold">|</span>
            <span className="hidden sm:inline">{t('common.luxuryPackaging')}</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t('common.menu')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                isTransparent ? 'text-ivory hover:text-gold' : 'text-near-black hover:text-gold'
              }`}
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <LocaleLink
              to="/"
              className="flex flex-col items-center group text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-xs px-1"
            >
              <span
                className={`text-base xs:text-lg sm:text-2xl md:text-3xl tracking-[0.12em] sm:tracking-[0.18em] uppercase font-light font-display transition-colors truncate max-w-[150px] xs:max-w-none ${
                  isTransparent ? 'text-ivory group-hover:text-gold' : 'text-near-black group-hover:text-gold'
                }`}
              >
                Maison Rayeha
              </span>
              <span
                className={`text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] rtl:tracking-normal uppercase font-medium transition-colors ${
                  isTransparent ? 'text-gold-light' : 'text-gold-dark'
                }`}
              >
                {t('common.hauteParfumerie')}
              </span>
            </LocaleLink>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <LocaleNavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `text-xs tracking-widest rtl:tracking-normal uppercase transition-all duration-200 py-1 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs ${
                    isActive
                      ? isTransparent
                        ? 'text-gold font-medium'
                        : 'text-gold-dark font-medium'
                      : isTransparent
                      ? 'text-ivory/90 hover:text-gold font-light'
                      : 'text-near-black/90 hover:text-gold-dark font-light'
                  }`
                }
              >
                {link.label}
              </LocaleNavLink>
            ))}
          </nav>

          {/* Right Action Icons & Language Switcher */}
          <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3.5 shrink-0">
            {/* Theme Toggle (Dark/Light mode) */}
            <ThemeToggle isTransparent={isTransparent} />

            {/* Language Switcher (Shows target language: "EN" while on fa, "FA" while on en) */}
            <LanguageSwitcher isTransparent={isTransparent} />

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('nav.search')}
              className={`min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0 ${
                isTransparent ? 'text-ivory hover:text-gold' : 'text-near-black hover:text-gold-dark'
              }`}
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Circular Account Avatar / Sign In Button */}
            <HeaderAccountButton isTransparent={isTransparent} />

            {/* Cart Icon with badge positioned at top end corner */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`${t('nav.cart')} (${formatNumber(totalCartCount, { useGrouping: false })})`}
              className={`min-h-[44px] min-w-[36px] sm:min-w-[44px] transition-colors rounded-xs relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0 ${
                isTransparent ? 'text-ivory hover:text-gold' : 'text-near-black hover:text-gold-dark'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {totalCartCount > 0 && (
                  <span
                    className={`absolute -top-2 -end-2.5 min-w-4 h-4 px-1 bg-gold text-near-black text-[10px] font-bold rounded-full flex items-center justify-center font-mono ring-2 transition-colors ${
                      isTransparent ? 'ring-near-black' : 'ring-ivory-surface'
                    }`}
                  >
                    {formatNumber(totalCartCount, { useGrouping: false })}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Working Search Overlay with autofocus, live results, and keyboard support */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
