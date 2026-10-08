/*
 * Lotería Colep service worker.
 * The app shell is network first, so updates arrive straight away, with the cache as an
 * offline fallback. Fonts and the QR library are cache first. api.php is never cached.
 * Bump VERSION on every release to clear old caches.
 */
const VERSION = '1.3.0';
const CACHE = 'loteria-colep-' + VERSION;
const SHELL = [
  './',
  'index.html',
  'style.css?v=4',
  'app.js?v=4',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('loteria-colep-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.pathname.endsWith('/api.php') || url.pathname.endsWith('/sw.js')) return;

  const isCdn = url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (isCdn) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
      .then(hit => hit || Response.error()))
  );
});
