// src/hooks/useProducts.js
'use client';
import { useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '@/lib/dexie/db';
import { ProductOps } from '@/lib/sync/onlineFirst';

export function useProducts() {
  const products = useLiveQuery(
    () => db.products.orderBy('name').toArray(),
    []
  );

  // Sinkronisasi produk dari server ke Dexie saat pertama load
  const fetchFromServer = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.onLine) return;
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      await db.transaction('rw', db.products, async () => {
        for (const p of data) {
          const existing = await db.products.where('serverId').equals(p.id).first();
          if (existing) {
            await db.products.update(existing.id, { ...p, serverId: p.id });
          } else {
            await db.products.add({ ...p, serverId: p.id });
          }
        }
      });
    } catch (err) {
      console.error('[useProducts] fetchFromServer:', err);
    }
  }, []);

  useEffect(() => { fetchFromServer(); }, [fetchFromServer]);

  const addProduct    = (data)            => ProductOps.create(data);
  const updateProduct = (localId, upd)    => ProductOps.update(localId, upd);
  const deleteProduct = (localId)         => ProductOps.delete(localId);

  const getByCategory = (category) => {
    if (!products) return [];
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
  };

  const categories = products
    ? ['all', ...new Set(products.map(p => p.category).filter(Boolean))]
    : ['all'];

  return { products, categories, fetchFromServer, addProduct, updateProduct, deleteProduct, getByCategory };
}
