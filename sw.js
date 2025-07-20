self.addEventListener("install", (event) => {
  console.log("Service Worker terpasang");
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
