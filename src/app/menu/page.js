// src/app/menu/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { formatRupiah } from '@/utils/currency';

export default function MenuPage() {
  const [products, setProducts]         = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]             = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?public=true').then(r => r.ok ? r.json() : []),
      fetch('/api/categories').then(r => r.ok ? r.json() : []),
    ]).then(([prods, cats]) => {
      setProducts(prods.filter(p => p.isAvailable !== false));
      setApiCategories(cats.filter(c => c.isActive));
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  // Kategori yang benar-benar punya produk, urut dari API
  const categories = useMemo(() => {
    const productCats = new Set(products.map(p => p.category));
    if (apiCategories.length > 0) {
      return apiCategories.filter(c => productCats.has(c.name));
    }
    return [...productCats].map(name => ({ name, icon: '🍽️', color: '#8B4513' }));
  }, [products, apiCategories]);

  // Map nama kategori → object untuk lookup cepat
  const catMap = useMemo(() => {
    const m = {};
    apiCategories.forEach(c => { m[c.name] = c; });
    return m;
  }, [apiCategories]);

  const getCatIcon  = (name) => catMap[name]?.icon  || '🍽️';
  const getCatColor = (name) => catMap[name]?.color || '#8B4513';

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, search]);

  return (
    <div className="min-h-screen bg-cream-100">

      {/* ── Hero ── */}
      <header className="bg-coffee-gradient text-cream-100 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-14 text-center">
          <div className="text-5xl mb-3">☕</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">Teman Ngopi</h1>
          <p className="text-white/60 text-base">Selalu Ada, Selalu Hangat</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/40">
            <span>🕗 08:00 – 22:00</span>
            <span>·</span>
            <span>{products.length} menu tersedia</span>
          </div>
        </div>
      </header>

      {/* ── Sticky Search + Filter ── */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-coffee-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-2.5">

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400 pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cream-100 border-2 border-coffee-100 focus:border-coffee-400 rounded-xl py-2.5 pl-9 pr-4 outline-none transition-all text-sm font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-300 hover:text-coffee-600 text-lg leading-none"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {/* Semua */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-coffee-800 text-cream-100 shadow-md'
                  : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
              }`}
            >
              🍽️ Semua
            </button>

            {/* Per Kategori */}
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                style={
                  activeCategory === cat.name
                    ? { background: cat.color, borderColor: cat.color, color: '#fff' }
                    : { background: cat.color + '18', borderColor: cat.color + '66', color: cat.color }
                }
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border-2"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Konten ── */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="text-5xl animate-spin-slow mb-4">☕</div>
            <p className="text-coffee-400 font-medium">Memuat menu...</p>
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <p className="font-display text-xl font-semibold text-coffee-700 mb-2">
              {search ? `"${search}" tidak ditemukan` : 'Menu tidak tersedia'}
            </p>
            <p className="text-coffee-400 text-sm">
              {search ? 'Coba kata kunci lain' : 'Kategori ini belum ada produk'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-sm text-coffee-600 underline"
              >
                Hapus pencarian
              </button>
            )}
          </div>

        ) : activeCategory === 'all' ? (
          /* Mode Semua — tampil per seksi kategori */
          categories.map(cat => {
            const catProds = filtered.filter(p => p.category === cat.name);
            if (catProds.length === 0) return null;
            return (
              <section key={cat.name} className="mb-10">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                    style={{ background: cat.color + '22', border: `2px solid ${cat.color}44` }}
                  >
                    {cat.icon}
                  </div>
                  <h2 className="font-display text-xl font-bold text-coffee-900">{cat.name}</h2>
                  <div className="flex-1 h-px" style={{ background: cat.color + '33' }} />
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: cat.color + '18', color: cat.color }}
                  >
                    {catProds.length} menu
                  </span>
                </div>

                {/* Grid produk */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {catProds.map(product => (
                    <MenuCard
                      key={product.id}
                      product={product}
                      categoryIcon={getCatIcon(product.category)}
                      categoryColor={getCatColor(product.category)}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          /* Mode Filter Kategori — flat grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(product => (
              <MenuCard
                key={product.id}
                product={product}
                categoryIcon={getCatIcon(product.category)}
                categoryColor={getCatColor(product.category)}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal Detail Produk ── */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Gambar */}
            <div className="relative">
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div
                  className="w-full h-56 flex items-center justify-center text-7xl"
                  style={{ background: getCatColor(selectedProduct.category) + '22' }}
                >
                  {getCatIcon(selectedProduct.category)}
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors text-sm"
              >
                ✕
              </button>
              {/* Badge kategori */}
              <div
                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: getCatColor(selectedProduct.category),
                  color: 'white',
                }}
              >
                {getCatIcon(selectedProduct.category)}
                {selectedProduct.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-display text-xl font-bold text-coffee-900 leading-tight">
                  {selectedProduct.name}
                </h3>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-xl font-bold text-coffee-800">
                    {formatRupiah(selectedProduct.price)}
                  </p>
                  {selectedProduct.unit && (
                    <p className="text-xs text-coffee-400">per {selectedProduct.unit}</p>
                  )}
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-coffee-600 leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              <button
                onClick={() => setSelectedProduct(null)}
                className="mt-5 w-full py-3 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-semibold rounded-xl text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-coffee-900 text-cream-100/50 text-center py-8 text-sm mt-4">
        <div className="text-2xl mb-2">☕</div>
        <p className="font-semibold text-cream-100/80">Teman Ngopi</p>
        <p className="text-xs mt-1">Selalu Ada, Selalu Hangat</p>
        <p className="text-xs mt-2 text-cream-100/30">Jam buka: 08:00 – 22:00</p>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MenuCard — menerima icon & color sebagai prop
───────────────────────────────────────────── */
function MenuCard({ product, categoryIcon, categoryColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-coffee-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden text-left group"
    >
      {/* Gambar */}
      <div className="aspect-square overflow-hidden" style={{ background: categoryColor + '18' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {categoryIcon}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-bold text-coffee-900 leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>
        <p className="text-xs font-bold" style={{ color: categoryColor }}>
          {formatRupiah(product.price)}
        </p>
      </div>
    </button>
  );
}
