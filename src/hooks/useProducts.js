// src/hooks/useProducts.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { addToSyncQueue } from '@/lib/dexie/db';
import { v4 as uuidv4 } from 'uuid';

export function useProducts() {
  const products = useLiveQuery(() =>
    db.products.orderBy('name').toArray()
  , []);

  const fetchFromServer = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      // Upsert all products locally
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
      console.error('Failed to fetch products:', err);
    }
  }, []);

  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  const addProduct = async (productData) => {
    const id = uuidv4();
    const newProduct = {
      ...productData,
      serverId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.products.add(newProduct);
    await addToSyncQueue('product', id, 'CREATE', { ...newProduct, id });
    return newProduct;
  };

  const updateProduct = async (localId, updates) => {
    const product = await db.products.get(localId);
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    await db.products.update(localId, updated);
    if (product?.serverId) {
      await addToSyncQueue('product', product.serverId, 'UPDATE', { ...product, ...updated, id: product.serverId });
    }
  };

  const deleteProduct = async (localId) => {
    const product = await db.products.get(localId);
    await db.products.delete(localId);
    if (product?.serverId) {
      await addToSyncQueue('product', product.serverId, 'DELETE', { id: product.serverId });
    }
  };

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
