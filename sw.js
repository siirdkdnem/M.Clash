const CACHE_NAME = "manager-clash-v3.0";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "music.mp3",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("[Service Worker] Caching files...");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", function(event) {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});