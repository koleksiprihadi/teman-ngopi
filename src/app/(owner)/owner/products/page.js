// src/app/(owner)/owner/products/page.js
'use client';
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { formatRupiah } from '@/utils/currency';
import toast from 'react-hot-toast';

const CATEGORIES = ['Kopi', 'Non-Kopi', 'Makanan', 'Snack', 'Minuman', 'Dessert'];

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = (products || []).filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleEdit = (p) => { setEditProduct(p); setShowForm(true); };
  const handleNew = () => { setEditProduct(null); setShowForm(true); };

  const handleDelete = async (p) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    await deleteProduct(p.id);
    toast.success('Produk dihapus');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-coffee-900">🍽️ Kelola Produk</h1>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2">
          ➕ Tambah Produk
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400">🔍</span>
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product List */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => handleEdit(product)}
            onDelete={() => handleDelete(product)}
            onToggleAvail={async () => {
              await updateProduct(product.id, { isAvailable: !product.isAvailable });
              toast.success(product.isAvailable ? 'Produk dinonaktifkan' : 'Produk diaktifkan');
            }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-coffee-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>Produk tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editProduct) {
              await updateProduct(editProduct.id, data);
              toast.success('Produk diperbarui ✅');
            } else {
              await addProduct(data);
              toast.success('Produk ditambahkan ✅');
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete, onToggleAvail }) {
  return (
    <div className={`card flex gap-3 ${!product.isAvailable ? 'opacity-60' : ''}`}>
      <div className="w-16 h-16 rounded-xl bg-coffee-100 flex-shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">☕</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-coffee-900 text-sm leading-tight">{product.name}</p>
            <p className="text-xs text-coffee-400 mt-0.5">{product.category}</p>
          </div>
          <span className={`badge flex-shrink-0 ${product.isAvailable ? 'badge-green' : 'badge-red'}`}>
            {product.isAvailable ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <p className="font-bold text-coffee-800 text-sm mt-1">{formatRupiah(product.price)}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={onEdit} className="text-xs text-coffee-600 hover:text-coffee-800 font-medium">✏️ Edit</button>
          <button onClick={onToggleAvail} className="text-xs text-amber-600 hover:text-amber-800 font-medium">
            {product.isAvailable ? '🚫 Nonaktif' : '✅ Aktif'}
          </button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 font-medium">🗑️</button>
        </div>
      </div>
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Kopi',
    price: product?.price || '',
    cost: product?.cost || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    isAvailable: product?.isAvailable ?? true,
    unit: product?.unit || 'cup',
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return; }
    setSaving(true);
    await onSave({ ...form, price: Number(form.price), cost: Number(form.cost) || 0 });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-coffee-gradient px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-cream-100">
              {product ? '✏️ Edit Produk' : '➕ Tambah Produk'}
            </h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Nama Produk *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} className="input-field" placeholder="Contoh: Kopi Susu" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Kategori</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Satuan</label>
              <select value={form.unit} onChange={e => setField('unit', e.target.value)} className="input-field">
                {['cup', 'pcs', 'porsi', 'botol', 'kg', 'gram'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Harga Jual (Rp) *</label>
              <input type="number" value={form.price} onChange={e => setField('price', e.target.value)} className="input-field" placeholder="0" required inputMode="numeric" />
            </div>
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Harga Modal (Rp)</label>
              <input type="number" value={form.cost} onChange={e => setField('cost', e.target.value)} className="input-field" placeholder="0" inputMode="numeric" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">URL Gambar</label>
            <input type="url" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)} className="input-field" rows={2} placeholder="Deskripsi singkat..." />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setField('isAvailable', !form.isAvailable)}
              className={`w-12 h-6 rounded-full transition-all relative ${form.isAvailable ? 'bg-coffee-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isAvailable ? 'left-6' : 'left-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-coffee-700">Produk tersedia / aktif</span>
          </label>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary py-3">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary py-3">
              {saving ? '⏳...' : '✅ Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
