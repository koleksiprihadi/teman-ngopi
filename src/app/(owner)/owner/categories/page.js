// src/app/(owner)/owner/categories/page.js
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PRESET_ICONS = [
  '☕','🍵','🧃','🥤','🍹','🧋',
  '🍱','🍜','🍛','🍝','🥗','🥙',
  '🍞','🥐','🥞','🧇','🥨','🫓',
  '🍪','🍩','🍰','🎂','🍮','🍦',
  '🍟','🧆','🌮','🌯','🥪','🍔',
  '🍱','🧁','🫖','🥛','🍫','🍬',
];

const PRESET_COLORS = [
  { label: 'Kopi', value: '#8B4513' },
  { label: 'Hijau', value: '#059669' },
  { label: 'Biru', value: '#2563EB' },
  { label: 'Ungu', value: '#7C3AED' },
  { label: 'Merah', value: '#DC2626' },
  { label: 'Oranye', value: '#EA580C' },
  { label: 'Kuning', value: '#CA8A04' },
  { label: 'Pink', value: '#DB2777' },
  { label: 'Abu', value: '#6B7280' },
  { label: 'Cyan', value: '#0891B2' },
];

const EMPTY_FORM = { name: '', icon: '🍽️', color: '#8B4513' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editCat, setEditCat]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [customIcon, setCustomIcon] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch { toast.error('Gagal memuat kategori'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditCat(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setShowIconPicker(false);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowForm(true);
    setShowIconPicker(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditCat(null);
    setForm(EMPTY_FORM);
    setShowIconPicker(false);
    setCustomIcon('');
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama kategori tidak boleh kosong'); return; }
    setSaving(true);
    try {
      if (editCat) {
        const payload = { ...form };
        if (form.name !== editCat.name) payload.oldName = editCat.name;
        const res = await fetch(`/api/categories/${editCat.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) { toast.success('✅ Kategori diperbarui'); closeForm(); fetchAll(); }
        else toast.error(data.message || 'Gagal memperbarui');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) { toast.success('✅ Kategori ditambahkan'); closeForm(); fetchAll(); }
        else toast.error(data.message || 'Gagal menambah');
      }
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (res.ok) {
        toast.success(cat.isActive ? 'Kategori dinonaktifkan' : 'Kategori diaktifkan');
        fetchAll();
      }
    } catch { toast.error('Gagal mengubah status'); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { toast.success('🗑️ Kategori dihapus'); fetchAll(); }
      else toast.error(data.message || 'Gagal menghapus');
    } catch { toast.error('Gagal menghapus kategori'); }
    finally { setDeleteConfirm(null); }
  };

  const handleReorder = async (cat, direction) => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(c => c.id === cat.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    try {
      await Promise.all([
        fetch(`/api/categories/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
        fetch(`/api/categories/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
      ]);
      fetchAll();
    } catch { toast.error('Gagal mengubah urutan'); }
  };

  const handleCustomIcon = () => {
    if (customIcon) { setField('icon', customIcon); setCustomIcon(''); }
  };

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="p-4 lg:p-6 space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-coffee-900">🏷️ Kelola Kategori</h1>
          <p className="text-sm text-coffee-400 mt-0.5">
            {categories.length} kategori · {categories.filter(c => c.isActive).length} aktif
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          ➕ Tambah Kategori
        </button>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <span className="text-xl flex-shrink-0">💡</span>
        <div className="text-sm text-amber-800">
          <strong>Tips:</strong> Kategori yang kamu buat akan muncul di kasir POS dan menu publik.
          Urutkan sesuai prioritas tampil dengan tombol ▲▼. Kategori yang dinonaktifkan tidak akan muncul di kasir.
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="text-4xl animate-spin-slow">☕</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-14">
          <div className="text-5xl mb-4">🏷️</div>
          <p className="font-display text-lg font-semibold text-coffee-800 mb-2">Belum ada kategori</p>
          <p className="text-coffee-400 text-sm mb-5">Buat kategori pertama untuk mengorganisir produkmu</p>
          <button onClick={openCreate} className="btn-primary mx-auto">➕ Tambah Kategori</button>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((cat, idx) => (
            <div
              key={cat.id}
              className={`bg-white border-2 rounded-2xl px-4 py-3 flex items-center gap-4 transition-all ${
                cat.isActive ? 'border-coffee-100' : 'border-dashed border-coffee-200 opacity-55'
              }`}
            >
              {/* Drag handle & order */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => handleReorder(cat, 'up')}
                  disabled={idx === 0}
                  className="w-6 h-6 flex items-center justify-center text-coffee-300 hover:text-coffee-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleReorder(cat, 'down')}
                  disabled={idx === sorted.length - 1}
                  className="w-6 h-6 flex items-center justify-center text-coffee-300 hover:text-coffee-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs leading-none"
                >
                  ▼
                </button>
              </div>

              {/* Icon preview */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                style={{ backgroundColor: cat.color + '22', border: `2px solid ${cat.color}44` }}
              >
                {cat.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-coffee-900">{cat.name}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: cat.color + '22', color: cat.color }}
                  >
                    #{idx + 1}
                  </span>
                  {!cat.isActive && (
                    <span className="badge badge-red text-xs">Nonaktif</span>
                  )}
                </div>
                <div className="text-xs text-coffee-400 mt-0.5 flex items-center gap-3">
                  <span>Urutan: {cat.sortOrder}</span>
                  <span
                    className="w-3 h-3 rounded-full inline-block border"
                    style={{ background: cat.color }}
                    title={cat.color}
                  />
                  <span>{cat.color}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    cat.isActive
                      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {cat.isActive ? '🚫' : '✅'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(cat)}
                  className="py-1.5 px-3 text-xs font-semibold rounded-lg border bg-red-50 border-red-200 text-red-600 hover:bg-red-100 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview tampilan di kasir */}
      {categories.length > 0 && (
        <div className="card">
          <div className="font-display text-sm font-semibold text-coffee-700 mb-3">
            👁️ Preview Tampilan di Kasir
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-coffee-800 text-cream-100">
              🍽️ Semua
            </div>
            {sorted.filter(c => c.isActive).map(cat => (
              <div
                key={cat.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 bg-white"
                style={{ borderColor: cat.color, color: cat.color }}
              >
                {cat.icon} {cat.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-coffee-gradient px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-cream-100">
                  {editCat ? '✏️ Edit Kategori' : '🏷️ Tambah Kategori'}
                </h3>
                {editCat && <p className="text-white/50 text-xs mt-0.5">"{editCat.name}"</p>}
              </div>
              <button onClick={closeForm} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Preview */}
              <div className="flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2"
                  style={{ background: form.color + '22', borderColor: form.color + '66' }}
                >
                  {form.icon}
                </div>
              </div>

              {/* Nama */}
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
                  Nama Kategori <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className="input-field"
                  placeholder="Contoh: Kopi, Makanan, Snack..."
                  required
                  autoFocus
                />
              </div>

              {/* Icon */}
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Icon</label>
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-coffee-50 border-2 border-coffee-200 flex-shrink-0 cursor-pointer hover:border-coffee-400 transition-all"
                    onClick={() => setShowIconPicker(v => !v)}
                    title="Pilih icon"
                  >
                    {form.icon}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(v => !v)}
                    className="flex-1 py-2 px-3 text-sm text-coffee-600 bg-coffee-50 border-2 border-coffee-200 rounded-xl hover:bg-coffee-100 transition-all font-semibold"
                  >
                    {showIconPicker ? '✕ Tutup picker' : '😀 Pilih icon'}
                  </button>
                </div>

                {showIconPicker && (
                  <div className="bg-coffee-50 border border-coffee-200 rounded-xl p-3 space-y-3">
                    <div className="grid grid-cols-8 gap-1.5">
                      {PRESET_ICONS.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => { setField('icon', icon); setShowIconPicker(false); }}
                          className={`text-xl p-1.5 rounded-lg transition-all hover:bg-coffee-200 ${
                            form.icon === icon ? 'bg-coffee-300 ring-2 ring-coffee-600' : ''
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customIcon}
                        onChange={e => setCustomIcon(e.target.value)}
                        placeholder="Ketik emoji custom..."
                        className="input-field text-center text-lg flex-1"
                        maxLength={4}
                      />
                      <button
                        type="button"
                        onClick={handleCustomIcon}
                        className="btn-primary px-4 flex-shrink-0"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Warna */}
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Warna</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setField('color', c.value)}
                      className={`h-8 rounded-lg transition-all border-2 ${
                        form.color === c.value ? 'border-coffee-900 scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ background: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setField('color', e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-coffee-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setField('color', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                    placeholder="#8B4513"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={closeForm} className="btn-secondary py-3">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary py-3 disabled:opacity-50">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : editCat ? '✅ Simpan Perubahan' : '✅ Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border-2"
                style={{ background: deleteConfirm.color + '22', borderColor: deleteConfirm.color + '44' }}
              >
                {deleteConfirm.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-coffee-900 mb-2">
                Hapus "{deleteConfirm.name}"?
              </h3>
              <p className="text-sm text-coffee-500 mb-6">
                Kategori ini akan dihapus permanen. Pastikan tidak ada produk yang menggunakan kategori ini.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary py-2.5">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger py-2.5">
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
