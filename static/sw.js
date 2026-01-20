const CACHE_NAME = 'impostore-moderati-v3';

// ⚠️ SOLO FILE STATICI, NIENTE ROUTE FLASK
const STATIC_ASSETS = [
  '/static/css/common.css',
  '/static/js/common.js',
  '/static/icon.svg',
  '/static/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&display=swap'
];

/* =========================
   INSTALL
========================= */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // ❌ NON toccare navigazioni (Safari-safe)
  if (req.mode === 'navigate') {
    return;
  }

  // ❌ NON toccare API
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // ❌ NON toccare route Flask
  if (
    url.pathname === '/' ||
    url.pathname === '/setup' ||
    url.pathname === '/players' ||
    url.pathname === '/game'
  ) {
    return;
  }

  // ✅ SOLO static assets
  if (url.pathname.startsWith('/static') || url.origin !== location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;

        return fetch(req).then(response => {
          if (!response || response.status !== 200) {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone);
          });

          return response;
        });
      })
    );
  }
});