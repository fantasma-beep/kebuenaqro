// v9: Actualización de caché para el nuevo manifest v9.
const CACHE_NAME = 'kebuenaqro-cache-v9'; // <-- Versión 9

// Archivos locales (el "cascarón" de la app)
const urlsToCache = [
  './', // index.html
  './manifest.json', // El nuevo manifest v9
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6',
  'https://fantasma-beep.github.io/kebuenaqro/logo.png?v=4',
  'https://fantasma-beep.github.io/kebuenaqro/logotipo5.png?v=7'
];

// Evento 'install': Guarda los archivos uno por uno
self.addEventListener('install', event => {
  console.log('SW: Instalando v9...');
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

// Evento 'activate': Limpia los cachés viejos (v1-v8)
self.addEventListener('activate', event => {
  console.log('SW: Activado v9');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // <-- Compara con v9
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

  // 1. Para streams o tailwind: SIEMPRE ir a la red.
  if (url.includes('laradiossl.online') || url.includes('cdn.tailwindcss.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 2. Para todo lo demás (tus archivos locales):
  // Intenta buscar en el caché primero. Si no está, ve a la red.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
