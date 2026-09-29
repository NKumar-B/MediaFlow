// Service Worker for MediaFlow Progressive Web App (PWA)
const CACHE_NAME = 'mediaflow-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - Cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Cache static same-origin shell while bypassing API, Firestore & R2 Media
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  try {
    const url = new URL(event.request.url);

    // Bypass dynamic APIs, Firestore, Firebase Auth, Cloudflare R2 storage & Vercel API functions
    if (
      url.pathname.startsWith('/api/') ||
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebasestorage.googleapis.com') ||
      url.hostname.includes('cloudflarestorage.com') ||
      url.hostname.includes('firebase')
    ) {
      return;
    }

    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      }).catch(() => fetch(event.request))
    );
  } catch (err) {
    // Fallback to network
  }
});
