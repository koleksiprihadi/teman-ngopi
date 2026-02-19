// src/hooks/useCategories.js
'use client';
import { useState, useEffect, useCallback } from 'react';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter(c => c.isActive));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Semua kategori aktif termasuk yang dinonaktifkan (untuk owner)
  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) return await res.json();
    } catch {}
    return [];
  }, []);

  const addCategory = async (data) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal menambah kategori');
    }
    await fetchCategories();
    return res.json();
  };

  const updateCategory = async (id, data) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal memperbarui kategori');
    }
    await fetchCategories();
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal menghapus kategori');
    }
    await fetchCategories();
  };

  // Reorder: tukar sortOrder dua kategori
  const reorder = async (id, direction, allCats) => {
    const idx = allCats.findIndex(c => c.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= allCats.length) return;

    const a = allCats[idx];
    const b = allCats[swapIdx];

    await Promise.all([
      fetch(`/api/categories/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
      fetch(`/api/categories/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
    ]);
    await fetchCategories();
  };

  return {
    categories,
    loading,
    refetch: fetchCategories,
    fetchAll,
    addCategory,
    updateCategory,
    deleteCategory,
    reorder,
  };
}
