// Custom service worker for better offline handling
const CACHE_NAME = 'deegaan-restaurant-v2';
const urlsToCache = [
  '/',
  '/dist/assets/',
  '/logo.png',
  '/images/bg.jpg',
  '/offline.html'
];

// Install event - cache essential files including start URL
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Cache the start URL and essential files
        return cache.addAll(urlsToCache.map(url => {
          // Ensure we cache the exact start URL
          if (url === '/') {
            return new Request('/', { cache: 'reload' });
          }
          return url;
        }));
      })
      .then(() => {
        console.log('Service Worker installed - start URL cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - CacheFirst strategy for offline cold launch
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // CacheFirst strategy - return cached version if available
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // If not in cache, try network
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Network failed - handle different request types
          if (event.request.mode === 'navigate') {
            // For navigation requests, return cached start URL or offline page
            return caches.match('/').then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/offline.html');
            });
          } else if (event.request.destination === 'image') {
            // For images, return a placeholder or nothing
            return new Response('', { status: 404 });
          }
          // For other requests, return empty response
          return new Response('', { status: 404 });
        });
      })
  );
});

// Handle offline/online events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
