import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nProvider } from './lib/i18n';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SuspenseFallback } from './components/common/SuspenseFallback';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Language } from './types';

// Code-split / lazy-loaded routes for performance
const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const Shop = React.lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const CartPage = React.lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const PlaceholderPage = React.lazy(() => import('./pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

export function getStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem('maison_rayeha_lang');
    if (saved === 'en' || saved === 'fa') return saved;
  } catch {
    // fallback
  }
  return 'fa';
}

/**
 * Handles root and missing/unknown prefix redirects preserving pathname and search.
 * Ensures we NEVER redirect to the current URL (which causes an infinite loop).
 */
const LocalizedRedirect: React.FC = () => {
  const location = useLocation();
  const targetLang = getStoredLanguage();

  // Normalize path by stripping leading/trailing slashes
  const cleanPath = location.pathname.replace(/^\/+|\/+$/g, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // If first segment is already a valid language, DO NOT redirect to location.pathname!
  // Instead, if it has a trailing slash, redirect to clean path; otherwise show NotFoundPage.
  if (firstSegment === 'fa' || firstSegment === 'en') {
    const normalized = `/${cleanPath}`;
    if (normalized !== location.pathname) {
      return <Navigate to={`${normalized}${location.search}${location.hash}`} replace />;
    }
    return (
      <Layout key={firstSegment}>
        <NotFoundPage />
      </Layout>
    );
  }

  // Check if first segment is a 2-letter language-like code other than fa/en (e.g. /fr/shop)
  if (firstSegment && firstSegment.length === 2) {
    segments[0] = targetLang;
    const targetPath = '/' + segments.join('/');
    return <Navigate to={`${targetPath}${location.search}${location.hash}`} replace />;
  }

  // Missing prefix entirely (e.g. /, /shop, /about)
  const targetPath = cleanPath ? `/${targetLang}/${cleanPath}` : `/${targetLang}`;
  const fullTarget = `${targetPath}${location.search}${location.hash}`;
  
  // Guard against redirecting to the exact same URL
  if (fullTarget === `${location.pathname}${location.search}${location.hash}`) {
    return (
      <Layout key={targetLang}>
        <NotFoundPage />
      </Layout>
    );
  }

  return <Navigate to={fullTarget} replace />;
};

// Validates language param; if invalid, redirects to valid language preserving path
const LanguageRouteWrapper: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();

  if (lang !== 'fa' && lang !== 'en') {
    const fallbackLang = getStoredLanguage();
    const cleanPath = location.pathname.replace(/^\/+|\/+$/g, '');
    const targetPath = cleanPath ? `/${fallbackLang}/${cleanPath}` : `/${fallbackLang}`;
    const fullTarget = `${targetPath}${location.search}${location.hash}`;
    if (fullTarget === `${location.pathname}${location.search}${location.hash}`) {
      return (
        <Layout key={fallbackLang}>
          <NotFoundPage />
        </Layout>
      );
    }
    return <Navigate to={fullTarget} replace />;
  }

  return (
    <Layout key={lang}>
      <ErrorBoundary>
        <React.Suspense fallback={<SuspenseFallback />}>
          <Outlet />
        </React.Suspense>
      </ErrorBoundary>
    </Layout>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ToastProvider>
                <Routes>
                {/* Language-prefixed routes */}
                <Route path="/:lang" element={<LanguageRouteWrapper />}>
                  <Route index element={<HomePage />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="shop/:slug" element={<ProductDetail />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="collections" element={<Navigate to="../shop" replace />} />
                  <Route path="scent-families" element={<PlaceholderPage pageKey="scentFamilies" />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="404" element={<NotFoundPage />} />
                  {/* Fallback for unknown sub-paths within valid language */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Root and unknown/missing prefix routes */}
                <Route path="*" element={<LocalizedRedirect />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>
  );
}

