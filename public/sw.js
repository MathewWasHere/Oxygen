/* OXYGEN service worker — app-shell caching for a fast, installable PWA. */
const VERSION = "oxygen-v4";
/* Keep the install payload tiny: only the offline fallback is precached.
   "/" and "/menu" are cached on first visit by the navigate handler below,
   so installing the SW no longer fires a burst of parallel requests that
   competes with the page the user is currently waiting for.
   Missing assets are deliberately excluded because one rejected cache.addAll()
   request would prevent the whole app shell from being precached. */
const SHELL = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/oxygen-pwa-192-v4.png",
  "/icons/oxygen-pwa-512-v4.png",
  "/icons/oxygen-maskable-192-v4.png",
  "/icons/oxygen-maskable-512-v4.png",
  "/icons/oxygen-apple-touch-v4.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache API/auth traffic.
  if (url.pathname.startsWith("/api/")) return;

  // Images & fonts: cache-first.
  if (/\.(png|jpg|jpeg|webp|avif|svg|woff2)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Documents: network-first with cached fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/offline"))),
    );
  }
});
