// Service Worker for MediaFlow Progressive Web App (PWA)
const CACHE_NAME = 'mediaflow-pwa-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - Skip waiting immediately on new deployment
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - Delete ALL older cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-First for HTML/Navigations, Cache-First for static assets, Bypass for APIs/R2
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

    // HTML / Page Navigations: Network-First to ensure fresh index.html & asset bundle hashes
    const isHtmlNavigation = event.request.mode === 'navigate' || 
                             url.pathname === '/' || 
                             url.pathname.endsWith('.html');

    if (isHtmlNavigation) {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
      );
      return;
    }

    // Static Assets & Scripts: Stale-While-Revalidate / Cache with Network Fallback
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch background update for cache
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      }).catch(() => fetch(event.request))
    );
  } catch (err) {
    // Fallback to network
  }
});
