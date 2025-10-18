// v5: Se elimina la imagen de fondo que daba 404.

const CACHE_NAME = 'kebuenaqro-cache-v5'; // <-- Versión 5

// Archivos locales (el "cascarón" de la app)
const urlsToCache = [
  './', // index.html
  './manifest.json',
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6',
  'https://fantasma-beep.github.io/kebuenaqro/logo.png?v=4',
  'https://fantasma-beep.github.io/kebuenaqro/logotipo5.png?v=7'
  // SE ELIMINÓ LA IMAGEN ROTA (404) DE ESTA LISTA
];

// Evento 'install': Guarda los archivos uno por uno
self.addEventListener('install', event => {
  console.log('SW: Instalando v5...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('SW: Cacheando app shell (uno por uno)...');
      for (const url of urlsToCache) {
        try {
          // Intenta descargar y guardar el archivo
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
    }).then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

// Evento 'activate': Limpia los cachés viejos (v1, v2, v3, v4)
self.addEventListener('activate', event => {
  console.log('SW: Activado v5');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // <-- Compara con v5
            console.log('SW: Borrando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Evento 'fetch': Decide cómo responder a cada petición
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 1. Para streams, tailwind, o favicons: SIEMPRE ir a la red.
  if (url.includes('laradiossl.online') || url.includes('cdn.tailwindcss.com') || url.includes('favicon.ico')) {
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
