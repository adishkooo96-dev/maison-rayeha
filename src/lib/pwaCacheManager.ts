import { reconnectFirebase } from './firebase';

const CURRENT_CACHE_VERSION = 'maison-v1.2.0';
const CACHE_VERSION_KEY = 'maison_app_cache_version';

/**
 * Initializes PWA and cache recovery mechanisms to prevent stale cached assets
 * from locking the page after hours of idling or upon returning.
 */
export function initPwaCacheManager() {
  if (typeof window === 'undefined') return;

  // 1. Version check and obsolete cache eviction
  try {
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (storedVersion && storedVersion !== CURRENT_CACHE_VERSION) {
      console.info(`[PWA] New version detected (${CURRENT_CACHE_VERSION} vs ${storedVersion}). Purging obsolete caches...`);
      clearAllCaches().then(() => {
        localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      });
    } else if (!storedVersion) {
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    }
  } catch {
    // LocalStorage restricted or private mode
  }

  // 2. Handle back-forward cache (bfcache) restore
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.info('[PWA] Page restored from bfcache; revalidating connection and session...');
      reconnectFirebase(true);
    }
  });

  // 3. Register Service Worker with active update polling
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.info('[PWA] ServiceWorker registered successfully:', registration.scope);

          // Check for worker updates whenever tab regains visibility
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              registration.update().catch((err) => {
                console.debug('[PWA] Service worker update check deferred:', err);
              });
            }
          });

          // Check if waiting worker exists
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.info('[PWA] New content is available; will activate on next navigation.');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.debug('[PWA] ServiceWorker registration deferred:', err);
        });

      // Reload smoothly when new controller takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.info('[PWA] Controller changed, updating window...');
          window.location.reload();
        }
      });
    });
  }
}

/**
 * Force purge all caches stored in CacheStorage
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    console.info('[PWA] All CacheStorage items successfully cleared.');
  } catch (err) {
    console.warn('[PWA] Error purging CacheStorage:', err);
  }
}

/**
 * Hard reload the application while bypassing cache
 */
export async function forceReloadApplication(): Promise<void> {
  await clearAllCaches();
  if (typeof window !== 'undefined') {
    // Add cache buster query parameter
    const url = new URL(window.location.href);
    url.searchParams.set('_ts', String(Date.now()));
    window.location.href = url.toString();
  }
}
