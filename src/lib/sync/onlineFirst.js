// src/lib/sync/onlineFirst.js
/**
 * Online-First Strategy
 * 
 * Kalau online  → langsung ke API, lalu update Dexie sebagai cache
 * Kalau offline → simpan ke Dexie + masukkan sync queue, nanti auto-sync
 */

import db, { addToSyncQueue } from '@/lib/dexie/db';

export function isOnline() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Jalankan operasi secara online-first.
 * 
 * @param {Object} opts
 * @param {Function} opts.online     - async fn yang hit API, harus return data dari server
 * @param {Function} opts.offline    - async fn yang simpan ke Dexie + sync queue
 * @param {Function} [opts.onSuccess]- dipanggil setelah online berhasil, terima server data
 * @returns server data (online) atau local data (offline)
 */
export async function onlineFirst({ online, offline, onSuccess }) {
  if (isOnline()) {
    try {
      const result = await online();
      if (onSuccess) await onSuccess(result);
      return result;
    } catch (err) {
      // Kalau API error (bukan network error), jangan fallback ke offline
      // Tapi kalau fetch gagal (TypeError: Failed to fetch), fallback
      if (err instanceof TypeError || err.name === 'NetworkError') {
        console.warn('[onlineFirst] Network error, fallback offline:', err.message);
        return offline();
      }
      throw err;
    }
  } else {
    return offline();
  }
}

/* ─────────────────────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────────────────────── */
export const ProductOps = {

  async create(data) {
    return onlineFirst({
      online: async () => {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan produk');
        return res.json(); // { id, name, ... } dari server
      },
      onSuccess: async (serverProduct) => {
        // Upsert ke Dexie sebagai cache
        const existing = await db.products.where('serverId').equals(serverProduct.id).first();
        if (existing) {
          await db.products.update(existing.id, { ...serverProduct, serverId: serverProduct.id });
        } else {
          await db.products.add({ ...serverProduct, serverId: serverProduct.id });
        }
      },
      offline: async () => {
        const { v4: uuidv4 } = await import('uuid');
        const tempId = uuidv4();
        const newProduct = {
          ...data,
          serverId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.products.add(newProduct);
        await addToSyncQueue('product', tempId, 'CREATE', { ...newProduct, id: tempId });
        return newProduct;
      },
    });
  },

  async update(localId, updates) {
    const product = await db.products.get(localId);
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };

    return onlineFirst({
      online: async () => {
        const serverId = product?.serverId;
        if (!serverId) throw new Error('Produk belum tersinkron ke server');
        const res = await fetch(`/api/products/${serverId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui produk');
        return res.json();
      },
      onSuccess: async (serverProduct) => {
        await db.products.update(localId, { ...serverProduct, serverId: serverProduct.id });
      },
      offline: async () => {
        await db.products.update(localId, updatedData);
        if (product?.serverId) {
          await addToSyncQueue('product', product.serverId, 'UPDATE', {
            ...product, ...updatedData, id: product.serverId,
          });
        }
        return { ...product, ...updatedData };
      },
    });
  },

  async delete(localId) {
    const product = await db.products.get(localId);

    return onlineFirst({
      online: async () => {
        const serverId = product?.serverId;
        if (!serverId) {
          // Belum pernah ke server, hapus local saja
          await db.products.delete(localId);
          return { success: true };
        }
        const res = await fetch(`/api/products/${serverId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal menghapus produk');
        return res.json();
      },
      onSuccess: async () => {
        await db.products.delete(localId);
      },
      offline: async () => {
        await db.products.delete(localId);
        if (product?.serverId) {
          await addToSyncQueue('product', product.serverId, 'DELETE', { id: product.serverId });
        }
        return { success: true };
      },
    });
  },
};

/* ─────────────────────────────────────────────────────────────
   TRANSACTIONS
───────────────────────────────────────────────────────────── */
export const TransactionOps = {

  async create(transaction) {
    return onlineFirst({
      online: async () => {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan transaksi');
        return res.json();
      },
      onSuccess: async (serverTx) => {
        // Simpan ke Dexie dengan serverId dari server
        await db.transaction('rw', db.transactions, db.transaction_items, async () => {
          const localId = await db.transactions.add({
            ...transaction,
            serverId: serverTx.id,
          });
          for (const item of (transaction.items || [])) {
            await db.transaction_items.add({
              ...item,
              transactionId: localId,
              serverId: item.id || null,
            });
          }
        });
      },
      offline: async () => {
        // Simpan ke Dexie tanpa serverId + masuk sync queue
        await db.transaction('rw', db.transactions, db.transaction_items, async () => {
          const localId = await db.transactions.add({ ...transaction, serverId: null });
          for (const item of (transaction.items || [])) {
            await db.transaction_items.add({
              ...item,
              transactionId: localId,
              serverId: null,
            });
          }
        });
        await addToSyncQueue('transaction', transaction.id, 'CREATE', transaction);
        return transaction;
      },
    });
  },
};

/* ─────────────────────────────────────────────────────────────
   OPEN BILLS
───────────────────────────────────────────────────────────── */
export const OpenBillOps = {

  async create(openBill) {
    return onlineFirst({
      online: async () => {
        const res = await fetch('/api/open-bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(openBill),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan open bill');
        return res.json();
      },
      onSuccess: async (serverBill) => {
        await db.transaction('rw', db.open_bills, db.open_bill_items, async () => {
          const localId = await db.open_bills.add({
            ...openBill,
            serverId: serverBill.id,
          });
          for (const item of (openBill.items || [])) {
            await db.open_bill_items.add({ ...item, openBillId: localId });
          }
        });
      },
      offline: async () => {
        await db.transaction('rw', db.open_bills, db.open_bill_items, async () => {
          const localId = await db.open_bills.add({ ...openBill, serverId: null });
          for (const item of (openBill.items || [])) {
            await db.open_bill_items.add({ ...item, openBillId: localId });
          }
        });
        await addToSyncQueue('open_bill', openBill.id, 'CREATE', openBill);
        return openBill;
      },
    });
  },

  async markPaid(localId, serverId) {
    return onlineFirst({
      online: async () => {
        if (!serverId) return; // belum pernah ke server, abaikan
        const res = await fetch(`/api/open-bills/${serverId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PAID' }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal update open bill');
        return res.json();
      },
      onSuccess: async () => {
        await db.open_bills.update(localId, { status: 'PAID' });
      },
      offline: async () => {
        await db.open_bills.update(localId, { status: 'PAID' });
      },
    });
  },
};

/* ─────────────────────────────────────────────────────────────
   CASH BOOK
───────────────────────────────────────────────────────────── */
export const CashBookOps = {

  async updateTotals(localId, serverId, updates) {
    return onlineFirst({
      online: async () => {
        if (!serverId) return;
        const res = await fetch(`/api/cashbook/${serverId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Gagal update cash book');
        return res.json();
      },
      onSuccess: async (data) => {
        await db.cash_books.update(localId, updates);
      },
      offline: async () => {
        await db.cash_books.update(localId, updates);
      },
    });
  },
};
