// v4: Un service worker más robusto que no falla si falta un archivo.

const CACHE_NAME = 'kebuenaqro-cache-v4';

// Archivos locales (el "cascarón" de la app)
const urlsToCache = [
  './', // index.html
  './manifest.json',
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6',
  'https://fantasma-beep.github.io/kebuenaqro/logo.png?v=4',
  'https://fantasma-beep.github.io/kebuenaqro/logotipo5.png?v=7',
  'https://fantasma-beep.github.io/kebuenaqro/494615713_1348055410294820_9029691649736311255_n.jpg'
];

// Evento 'install': Guarda los archivos uno por uno
self.addEventListener('install', event => {
  console.log('SW: Instalando v4 (más seguro)...');
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
            // Si el archivo no existe (404), solo avisa en la consola
            console.warn(`SW: Falló al cachear ${url} - Status: ${response.status}`);
          }
        } catch (err) {
          // Si hay un error de red, solo avisa y continúa
          console.error(`SW: Error de fetch al cachear ${url}:`, err);
        }
      }
    }).then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

// Evento 'activate': Limpia los cachés viejos (v1, v2, v3)
self.addEventListener('activate', event => {
  console.log('SW: Activado v4');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
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
