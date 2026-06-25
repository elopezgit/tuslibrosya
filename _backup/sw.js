const CACHE = 'tupedido-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/data.js',
  '/js/helpers.js',
  '/js/validation.js',
  '/app.js',
  '/manifest.json',
  '/img/logo/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  e.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => {
          if (request.url.startsWith(self.location.origin)) {
            cache.put(request, clone);
          }
        });
        return response;
      }).catch(() => {
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      })
    )
  );
});
