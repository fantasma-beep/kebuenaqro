// Este archivo es el Service Worker.
// Su simple existencia y registro es lo que permite que Android ofrezca la opción de instalar la PWA.

self.addEventListener('install', (event) => {
  // Este evento se dispara cuando el trabajador de servicio se instala.
  console.log('Service Worker: Instalado');
});

self.addEventListener('activate', (event) => {
  // Este evento se dispara cuando el trabajador de servicio se activa.
  console.log('Service Worker: Activado');
});

self.addEventListener('fetch', (event) => {
  // Este evento se dispara cada vez que la página solicita un recurso (imágenes, guiones, etc.).
  // Para una aplicación de streaming, no guardamos nada en caché para asegurar que el contenido sea siempre en vivo.
  // Simplemente pasamos la solicitud a la red.
  event.respondWith(fetch(event.request));
});

