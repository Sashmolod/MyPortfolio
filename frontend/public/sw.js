// Service Worker — PWA support (only active in production builds)
// Version: bump this string to force cache invalidation on all clients
const CACHE_VERSION = 'v2';
const CACHE_NAME = `sketchbook-portfolio-${CACHE_VERSION}`;

// Only pre-cache truly static assets (no JS chunks — they have content hashes)
const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
];

// Install — pre-cache minimal assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — delete ALL caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch — strategy depends on request type
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET and API requests entirely (no caching)
  if (event.request.method !== 'GET' || requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  // Skip JS/CSS module chunks — they have content hashes, always fresh from network
  // Caching these causes stale React instances on hot reload
  if (
    requestUrl.pathname.includes('/assets/') ||
    requestUrl.pathname.includes('/node_modules/') ||
    requestUrl.pathname.includes('.vite')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML navigation — Network First (always try fresh, fall back to cache offline)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Static assets (images, fonts, manifests) — Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
