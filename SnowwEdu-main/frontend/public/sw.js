const CACHE_NAME = 'snowwedu-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/analytics',
  '/result',
  '/roadmap-result',
  '/sign-in',
  '/sign-up',
  '/quiz',
  '/roadmap-quiz',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    (function() {
      // Never intercept Clerk (or other auth CDN) scripts
      try {
        var url = new URL(event.request.url);
        var host = url.hostname || "";
        if (host.includes("clerk.accounts.dev") || host.includes("clerk.com") || host.includes("accounts.dev")) {
          return fetch(event.request);
        }
      } catch (e) {}

    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function() {
          // Offline fallback
          if (event.request.url.includes('/api/')) {
            // Return a custom offline response for API calls
            return new Response(
              JSON.stringify({ error: 'Offline - Please check your internet connection' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          // For non-API requests, return a generic offline error response
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
