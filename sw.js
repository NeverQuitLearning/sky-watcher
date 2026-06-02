const CACHE = 'sky-watcher-v2';
const FILES = ['/', '/manifest.json', '/icon-192.svg', '/icon-512.svg'];

self.addEventListener('install', e => {
  // Delete old caches first
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE).map(n => caches.delete(n))
    )).then(() =>
      caches.open(CACHE).then(c => c.addAll(FILES))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Take over immediately and refresh all tabs
  e.waitUntil(
    clients.claim().then(() =>
      clients.matchAll().then(clients =>
        clients.forEach(c => c.navigate(c.url))
      )
    )
  );
});

self.addEventListener('fetch', e => {
  // Network first, fall back to cache (so new versions always load)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Update cache with new response
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || new Response('', {status: 200})))
  );
});
