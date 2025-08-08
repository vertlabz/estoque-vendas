import { useState, useEffect } from 'react';
import { FaDatabase } from 'react-icons/fa';
import { openDB } from 'idb';

// Returns the number of sales stored locally waiting to be sent to the server
async function getPendingSalesCount(): Promise<number> {
  // Try LocalStorage first
  const raw = localStorage.getItem('pendingSales');
  if (raw) {
    try {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list.length;
    } catch {
      // ignore parsing errors
    }
  }

  // Fallback to IndexedDB
  try {
    const db = await openDB('sales-db', 1);
    if (db.objectStoreNames.contains('pending-sales')) {
      const items = await db.getAll('pending-sales');
      return items.length;
    }
  } catch {
    // ignore db errors
  }

  return 0;
}

export default function OfflineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);

  // Updates the current number of pending sales
  const updatePendingCount = () => {
    getPendingSalesCount().then(setPendingCount);
  };

  useEffect(() => {
    // Update online status and pending sales when connection changes
    const handleOnline = () => {
      setIsOnline(true);
      updatePendingCount();
    };
    const handleOffline = () => {
      setIsOnline(false);
      updatePendingCount();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'pendingSales') updatePendingCount();
    };

    updatePendingCount();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 text-sm"
      title={
        isOnline
          ? 'Sincronizado com o banco de dados'
          : `${pendingCount} vendas pendentes de sincronização`
      }
    >
      <FaDatabase className={isOnline ? 'text-green-500' : 'text-red-500'} />
      {isOnline ? (
        <span className="text-gray-600">Sincronizado com o banco de dados</span>
      ) : (
        <span className="text-gray-600">{pendingCount} pendentes</span>
      )}
    </div>
  );
}

