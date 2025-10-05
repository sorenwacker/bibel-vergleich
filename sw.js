// Service Worker for offline caching
const CACHE_NAME = 'bibel-vergleich-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✓ Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - always fetch from network, don't cache bolls.life API
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // For bolls.life API, always fetch from network
                if (event.request.url.includes('bolls.life')) {
                    return fetch(event.request);
                }

                // For other resources, use cache if available
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Cache static assets only (not API responses)
                    if (!event.request.url.includes('bolls.life')) {
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    return response;
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('✓ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
