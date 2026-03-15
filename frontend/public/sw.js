// Cache Kill Switch
// This updated SW immediately activates and deletes all previous caches
// to rescue browsers stuck on older versions of the app.

self.addEventListener('install', (event) => {
  // Force the new worker to take over immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Clearing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Tell clients to reload if they need to fetch new assets
      return self.clients.claim();
    })
  );
});

// Pass all requests directly to the network without caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
