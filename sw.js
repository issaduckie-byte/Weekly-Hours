const CACHE_NAME = "weekly-hours-v1";
const APP_FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match("./index.html"))));
  } else if (["cdn.tailwindcss.com", "fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return res;
    }).catch(() => cached)));
  }
});