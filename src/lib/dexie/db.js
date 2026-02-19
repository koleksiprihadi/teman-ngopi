// src/lib/dexie/db.js
import Dexie from 'dexie';

export const db = new Dexie('TemanNgopi');

db.version(1).stores({
  products:     '++id, name, category, isAvailable, updatedAt, serverId',
  transactions: '++id, invoiceNumber, cashierId, status, paymentMethod, isGantung, cashBookId, createdAt, serverId',
  transaction_items: '++id, transactionId, productId',
  open_bills:   '++id, cashierId, status, createdAt, serverId',
  open_bill_items: '++id, openBillId, productId',
  cash_books:   '++id, date, ownerId, isClosed, serverId',
  expenses:     '++id, cashBookId, category, createdAt, serverId',
  accounting_journals: '++id, transactionId, expenseId, date',
  sync_queue:   '++id, entityType, entityId, action, status, createdAt, attempts',
  users:        '++id, email, role, serverId',
  app_settings: '++id, key',
});

// Helper: Get or create app setting
export async function getSetting(key, defaultValue = null) {
  const setting = await db.app_settings.where('key').equals(key).first();
  return setting ? setting.value : defaultValue;
}

export async function setSetting(key, value) {
  const existing = await db.app_settings.where('key').equals(key).first();
  if (existing) {
    await db.app_settings.update(existing.id, { value });
  } else {
    await db.app_settings.add({ key, value });
  }
}

// Helper: add to sync queue
export async function addToSyncQueue(entityType, entityId, action, payload) {
  await db.sync_queue.add({
    entityType,
    entityId,
    action,
    payload: JSON.stringify(payload),
    status: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
}

// Generate invoice number
export async function generateInvoiceNumber() {
  const now = new Date();
  const prefix = `TN${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const count = await db.transactions.where('invoiceNumber').startsWith(prefix).count();
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

export default db;
