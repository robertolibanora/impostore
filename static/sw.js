const CACHE_NAME = 'impostore-moderati-v2';
const urlsToCache = [
  '/',
  '/setup',
  '/players',
  '/game',
  '/static/css/common.css',
  '/static/js/common.js',
  '/static/icon.svg',
  '/static/manifest.json',
  '/api/players/colors',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&display=swap'
];

// Installazione del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve dalla cache quando offline
self.addEventListener('fetch', (event) => {
  // Non cacheare le richieste API (devono sempre essere fresh)
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - ritorna la risposta
        if (response) {
          return response;
        }
        
        // Clone della richiesta
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Controlla se abbiamo ricevuto una risposta valida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Non cacheare le richieste API
          if (event.request.url.includes('/api/')) {
            return response;
          }
          
          // Clone della risposta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Se la fetch fallisce, prova a servire dalla cache
          return caches.match(event.request);
        });
      })
  );
});

// Activate event - pulizia delle vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Rimozione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
