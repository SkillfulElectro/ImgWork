// Increment this version number when you update any file (HTML, CSS, JS)
// This acts as the "checksum" that triggers an update.
const CACHE_VERSION = 'imgwork-v1'; 

const urlsToCache = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/ui.js',
    './js/converter.js',
    './js/compressor.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install Event: Caches the app shell
self.addEventListener('install', event => {
    // Force the waiting service worker to become the active service worker immediately
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => {
                console.log(`[ImgWork] Opened cache: ${CACHE_VERSION}`);
                // addAll fetches and caches all files in the array
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('[ImgWork] Failed to pre-cache resources:', err);
            })
    );
});

// Activate Event: Cleans up old caches and takes control
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // If the cache name is not the current version, delete it
                    if (cacheName !== CACHE_VERSION) {
                        console.log(`[ImgWork] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Let the service worker take control of the clients (tabs) immediately
            return self.clients.claim();
        })
    );
});

// Fetch Event: Serves cached content or falls back to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests (like CDN scripts) to avoid opaque response issues
    if (!event.request.url.startsWith(self.location.origin)) {
        return; 
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).catch(() => {
                    // If both cache and network fail, return a generic offline page for navigation
                    if (event.request.mode === 'navigate') {
                        return new Response(`
                            <h1>Offline</h1>
                            <p>ImgWork is currently offline. Please check your connection.</p>
                        `, {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    }
                });
            })
    );
});
