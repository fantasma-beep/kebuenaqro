// Nombre del caché
const CACHE_NAME = 'kebuenaqro-cache-v1';

// Archivos principales que componen la "carcasa" de la app
const urlsToCache = [
  './', // La página principal (index.html)
  './manifest.json?v=7', // El manifest
  'https://cdn.tailwindcss.com',
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6',
  'https://fantasma-beep.github.io/kebuenaqro/logotipo5.png?v=7',
  'https://fantasma-beep.github.io/kebuenaqro/logo.png?v=4',
  'https://fantasma-beep.github.io/kebuenaqro/494615713_1348055410294820_9029691649736311255_n.jpg'
  // NOTA: Puedes añadir más banners y assets aquí si quieres que funcionen offline
];

// Evento 'install': Se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', event => {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Abriendo caché y guardando app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forzar la activación inmediata
  );
});

// Evento 'activate': Se dispara cuando el SW se activa (toma control).
// Se usa para limpiar cachés viejos.
self.addEventListener('activate', event => {
  console.log('SW: Activado');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Si este caché no está en nuestra "lista blanca", lo borramos
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Tomar control inmediato de las páginas
  );
});

// Evento 'fetch': Se dispara cada vez que la página pide un recurso (CSS, JS, imagen, etc.)
// Estrategia: "Cache first" (primero busca en caché, si no, va a la red)
self.addEventListener('fetch', event => {
  // No cachear los streams de radio
  if (event.request.url.includes('laradiossl.online')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si lo encontramos en caché, lo devolvemos
        if (response) {
          return response;
        }
        // Si no, vamos a la red a buscarlo
        return fetch(event.request).then(
          (networkResponse) => {
            // Opcional: podríamos cachear la respuesta si quisiéramos
            return networkResponse;
          }
        );
      })
  );
});
