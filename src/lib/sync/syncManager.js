// src/lib/sync/syncManager.js
import db from '@/lib/dexie/db';

let isSyncing = false;
let syncListeners = [];

export function addSyncListener(fn) {
  syncListeners.push(fn);
  return () => { syncListeners = syncListeners.filter(l => l !== fn); };
}

function notifyListeners(status) {
  syncListeners.forEach(fn => fn(status));
}

export async function syncAll() {
  if (isSyncing || typeof window === 'undefined') return;
  if (!navigator.onLine) return;

  isSyncing = true;
  notifyListeners('syncing');

  try {
    const pending = await db.sync_queue
      .where('status').equals('pending')
      .or('status').equals('failed')
      .and(item => item.attempts < 3)
      .toArray();

    if (pending.length === 0) {
      notifyListeners('synced');
      isSyncing = false;
      return;
    }

    let hasErrors = false;

    for (const item of pending) {
      try {
        await db.sync_queue.update(item.id, { attempts: (item.attempts || 0) + 1 });

        const payload = typeof item.payload === 'string'
          ? JSON.parse(item.payload)
          : item.payload;

        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: item.entityType,
            entityId:   item.entityId,
            action:     item.action,
            payload,
          }),
        });

        const resData = await response.json().catch(() => ({}));

        // 200 sukses, 409 = duplikat (sudah ada) → anggap sukses juga
        if (response.ok || response.status === 409) {
          await db.sync_queue.update(item.id, {
            status: 'synced',
            syncedAt: new Date().toISOString(),
            errorMsg: response.status === 409 ? 'Duplikat, dianggap sukses' : null,
          });
        } else {
          const isFatal = response.status === 422; // relasi tidak ada → jangan retry
          await db.sync_queue.update(item.id, {
            status: isFatal || item.attempts >= 2 ? 'failed' : 'pending',
            errorMsg: resData.error || resData.message || `HTTP ${response.status}`,
          });
          hasErrors = true;
          console.warn(`[sync] ${item.entityType} ${item.action} gagal:`, resData);
        }
      } catch (err) {
        await db.sync_queue.update(item.id, {
          status: item.attempts >= 2 ? 'failed' : 'pending',
          errorMsg: err.message,
        });
        hasErrors = true;
      }
    }

    notifyListeners(hasErrors ? 'error' : 'synced');
  } catch (err) {
    console.error('[sync] syncAll error:', err);
    notifyListeners('error');
  } finally {
    isSyncing = false;
  }
}

export async function getPendingCount() {
  return db.sync_queue.where('status').equals('pending').count();
}

export async function getFailedItems() {
  return db.sync_queue.where('status').equals('failed').toArray();
}

export async function retryFailed() {
  await db.sync_queue
    .where('status').equals('failed')
    .modify({ status: 'pending', attempts: 0, errorMsg: null });
  return syncAll();
}

export async function getStorageEstimate() {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return { usage: 0, quota: 0, percentage: 0 };
  }
  try {
    const estimate = await navigator.storage.estimate();
    const usage    = estimate.usage || 0;
    const quota    = estimate.quota || 0;
    const percentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;
    return { usage, quota, percentage };
  } catch {
    return { usage: 0, quota: 0, percentage: 0 };
  }
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ── Auto-sync hooks ──────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[sync] Online — mulai sync...');
    setTimeout(syncAll, 1000);
  });

  setInterval(() => {
    if (navigator.onLine) syncAll();
  }, 30000);
}
