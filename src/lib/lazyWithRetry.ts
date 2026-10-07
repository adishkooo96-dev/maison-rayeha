import React from 'react';

/**
 * Enhanced lazy loader that recovers from stale chunks after deployments
 * and handles network drops when loading route components.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string = 'Component'
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error: any) {
      console.warn(`[Maison LazyLoader] Failed to load module for ${componentName}:`, error);

      const errorMessage = String(error?.message || error || '');
      const isChunkOrNetworkError =
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Importing a module script failed') ||
        errorMessage.includes('error loading dynamically imported module') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        error?.name === 'ChunkLoadError';

      if (typeof window !== 'undefined' && isChunkOrNetworkError) {
        const lastAttemptKey = `maison_retry_${componentName}`;
        const lastAttempt = Number(sessionStorage.getItem(lastAttemptKey) || 0);
        const now = Date.now();

        // If not attempted in the last 15 seconds, clear stale cache and reload page once
        if (now - lastAttempt > 15000) {
          sessionStorage.setItem(lastAttemptKey, String(now));

          // Invalidate caches to eliminate stale chunks
          if ('caches' in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k)));
            } catch (cacheErr) {
              console.warn('[Maison LazyLoader] Cache clearing error:', cacheErr);
            }
          }

          console.info(`[Maison LazyLoader] Reloading page to fetch updated asset for ${componentName}...`);
          window.location.reload();
          // Return an unresolved promise while the page reloads to prevent error flash
          return new Promise<{ default: T }>(() => {});
        }
      }

      // If already retried or permanent network drop, rethrow a clean network error
      const enhancedError = new Error(
        `خطا در بارگذاری مؤلفه به دلیل قطعی شبکه یا انقضای نسخه برنامه: ${errorMessage}`
      );
      (enhancedError as any).isNetworkError = true;
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  });
}
