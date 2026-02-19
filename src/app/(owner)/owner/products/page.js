// src/app/(owner)/owner/products/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { formatRupiah } from '@/utils/currency';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(data.filter(c => c.isActive)))
      .catch(() => {});
  }, []);

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
        <div className="flex items-center gap-2">
          <Link href="/owner/categories" className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-3">
            🏷️ Kelola Kategori
          </Link>
          <button onClick={handleNew} className="btn-primary flex items-center gap-2">
            ➕ Tambah Produk
          </button>
        </div>
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
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-coffee-500">
        <span>{filtered.length} produk</span>
        <span>·</span>
        <span>{filtered.filter(p => p.isAvailable !== false).length} aktif</span>
        <span>·</span>
        <span>{filtered.filter(p => p.isAvailable === false).length} nonaktif</span>
      </div>

      {/* Product List */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            categoryIcon={categories.find(c => c.name === product.category)?.icon}
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
            <p className="font-medium">Produk tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
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

/* ─────────────────────────────────────────────
   ProductCard
───────────────────────────────────────────── */
function ProductCard({ product, categoryIcon, onEdit, onDelete, onToggleAvail }) {
  return (
    <div className={`card flex gap-3 ${!product.isAvailable ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-coffee-100 flex-shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {categoryIcon || '☕'}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-coffee-900 text-sm leading-tight truncate">{product.name}</p>
            <p className="text-xs text-coffee-400 mt-0.5">{product.category}</p>
          </div>
          <span className={`badge flex-shrink-0 ${product.isAvailable ? 'badge-green' : 'badge-red'}`}>
            {product.isAvailable ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <p className="font-bold text-coffee-800 text-sm mt-1">{formatRupiah(product.price)}</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onEdit} className="text-xs text-coffee-600 hover:text-coffee-800 font-semibold">✏️ Edit</button>
          <button onClick={onToggleAvail} className="text-xs text-amber-600 hover:text-amber-800 font-semibold">
            {product.isAvailable ? '🚫 Nonaktif' : '✅ Aktif'}
          </button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 font-semibold">🗑️</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ProductFormModal — dengan upload gambar
───────────────────────────────────────────── */
function ProductFormModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || (categories[0]?.name || ''),
    price: product?.price || '',
    cost: product?.cost || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    isAvailable: product?.isAvailable ?? true,
    unit: product?.unit || 'cup',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl || '');
  const [uploadedPath, setUploadedPath] = useState(null); // path di storage untuk delete
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* ── Upload file ke Supabase melalui API ── */
  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload gagal');
      setField('imageUrl', data.url);
      setPreviewUrl(data.url);
      setUploadedPath(data.path);
      toast.success('✅ Gambar berhasil diunggah');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Tampilkan preview lokal dulu sebelum upload
      setPreviewUrl(URL.createObjectURL(file));
      uploadFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      uploadFile(file);
    }
  };

  const handleRemoveImage = async () => {
    // Hapus dari storage jika ini file yang baru diupload sesi ini
    if (uploadedPath) {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: uploadedPath }),
      });
      setUploadedPath(null);
    }
    setField('imageUrl', '');
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return; }
    if (uploading) { toast.error('Tunggu gambar selesai diunggah'); return; }
    setSaving(true);
    await onSave({ ...form, price: Number(form.price), cost: Number(form.cost) || 0 });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-coffee-gradient px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-cream-100">
              {product ? '✏️ Edit Produk' : '➕ Tambah Produk'}
            </h3>
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* ── Upload Gambar ── */}
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-2">
              Foto Produk
            </label>

            {previewUrl ? (
              /* Preview gambar yang sudah ada / sudah diupload */
              <div className="relative rounded-2xl overflow-hidden bg-coffee-100 border-2 border-coffee-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-52 object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-white text-sm font-semibold">Mengunggah...</span>
                  </div>
                )}
                {!uploading && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 hover:bg-white text-coffee-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
                    >
                      🔄 Ganti
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-8 gap-3 ${
                  dragOver
                    ? 'border-coffee-500 bg-coffee-50'
                    : 'border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50/50'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-10 h-10 border-4 border-coffee-300 border-t-coffee-700 rounded-full animate-spin" />
                    <p className="text-sm text-coffee-500 font-medium">Mengunggah gambar...</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-coffee-100 rounded-2xl flex items-center justify-center text-3xl">📷</div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-coffee-700">
                        {dragOver ? 'Lepaskan untuk upload' : 'Klik atau drag gambar ke sini'}
                      </p>
                      <p className="text-xs text-coffee-400 mt-1">JPG, PNG, WebP · Maks 3MB</p>
                    </div>
                    <span className="text-xs bg-coffee-100 text-coffee-600 font-semibold px-4 py-1.5 rounded-full">
                      📂 Pilih File
                    </span>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Atau pakai URL */}
            <div className="mt-2">
              <p className="text-xs text-coffee-400 mb-1 text-center">— atau isi URL gambar —</p>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => {
                  setField('imageUrl', e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="input-field text-sm"
                placeholder="https://contoh.com/gambar.jpg"
              />
            </div>
          </div>

          {/* ── Nama Produk ── */}
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
              Nama Produk <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="input-field"
              placeholder="Contoh: Kopi Susu"
              required
            />
          </div>

          {/* ── Kategori & Satuan ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Kategori</label>
              {categories.length > 0 ? (
                <select
                  value={form.category}
                  onChange={e => setField('category', e.target.value)}
                  className="input-field"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="input-field text-coffee-400 text-sm flex items-center gap-2">
                  <Link href="/owner/categories" className="text-coffee-600 underline text-xs">
                    ➕ Tambah kategori dulu
                  </Link>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Satuan</label>
              <select value={form.unit} onChange={e => setField('unit', e.target.value)} className="input-field">
                {['cup', 'pcs', 'porsi', 'botol', 'kg', 'gram'].map(u => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Harga ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
                Harga Jual (Rp) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={e => setField('price', e.target.value)}
                className="input-field"
                placeholder="0"
                required
                inputMode="numeric"
                min={0}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
                Harga Modal (Rp)
              </label>
              <input
                type="number"
                value={form.cost}
                onChange={e => setField('cost', e.target.value)}
                className="input-field"
                placeholder="0"
                inputMode="numeric"
                min={0}
              />
            </div>
          </div>

          {/* ── Deskripsi ── */}
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              className="input-field resize-none"
              rows={2}
              placeholder="Deskripsi singkat produk..."
            />
          </div>

          {/* ── Toggle Aktif ── */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setField('isAvailable', !form.isAvailable)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                form.isAvailable ? 'bg-coffee-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                form.isAvailable ? 'left-6' : 'left-0.5'
              }`} />
            </div>
            <span className="text-sm font-medium text-coffee-700">
              {form.isAvailable ? '🟢 Produk aktif & tersedia' : '🔴 Produk tidak aktif'}
            </span>
          </label>

          {/* ── Action Buttons ── */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary py-3">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="btn-primary py-3 disabled:opacity-50"
            >
              {uploading ? '⏳ Mengupload...' : saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : '✅ Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
