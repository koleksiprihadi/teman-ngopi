// src/app/menu/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import { formatRupiah } from '@/utils/currency';

export default function MenuPage() {
  const [products, setProducts]       = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]           = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchMenu();
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => setApiCategories(data.filter(c => c.isActive)))
      .catch(() => {});
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/products?public=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.filter(p => p.isAvailable !== false));
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gunakan urutan dari API categories, fallback ke kategori dari produk
  const categories = useMemo(() => {
    if (apiCategories.length > 0) {
      // Hanya tampilkan kategori yang punya produk
      const productCats = new Set(products.map(p => p.category));
      return apiCategories.filter(c => productCats.has(c.name));
    }
    return [...new Set(products.map(p => p.category).filter(Boolean))]
      .map(name => ({ name, icon: '🍽️', color: '#8B4513' }));
  }, [products, apiCategories]);

  const getCategoryIcon = (catName) => {
    return apiCategories.find(c => c.name === catName)?.icon || '🍽️';
  };

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, search]);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero Header */}
      <header className="bg-coffee-gradient text-cream-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-16 text-center">
          <div className="text-5xl mb-4">☕</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2 text-shadow">Teman Ngopi</h1>
          <p className="text-white/60 text-lg">Selalu Ada, Selalu Hangat</p>
          <p className="text-white/40 text-sm mt-2">Menu kami hari ini</p>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="sticky top-0 z-10 bg-white border-b border-coffee-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400">🔍</span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-cream-100 border-2 border-coffee-100 focus:border-coffee-400 rounded-xl py-2.5 pl-9 pr-4 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {/* Semua */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-coffee-800 text-cream-100'
                  : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
              }`}
            >
              🍽️ Semua
            </button>

            {/* Kategori dinamis */}
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2`}
                style={
                  activeCategory === cat.name
                    ? { background: cat.color, borderColor: cat.color, color: 'white' }
                    : { background: cat.color + '18', borderColor: cat.color + '55', color: cat.color }
                }
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-5xl animate-spin-slow mb-4">☕</div>
            <p className="text-coffee-400">Memuat menu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-coffee-400 font-medium">Menu tidak ditemukan</p>
          </div>
        ) : (
          <>
            {/* Category Sections */}
            {activeCategory === 'all' ? (
              categories.map(cat => {
                const catProducts = filtered.filter(p => p.category === cat.name);
                if (catProducts.length === 0) return null;
                return (
                  <section key={cat.name} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{cat.icon}</span>
                      <h2 className="font-display text-xl font-bold text-coffee-900">{cat.name}</h2>
                      <div className="flex-1 h-px bg-coffee-200" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {catProducts.map(product => (
                        <MenuCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map(product => (
                  <MenuCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="aspect-video bg-coffee-100 relative">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {getCategoryIcon(selectedProduct.category)}
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-coffee-900">{selectedProduct.name}</h3>
                  <p className="text-xs text-coffee-400 mt-0.5">{selectedProduct.category}</p>
                </div>
                <p className="font-display text-xl font-bold text-coffee-800 flex-shrink-0">
                  {formatRupiah(selectedProduct.price)}
                </p>
              </div>
              {selectedProduct.description && (
                <p className="text-sm text-coffee-600 mt-3 leading-relaxed">{selectedProduct.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-coffee-900 text-cream-100/60 text-center py-6 text-sm mt-8">
        <p>☕ Teman Ngopi · Selalu Ada, Selalu Hangat</p>
        <p className="text-xs mt-1 text-cream-100/30">Jam buka: 08:00 - 22:00</p>
      </footer>
    </div>
  );
}

function MenuCard({ product, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-coffee-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden text-left group"
    >
      <div className="aspect-square bg-coffee-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-coffee-100 to-coffee-200">
            {getCategoryIcon(product.category)}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-coffee-900 leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs font-bold text-coffee-600 mt-1">{formatRupiah(product.price)}</p>
      </div>
    </button>
  );
}
