import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically scrolls window to top on route / pathname change.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate or smooth scroll to top on navigation
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant', // Instant prevents layout jarring during page transitions
      });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};
