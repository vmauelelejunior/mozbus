import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      // Cache para os bilhetes do utilizador - NetworkFirst
      matcher: ({ url }) => url.pathname.startsWith("/api/tickets/user/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "mozbus-tickets-data",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      // Cache para listagem de viagens e resultados de busca
      matcher: ({ url }) => url.pathname.startsWith("/api/trips"),
      handler: "NetworkFirst",
      options: {
        cacheName: "mozbus-trips-data",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 2 }, // 2 horas de cache para viagens
      },
    },
    {
      // Cache para páginas principais visitadas (HTML)
      matcher: ({ request }) => request.mode === 'navigate',
      handler: "NetworkFirst",
      options: {
        cacheName: "mozbus-pages-cache",
        expiration: { maxEntries: 50 },
        networkTimeoutSeconds: 3, // Se não responder em 3s, usa a cache ou vai para fallback
      },
    },
    {
      // Cache para Tiles de Mapas (OpenStreetMap/Mapbox)
      matcher: ({ url }) => url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('api.mapbox.com'),
      handler: "CacheFirst",
      options: {
        cacheName: "mozbus-maps-tiles",
        expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 dias
      },
    }
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.mode === "navigate";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Background Sync para Reservas
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-reservations') {
    event.waitUntil(processPendingReservations());
  }
});

async function processPendingReservations() {
  const DB_NAME = 'mozbus-offline-db';
  const STORE_NAME = 'pending-reservations';

  const db: IDBDatabase = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const reservations = await new Promise<any[]>((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });

  for (const res of reservations) {
    try {
      // Tentar enviar para a API real
      const response = await fetch('/api/tickets/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(res),
      });

      if (response.ok) {
        // Se sucesso, remover da fila
        const delTx = db.transaction(STORE_NAME, 'readwrite');
        delTx.objectStore(STORE_NAME).delete(res.id);

        // Notificar o utilizador
        self.registration.showNotification('Reserva Confirmada! ✅', {
          body: `A sua reserva para a viagem ${res.tripId} (Assento ${res.seatNumber}) foi sincronizada com sucesso.`,
          icon: '/icon-192x192.png',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: 'sync-success-' + res.id,
          data: { url: '/tickets/meus-bilhetes' }
        });
      }
    } catch (err) {
      console.error('Falha ao sincronizar reserva offline:', err);
      // Mantém no DB para a próxima tentativa
    }
  }
}

// Lidar com o clique na notificação
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    // @ts-ignore
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já houver uma janela aberta, foca nela
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova
      // @ts-ignore
      if (clients.openWindow) {
        // @ts-ignore
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
