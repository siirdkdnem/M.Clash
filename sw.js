const CACHE_NAME = "manager-clash-v3.0";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
  // "music.mp3" - optional, uncomment if you have the file
];

self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("[Service Worker] Caching files...");
      return cache.addAll(urlsToCache).catch(function(err) {
        console.log("[Service Worker] Cache addAll error:", err);
      });
    })
  );
  self.skipWaiting();
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
  return self.clients.claim();
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
    }).catch(function() {
      // Fallback for offline
      if (event.request.mode === "navigate") {
        return caches.match("index.html");
      }
      return new Response("Offline - Please check your connection", {
        status: 503,
        statusText: "Service Unavailable"
      });
    })
  );
});