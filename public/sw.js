const CACHE_NAME = 'barber-v1.0.0'; // Cambia la versión cada vez que hagas cambios
const isDev = location.hostname === 'localhost';

self.addEventListener('install', (event) => {
  if (isDev) {
    self.skipWaiting(); // Forzar activación inmediata en desarrollo
  }
  console.log('SW instalado');
});

self.addEventListener('activate', (event) => {
  if (isDev) {
    // Limpiar caches antiguos en desarrollo
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (isDev) {
    // En desarrollo, siempre ir a la red primero
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  } else {
    // En producción, cache first
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});