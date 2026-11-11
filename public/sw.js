const C = 'hangar-v1', F = ['/', '/icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(F))));
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
