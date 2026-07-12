/* ================================================
 * ReaStock WMS — Service Worker
 * Strategi: Cache First untuk aset statis,
 *           Network First untuk navigasi HTML
 * ================================================ */

const CACHE_NAME = "reastock-wms-v1";
const OFFLINE_URL = "/offline.html";

// Aset yang di-pre-cache saat SW install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/offline.html",
];

/* ── Install ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache gagal untuk beberapa aset:", err);
      });
    })
  );
  // Aktifkan SW baru langsung tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Ambil kontrol semua tab yang sudah terbuka
  self.clients.claim();
});

/* ── Fetch ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya handle request dari origin yang sama
  if (url.origin !== location.origin) return;

  // Abaikan request non-GET
  if (request.method !== "GET") return;

  // Strategi untuk navigasi halaman (HTML): Network First
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Simpan response ke cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline: ambil dari cache, fallback ke offline.html
          return caches.match(request).then(
            (cached) => cached || caches.match(OFFLINE_URL)
          );
        })
    );
    return;
  }

  // Strategi untuk aset statis (CSS, JS, gambar): Cache First
  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Default: Network First dengan fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});

/* ── Push Notification (opsional) ── */
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "ReaStock WMS", {
      body: data.body || "Ada update baru",
      icon: "/logo192.png",
      badge: "/logo192.png",
    })
  );
});
