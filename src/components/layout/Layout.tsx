import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { CookieConsent } from '../common/CookieConsent';
import { ChatWidget } from '../chat/ChatWidget';
import { useI18n } from '../../hooks/useI18n';
import { Language } from '../../types';
import { subscribeToProducts } from '../../lib/productsApi';
import { useCartStore } from '../../store/cartStore';

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { lang: urlParamLang } = useParams<{ lang?: string }>();
  const location = useLocation();
  const { lang: i18nLang, changeLanguage } = useI18n();

  // Sync products in real-time with cart store so out-of-stock items immediately reflect
  useEffect(() => {
    const unsub = subscribeToProducts((products) => {
      useCartStore.getState().syncProducts(products);
    });
    return () => unsub();
  }, []);

  // URL :lang param is the single source of truth
  const activeUrlLang: Language =
    urlParamLang === 'en' || urlParamLang === 'fa'
      ? urlParamLang
      : location.pathname.split('/').filter(Boolean)[0] === 'en'
      ? 'en'
      : 'fa';

  // Single effect in root layout that sets html lang and dir from the :lang route param
  useEffect(() => {
    // Sync HTML root attributes
    document.documentElement.lang = activeUrlLang;
    document.documentElement.dir = activeUrlLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-lang', activeUrlLang);

    // Sync preference storage
    try {
      localStorage.setItem('maison_rayeha_lang', activeUrlLang);
    } catch {
      // storage unavailable
    }
  }, [activeUrlLang]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-near-black selection:bg-gold/20 selection:text-near-black relative">
      {/* Accessible Skip to Content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-near-black focus:text-gold focus:border focus:border-gold focus:shadow-xl focus:outline-none text-xs uppercase tracking-widest font-medium"
      >
        {activeUrlLang === 'fa' ? 'پرش به محتوای اصلی' : 'Skip to main content'}
      </a>

      <Header />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <CookieConsent />
      <ChatWidget />
    </div>
  );
};

