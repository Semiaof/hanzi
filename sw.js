// Bump this whenever app files change so old caches are dropped.
const CACHE_NAME = 'how-to-xie-hanzi-v4-1';
const CORE_ASSETS = ['./', './index.html', './css/app.css', './js/core.js', './js/app.js', './data/app-data.js', './fonts/KaiTi-Web.woff', './manifest.json', './icon.svg'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS).catch(() => {})));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network-first (always newest), cache only as an offline fallback.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const same = new URL(req.url).origin === self.location.origin;
  const net = same ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req);
  event.respondWith(net.then(res => {
    if (res && res.status === 200 && res.type === 'basic') { const c = res.clone(); caches.open(CACHE_NAME).then(x => x.put(req, c)); }
    return res;
  }).catch(() => caches.match(req)));
});
