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
        
        // First, ensure we cache the start URL specifically
        return fetch('/')
          .then(response => {
            if (response.ok) {
              console.log('Caching start URL (/)');
              return cache.put('/', response);
            } else {
              console.error('Failed to fetch start URL:', response.status);
              throw new Error('Start URL fetch failed');
            }
          })
          .then(() => {
            // Then cache other essential files
            const otherUrls = urlsToCache.filter(url => url !== '/');
            if (otherUrls.length > 0) {
              return cache.addAll(otherUrls);
            }
          });
      })
      .then(() => {
        console.log('Service Worker installed - start URL and files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
        // Even if caching fails, still skip waiting
        return self.skipWaiting();
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
        }).catch((error) => {
          console.log('Network failed for:', event.request.url, error);
          
          // Network failed - handle different request types
          if (event.request.mode === 'navigate') {
            // For navigation requests, try to return cached start URL
            return caches.match('/').then(cachedResponse => {
              if (cachedResponse) {
                console.log('Returning cached start URL');
                return cachedResponse;
              }
              // If no cached start URL, return offline page
              return caches.match('/offline.html').then(offlineResponse => {
                if (offlineResponse) {
                  console.log('Returning offline page');
                  return offlineResponse;
                }
                // Last resort - return a basic HTML response
                console.log('Returning fallback HTML');
                return new Response(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>Deegaan Restaurant - Offline</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { 
                          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                          text-align: center; 
                          padding: 50px; 
                          background: #0b0f12; 
                          color: white; 
                        }
                      </style>
                    </head>
                    <body>
                      <h1>Deegaan Restaurant</h1>
                      <p>You're offline. Please check your connection.</p>
                      <button onclick="window.location.reload()">Try Again</button>
                    </body>
                  </html>
                `, {
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            });
          } else if (event.request.destination === 'image') {
            // For images, return a placeholder
            return new Response('', { status: 404 });
          }
          // For other requests, return empty response
          return new Response('', { status: 404 });
        });
      })
      .catch((error) => {
        console.error('Cache match failed:', error);
        // If cache match fails, return a basic response
        if (event.request.mode === 'navigate') {
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Deegaan Restaurant</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: #0b0f12; 
                    color: white; 
                  }
                </style>
              </head>
              <body>
                <h1>Deegaan Restaurant</h1>
                <p>Loading...</p>
                <script>window.location.reload();</script>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        return new Response('', { status: 404 });
      })
  );
});

// Handle offline/online events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
