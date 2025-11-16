const CACHE_NAME = 'my-app-cache-v34';
const urlsToCache = [
  '/2day/',
  '/2day/index.html',
  '/2day/styles.css',
  '/2day/script.js',
  '/2day/manifest.json',
  '/2day/icons/icon-192x192.png',
  '/2day/icons/icon-512x512.png'
];

// Install event: Cache the essential resources initially
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache); // Pre-cache only essential resources
      })
  );

  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Fetch event: Check cache first, then fetch from network
self.addEventListener('fetch', function(event) {
  // Helper: fetch with timeout so slow/no-data cellular connections fallback quicker
  function fetchWithTimeout(request, timeoutMs) {
    return new Promise(function(resolve, reject) {
      const timeoutId = setTimeout(function() {
        reject(new Error('fetch-timeout'));
      }, timeoutMs);

      fetch(request).then(function(response) {
        clearTimeout(timeoutId);
        resolve(response);
      }).catch(function(err) {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  }

  // If this is a navigation request, prefer returning cached app shell on failure.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(event.request, 5000).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok) {
          try {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          } catch (e) {}
          return networkResponse;
        }
        return caches.match('/2day/index.html') || caches.match('/2day/');
      }).catch(function() {
        return caches.match('/2day/index.html') || caches.match('/2day/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      // If the request is in cache, return it immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // Try network first but with a timeout; if it fails or returns a non-ok response,
      // fall back to the cached app shell (`/2day/`) so the app still loads.
      return fetchWithTimeout(event.request, 5000).then(function(networkResponse) {
        // If no response or a bad response, return cached fallback if available
        if (!networkResponse || !networkResponse.ok) {
          return caches.match('/2day/');
        }

        // Clone and cache only successful, same-origin or CORS-allowed responses
        try {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        } catch (e) {
          // If caching fails for any reason, ignore and return the network response
        }

        return networkResponse;
      }).catch(function() {
        // On fetch error (including timeout), return the cached app shell
        return caches.match('/2day/');
      });
    })
  );
});

// Activate event: Clean up old caches and ensure the new service worker is in control
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME]; // Only keep the active cache
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete any outdated caches
          }
        })
      );
    }).then(function() {
      // Claim control of the clients (open windows) immediately
      return self.clients.claim();
    })
  );
});

// Listen for updates to the service worker and force the new version
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
