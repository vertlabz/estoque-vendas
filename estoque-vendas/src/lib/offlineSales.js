import { openDB } from 'idb';

const DB_NAME = 'sales-db';
const STORE_NAME = 'pending-sales';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'offlineId' });
      }
    },
  });
}

export async function saveSaleOffline(sale) {
  const db = await getDb();
  await db.put(STORE_NAME, sale);
}

export async function getPendingSales() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function removePendingSale(offlineId) {
  const db = await getDb();
  await db.delete(STORE_NAME, offlineId);
}

export async function syncPendingSales() {
  const sales = await getPendingSales();
  for (const sale of sales) {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      if (res.ok) {
        await removePendingSale(sale.offlineId);
      } else {
        console.error('Falha ao sincronizar venda', sale.offlineId);
      }
    } catch (err) {
      console.error('Erro de sincronização', err);
    }
  }
}
