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
// v3 (API cache): /api/verses/daily moved to network-first to prevent a stale
// cache from serving a wrong-language verse after the user changes UI language.
// v3 (shell): added push + notificationclick handlers.
// v4 (API cache): bump to evict any wrong-language verse responses that were
// cached before the preferred_bible_version language-mismatch fix was deployed.
// v5 (API cache): networkFirst and staleWhileRevalidate now bypass the browser
// HTTP cache (cache:'no-store') so a stale browser-cached response in the wrong
// language can never be served through the service worker.
const SHELL_CACHE   = 'wop-shell-v3';
const API_CACHE     = 'wop-api-v4';

// Do NOT include '/' — nginx 301-redirects it to '/daily'. Caching '/'
// here would serve the old index.html directly, bypassing the redirect.
// Fonts are self-hosted — pre-cache the two critical Latin subsets so they're
// available immediately on first paint, even offline.
const SHELL_URLS = [
  '/index.html',
  '/fonts/fonts.css',
  '/fonts/inter-latin.woff2',
  '/fonts/inter-latin-ext.woff2',
  '/fonts/merriweather-400-latin.woff2',
  '/fonts/merriweather-400-latin-ext.woff2',
  '/fonts/playfair-latin.woff2',
  '/logo192.png',
  '/logo48.png',
];

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

  // Today's daily verse must always come from the network — its content depends on
  // the user's preferred_bible_version setting, which can change independently of
  // the URL. Stale-while-revalidate here would serve a wrong-language response
  // after the user changes UI language or Bible version preference.
  // Past-date lookups (?date=…) also use network-first; their immutable
  // Cache-Control header means the browser HTTP cache handles repeat hits anyway.
  if (url.pathname === '/api/verses/daily') {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Stale-while-revalidate for other verse endpoints (reference lookups) and manna.
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
    // Bypass the browser HTTP cache so a stale cached response (e.g. a verse
    // in the wrong language from before a backend fix) can never be served.
    // The SW manages its own cache in `cacheName` for offline fallback.
    const networkResponse = await fetch(new Request(request, { cache: 'no-store' }));
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ── Push notifications ────────────────────────────────────────────────────────

// Receive a push event from the server and show a notification.
self.addEventListener('push', (event) => {
  const defaults = {
    title: 'Words of Praise',
    body:  "Today's verse is ready — tap to read it. 🙏",
    url:   '/daily',
    icon:  '/logo192.png',
    badge: '/logo48.png',
  };

  let data = defaults;
  if (event.data) {
    try { data = { ...defaults, ...event.data.json() }; } catch { /* use defaults */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:              data.body,
      icon:              data.icon,
      badge:             data.badge,
      data:              { url: data.url },
      tag:               'daily-verse',     // replaces any previous unread notification
      requireInteraction: false,
      silent:            false,
    })
  );
});

// When the user taps a notification, open/focus the app at the target URL.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/daily';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing open window if one exists
        for (const client of windowClients) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        return clients.openWindow(targetUrl);
      })
  );
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Bypass browser HTTP cache so the background revalidation always fetches
  // fresh content from the server rather than a stale HTTP-cached response.
  const networkPromise = fetch(new Request(request, { cache: 'no-store' })).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached ?? (await networkPromise) ?? new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}
