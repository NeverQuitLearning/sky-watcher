const CACHE = 'sky-watcher-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([
    '/',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg'
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('', {status: 200})))
  );
});

