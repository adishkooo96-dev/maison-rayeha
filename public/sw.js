// Maison Rayeha - Luxury Haute Parfumerie Service Worker
const CACHE_NAME = 'maison-rayeha-v1.2.0';

// Only pre-cache static core assets, NEVER cache hashed javascript chunks indefinitely
const PRECACHE_ASSETS = [
  '/',
  '/favicon.svg',
  '/site.webmanifest',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching completed with non-blocking error:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Bypass non-GET requests and external APIs (Firebase, Google, etc.)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Never cache API calls, dev sockets, or hot-reload assets
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('firestore') ||
    url.pathname.includes('googleapis')
  ) {
    return;
  }

  // Network-First for navigation requests (HTML) to always get the latest bundle references
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/');
        })
    );
    return;
  }

  // Network-First with cache fallback for dynamic JS/CSS chunks to prevent stale chunk 404 lockouts
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.startsWith('/src/')
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-While-Revalidate for images, icons, and static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
