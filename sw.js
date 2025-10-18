// Nombre del caché (cambia 'v1' a 'v2' para forzar la actualización)
const CACHE_NAME = 'kebuenaqro-cache-v2';

// Solo cacheamos lo esencial para que la app "arranque"
const urlsToCache = [
  './', // La página principal (index.html)
  './manifest.json?v=7', // El manifest
  'https://cdn.tailwindcss.com',
  'https://fantasma-beep.github.io/kebuenaqro/logo-ke-buena-web.png?v=6', // Logo del Splash
  'https://fantasma-beep.github.io/kebuenaqro/494615713_1348055410294820_9029691649736311255_n.jpg' // Imagen de fondo
];

// Evento 'install'
self.addEventListener('install', event => {
  console.log('SW: Instalando v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cacheando app shell esencial');
        // Usamos addAll, pero solo con archivos que sabemos que existen
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forzar la activación
  );
});

// Evento 'activate': Limpia cachés viejos
self.addEventListener('activate', event => {
  console.log('SW: Activado v2');
  const cacheWhitelist = [CACHE_NAME]; // Solo queremos el caché v2
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Si el caché no es v2, lo borramos
            console.log('SW: Borrando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Tomar control
  );
});

// Evento 'fetch'
self.addEventListener('fetch', event => {
  // No cachear los streams de radio
  if (event.request.url.includes('laradiossl.online')) {
    return fetch(event.request);
  }

  // Estrategia: "Cache first" (primero caché, si no, red)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Devolver desde el caché
          return response;
        }
        // Si no está en caché, ir a la red
        return fetch(event.request);
      })
  );
});
