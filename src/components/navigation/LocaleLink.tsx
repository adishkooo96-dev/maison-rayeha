import React, { useCallback } from 'react';
import {
  Link,
  NavLink,
  useNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';

/**
 * Hook to convert any path (e.g. '/shop', '/', or 'about') into a localized path
 * with the active language prefix ('/fa/shop', '/fa', '/en/about').
 */
export function useLocalizedPath() {
  const { lang } = useI18n();

  return useCallback(
    (to: To): To => {
      if (typeof to === 'string') {
        // Skip external protocols, telephone, mailto, or fragment hashes
        if (
          !to ||
          to.startsWith('http://') ||
          to.startsWith('https://') ||
          to.startsWith('mailto:') ||
          to.startsWith('tel:') ||
          to.startsWith('#')
        ) {
          return to;
        }

        const cleanPath = to.startsWith('/') ? to : `/${to}`;

        // Check if path already starts with /fa or /en
        if (
          cleanPath === '/fa' ||
          cleanPath.startsWith('/fa/') ||
          cleanPath.startsWith('/fa?') ||
          cleanPath === '/en' ||
          cleanPath.startsWith('/en/') ||
          cleanPath.startsWith('/en?')
        ) {
          return cleanPath;
        }

        // Root path becomes active language root
        if (cleanPath === '/') {
          return `/${lang}`;
        }

        return `/${lang}${cleanPath}`;
      }

      if (typeof to === 'object' && to !== null) {
        const pathname = to.pathname || '/';
        const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

        let localizedPathname = cleanPath;
        if (
          cleanPath !== '/fa' &&
          !cleanPath.startsWith('/fa/') &&
          cleanPath !== '/en' &&
          !cleanPath.startsWith('/en/')
        ) {
          localizedPathname = cleanPath === '/' ? `/${lang}` : `/${lang}${cleanPath}`;
        }

        return {
          ...to,
          pathname: localizedPathname,
        };
      }

      return to;
    },
    [lang]
  );
}

/**
 * Hook providing a navigate function that automatically prepends the active locale
 */
export function useLocaleNavigate() {
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedPath();

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }
      navigate(getLocalizedPath(to), options);
    },
    [navigate, getLocalizedPath]
  );
}

export interface LocaleLinkProps extends LinkProps {}

/**
 * Locale-aware Link component wrapping react-router-dom Link.
 * Guarantees that internal links always preserve the active /fa or /en prefix.
 */
export const LocaleLink = React.forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  ({ to, children, ...props }, ref) => {
    const getLocalizedPath = useLocalizedPath();
    const localizedTo = getLocalizedPath(to);

    return (
      <Link ref={ref} to={localizedTo} {...props}>
        {children}
      </Link>
    );
  }
);
LocaleLink.displayName = 'LocaleLink';

export interface LocaleNavLinkProps extends NavLinkProps {}

/**
 * Locale-aware NavLink component wrapping react-router-dom NavLink.
 * Guarantees that internal links always preserve the active /fa or /en prefix.
 */
export const LocaleNavLink = React.forwardRef<HTMLAnchorElement, LocaleNavLinkProps>(
  ({ to, children, ...props }, ref) => {
    const getLocalizedPath = useLocalizedPath();
    const localizedTo = getLocalizedPath(to);

    return (
      <NavLink ref={ref} to={localizedTo} {...props}>
        {children}
      </NavLink>
    );
  }
);
LocaleNavLink.displayName = 'LocaleNavLink';
