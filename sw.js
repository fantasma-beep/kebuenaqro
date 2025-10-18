// v7: Actualización de caché para el nuevo manifest v7.
const CACHE_NAME = 'kebuenaqro-cache-v7'; // <-- Versión 7

// Archivos locales (el "cascarón" de la app)
const urlsToCache = [
  './', // index.html
  './manifest.json', // El nuevo manifest v7
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6',
  'https://fantasma-beep.github.io/kebuenaqro/logo.png?v=4',
  'https://fantasma-beep.github.io/kebuenaqro/logotipo5.png?v=7'
];

// Evento 'install': Guarda los archivos uno por uno
self.addEventListener('install', event => {
  console.log('SW: Instalando v7...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('SW: Cacheando app shell (uno por uno)...');
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          } else {
            console.warn(`SW: Falló al cachear ${url} - Status: ${response.status}`);
          }
        } catch (err) {
          console.error(`SW: Error de fetch al cachear ${url}:`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Evento 'activate': Limpia los cachés viejos (v1-v6)
self.addEventListener('activate', event => {
  console.log('SW: Activado v7');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // <-- Compara con v7
            console.log('SW: Borrando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Evento 'fetch':
self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('laradiossl.online') || url.includes('cdn.tailwindcss.com') || url.includes('favicon.ico')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
