// src/hooks/useOnlineStatus.js
'use client';
import { useState, useEffect } from 'react';
import { addSyncListener, syncAll, getPendingCount, getStorageEstimate, formatBytes } from '@/lib/sync/syncManager';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // synced | syncing | error | offline
  const [pendingCount, setPendingCount] = useState(0);
  const [storage, setStorage] = useState({ usage: 0, quota: 0, percentage: 0 });

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      syncAll();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsub = addSyncListener((status) => setSyncStatus(status));

    // Update pending count
    const interval = setInterval(async () => {
      const count = await getPendingCount();
      setPendingCount(count);
      const est = await getStorageEstimate();
      setStorage({
        ...est,
        usageStr: formatBytes(est.usage),
        quotaStr: formatBytes(est.quota),
      });
    }, 5000);

    // Initial
    getPendingCount().then(setPendingCount);
    getStorageEstimate().then(est => setStorage({
      ...est,
      usageStr: formatBytes(est.usage),
      quotaStr: formatBytes(est.quota),
    }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
      clearInterval(interval);
    };
  }, []);

  return { isOnline, syncStatus, pendingCount, storage };
}
