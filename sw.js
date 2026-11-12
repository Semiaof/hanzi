// Bump CACHE_NAME whenever app files change so old caches are dropped.
const CACHE_NAME = 'how-to-xie-hanzi-v7-1';
// Stroke data never changes, so it lives in its own cache that survives app updates.
const HW_CACHE = 'how-to-xie-hanzi-strokes-1';
const CORE_ASSETS = ["./", "./index.html", "./css/app.css?v=16", "./js/core.js?v=7", "./js/app.js?v=8", "./data/app-data.js?v=2", "./js/hw-loader.js?v=1", "./fonts/plex.css?v=1", "./fonts/KaiTi-Web.woff", "./manifest.json", "./icon.svg", "./icon-180.png", "./js/lib/hanzi-writer.min.js", "./js/lib/cnchar.min.js", "./js/lib/cnchar.order.min.js", "./js/lib/cnchar.radical.min.js", "./fonts/plex-thai-400.woff2", "./fonts/plex-latin-ext-400.woff2", "./fonts/plex-latin-400.woff2", "./fonts/plex-thai-500.woff2", "./fonts/plex-latin-ext-500.woff2", "./fonts/plex-latin-500.woff2", "./fonts/plex-thai-600.woff2", "./fonts/plex-latin-ext-600.woff2", "./fonts/plex-latin-600.woff2", "./fonts/plex-thai-700.woff2", "./fonts/plex-latin-ext-700.woff2", "./fonts/plex-latin-700.woff2"];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS).catch(() => {})));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k !== HW_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // stroke data, fonts and libraries: cache first (they never change)
  if (/\/data\/hw\/|\/fonts\/|\/js\/lib\//.test(url.pathname)) {
    const cacheName = url.pathname.includes('/data/hw/') ? HW_CACHE : CACHE_NAME;
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200) { const c = res.clone(); caches.open(cacheName).then(x => x.put(req, c)); }
      return res;
    })));
    return;
  }
  // app files: network first (always newest), cache as the offline fallback
  event.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
    if (res && res.status === 200 && res.type === 'basic') { const c = res.clone(); caches.open(CACHE_NAME).then(x => x.put(req, c)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match(req, { ignoreSearch: true }))));
});
