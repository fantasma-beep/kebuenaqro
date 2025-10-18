const CACHE_NAME = 'kebuena-cache-v1';
const urlsToCache = [
  '/',
  '/index.html?v=2',
  '/manifest.json',
  '/logo-ke-buena-web.png',
  '/icon-192.png',
  '/icon-512.png',
  '/sw.js',
  'https://cdn.tailwindcss.com'
];

// Instalar SW y cachear recursos esenciales
self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activar SW y eliminar caches antiguas
self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

// Manejo de fetch
self.addEventListener('fetch', event => {
  const requestUrl = event.request.url;

  // No cachear streams de audio en vivo
  if (requestUrl.includes('laradiossl.online')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para otros recursos, usar cache first
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        // Guardar en cache solo si es una respuesta OK y tipo básico
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Opcional: fallback a un recurso offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html?v=2');
        }
      });
    })
  );
});
