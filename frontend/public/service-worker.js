/**
 * Words of Praise — Service Worker
 *
 * Strategy:
 *  - App shell (HTML / JS / CSS / fonts / images): Cache-first with network fallback.
 *  - /api/verses and /api/manna/today: Stale-while-revalidate so cached content
 *    loads instantly and updates silently in the background.
 *  - All other API calls: Network-first (fall back to cache if offline).
 */

// v2: removed '/' from pre-cache; navigation requests now go network-first
// so the nginx 301 redirect (/ → /daily) is respected instead of bypassed.
const SHELL_CACHE   = 'wop-shell-v2';
const API_CACHE     = 'wop-api-v1';

// Do NOT include '/' — nginx 301-redirects it to '/daily'. Caching '/'
// here would serve the old index.html directly, bypassing the redirect.
const SHELL_URLS = ['/index.html'];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET and cross-origin requests (Stripe, fonts from CDN, etc.)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate for verse / manna API endpoints
  if (
    url.pathname.startsWith('/api/verses') ||
    url.pathname.startsWith('/api/manna/today')
  ) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Network-first for all other API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Navigation requests (HTML page loads) — always go to the network so
  // nginx server-side redirects (e.g. / → /daily) are honoured. Falls back
  // to cached /index.html only when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/index.html', { cacheName: SHELL_CACHE });
        return cached ?? new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Cache-first for static assets (JS / CSS / images / fonts)
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

// ── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return a fallback HTML shell for navigation requests when offline
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached ?? (await networkPromise) ?? new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}
