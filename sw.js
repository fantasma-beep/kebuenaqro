// Usamos un nombre de caché nuevo para forzar la actualización
const CACHE_NAME = 'kebuenaqro-cache-v3';

// Archivos locales (el "cascarón" de la app) que SÍ queremos guardar
const urlsToCache = [
  './', // Esto es index.html
  './manifest.json',
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6',
  'https://fantasma-beep.github.io/kebuenaqro/logo.png?v=4',
  'https://fantasma-beep.github.io/kebuenaqro/logotipo5.png?v=7',
  'https://fantasma-beep.github.io/kebuenaqro/494615713_1348055410294820_9029691649736311255_n.jpg'
  // NOTA: NO AÑADIMOS 'tailwindcss.com'
];

// Evento 'install': Guarda los archivos del "cascarón" en el caché
self.addEventListener('install', event => {
  console.log('SW: Instalando v3...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cacheando app shell local');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

// Evento 'activate': Limpia los cachés viejos
self.addEventListener('activate', event => {
  console.log('SW: Activado v3');
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

  // 1. Para los streams de radio y Tailwind: SIEMPRE ir a la red.
  // Esto evita el error de CORS y asegura que el stream sea en vivo.
  if (url.includes('laradiossl.online') || url.includes('cdn.tailwindcss.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Para todo lo demás (tus archivos locales):
  // Intenta buscar en el caché primero. Si no está, ve a la red.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devuélvelo
        if (response) {
          return response;
        }
        // Si no, búscalo en la red
        return fetch(event.request);
      })
  );
});
