// MisterAll PWA Service Worker
// Version du cache - incrémentez à chaque modification
const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `misterall-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `misterall-dynamic-${CACHE_VERSION}`;
const API_CACHE = `misterall-api-${CACHE_VERSION}`;

// Ressources statiques à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.svg'
];

// Routes API à ne jamais mettre en cache
const NO_CACHE_PATTERNS = [
  '/api/user/login',
  '/api/user/signup',
  '/api/user/logout',
  '/api/course/add'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Erreur installation:', error);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Supprimer les anciennes versions du cache
              return name.startsWith('misterall-') &&
                     name !== STATIC_CACHE &&
                     name !== DYNAMIC_CACHE &&
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers d'autres domaines
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api')) {
    return;
  }

  // Stratégie pour les appels API
  if (url.pathname.startsWith('/api')) {
    // Ne pas mettre en cache certaines routes sensibles
    if (NO_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
      return;
    }

    // Network First pour les API (données fraîches prioritaires)
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Stratégie pour les ressources statiques
  if (isStaticAsset(url.pathname)) {
    // Cache First pour les assets statiques
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Stratégie par défaut: Stale While Revalidate pour les pages
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Cache First - Utilisé pour les assets statiques
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Erreur fetch:', error);
    return caches.match('/index.html');
  }
}

// Network First - Utilisé pour les API (données fraîches prioritaires)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache');
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Retourner une réponse d'erreur offline
    return new Response(
      JSON.stringify({ error: 'Hors ligne', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale While Revalidate - Utilisé pour les pages
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(cacheName);
        cache.put(request, responseToCache);
      }
      return networkResponse;
    })
    .catch(() => {
      // Si pas de réseau et pas de cache, retourner la page d'accueil
      return caches.match('/index.html');
    });

  return cachedResponse || fetchPromise;
}

// Vérifier si c'est un asset statique
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.ico', '.woff', '.woff2', '.ttf', '.eot'
  ];

  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('misterall-'))
            .map(name => caches.delete(name))
        );
      })
    );
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu');

  let data = {
    title: 'MisterAll',
    body: 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: [100, 50, 100, 50, 100],
    tag: data.tag || 'misterall-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ],
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || Date.now(),
      ...data.data
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification cliquée:', event.action);
  event.notification.close();

  // Si action "close", ne rien faire
  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre déjà ouverte
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin && 'focus' in client) {
            // Naviguer vers l'URL et focus
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Fermeture de notification (analytics éventuel)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée');
});

console.log('[SW] Service Worker MisterAll chargé');
