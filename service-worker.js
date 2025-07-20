// service-worker.js
const CACHE_NAME = 'kasir-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/bootstrap.min.css',
  '/js/app.js',
  '/js/bootstrap.bundle.min.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Tambahkan file-file penting lainnya
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claim clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching');
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If fetch fails, serve from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Fallback for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-transactions') {
    console.log('Service Worker: Background sync - transactions');
    event.waitUntil(syncTransactions());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Notifikasi dari Kasir App',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Buka App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Kasir App', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for syncing offline transactions
async function syncTransactions() {
  try {
    // Get offline transactions from IndexedDB or localStorage
    const offlineTransactions = await getOfflineTransactions();
    
    for (const transaction of offlineTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          // Remove successfully synced transaction
          await removeOfflineTransaction(transaction.id);
          console.log('Transaction synced:', transaction.id);
        }
      } catch (error) {
        console.error('Failed to sync transaction:', transaction.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions (implement based on your storage method)
async function getOfflineTransactions() {
  // Implement based on your offline storage solution
  // This could be IndexedDB, localStorage, etc.
  return [];
}

async function removeOfflineTransaction(id) {
  // Implement removal of synced transaction
  console.log('Remove transaction:', id);
}
