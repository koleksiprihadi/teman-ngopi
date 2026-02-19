// src/app/(kasir)/kasir/page.js
'use client';
import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/lib/auth/authContext';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { addToSyncQueue, generateInvoiceNumber } from '@/lib/dexie/db';
import { formatRupiah } from '@/utils/currency';
import { isAfterCutOff, formatDateTime, getTodayString } from '@/utils/date';
import { printReceipt } from '@/utils/print';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import PaymentModal from '@/components/pos/PaymentModal';
import OpenBillModal from '@/components/pos/OpenBillModal';
import CartItem from '@/components/pos/CartItem';

const CATEGORIES_ICON = {
  'all': '🍽️',
  'Kopi': '☕',
  'Non-Kopi': '🧃',
  'Makanan': '🍱',
  'Snack': '🍪',
  'Minuman': '🥤',
  'Dessert': '🍮',
};

export default function KasirPage() {
  const { user, profile } = useAuth();
  const { products, categories } = useProducts();
  const { items, subtotal, total, discount, setDiscount, addItem, removeItem, updateQuantity, clearCart, loadFromOpenBill, isEmpty, itemCount } = useCart();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showOpenBills, setShowOpenBills] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [editingOpenBill, setEditingOpenBill] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'cart'

  // Load today's cash book
  const cashBook = useLiveQuery(() =>
    db.cash_books.where('date').equals(getTodayString()).first()
  , []);

  // Open bills count
  const openBillsCount = useLiveQuery(() =>
    db.open_bills.where('status').equals('OPEN').count()
  , []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = products.filter(p => p.isAvailable !== false);
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  const handlePayment = async ({ paymentMethod, amountPaid }) => {
    const change = paymentMethod === 'TUNAI' ? amountPaid - total : 0;
    const invoiceNumber = await generateInvoiceNumber();
    const isGantung = isAfterCutOff(cashBook?.cutOffTime || '22:00');

    const transactionId = editingOpenBill?.serverId || uuidv4();

    const transaction = {
      id: transactionId,
      invoiceNumber,
      cashierId: profile?.serverId || profile?.id || user?.id,
      cashierName: profile?.name || 'Kasir',
      cashBookId: cashBook?.serverId || null,
      subtotal,
      tax: 0,
      discount,
      total,
      paymentMethod,
      amountPaid,
      change,
      status: 'COMPLETED',
      isGantung,
      items: items.map(i => ({ ...i, id: uuidv4() })),
      createdAt: new Date().toISOString(),
    };

    // Save to Dexie
    await db.transaction('rw', db.transactions, db.transaction_items, db.open_bills, async () => {
      const localId = await db.transactions.add({ ...transaction, serverId: null });

      for (const item of transaction.items) {
        await db.transaction_items.add({
          ...item,
          transactionId: localId,
          serverId: null,
        });
      }

      if (editingOpenBill) {
        await db.open_bills.update(editingOpenBill.id, { status: 'PAID' });
      }
    });

    await addToSyncQueue('transaction', transactionId, 'CREATE', transaction);

    // Update cash book totals locally
    if (cashBook && !isGantung) {
      const updates = paymentMethod === 'TUNAI'
        ? { totalCash: (cashBook.totalCash || 0) + total }
        : { totalNonCash: (cashBook.totalNonCash || 0) + total };
      await db.cash_books.update(cashBook.id, updates);
    }

    toast.success(
      isGantung
        ? `⏰ Transaksi tersimpan sebagai GANTUNG (setelah cut-off)`
        : `✅ Transaksi berhasil! ${paymentMethod === 'TUNAI' ? `Kembalian: ${formatRupiah(change)}` : 'Non Tunai'}`,
      { duration: 4000 }
    );

    // Print receipt
    printReceipt(transaction, transaction.items, profile?.name || 'Kasir');

    clearCart();
    setEditingOpenBill(null);
    setShowPayment(false);
    setActiveTab('products');
  };

  const handleSaveOpenBill = async ({ tableNumber, customerName }) => {
    const openBillId = uuidv4();
    const openBill = {
      id: openBillId,
      tableNumber,
      customerName,
      cashierId: profile?.serverId || user?.id,
      items: items.map(i => ({ ...i, id: uuidv4() })),
      subtotal,
      total,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    await db.transaction('rw', db.open_bills, db.open_bill_items, async () => {
      const localId = await db.open_bills.add({ ...openBill, serverId: null });
      for (const item of openBill.items) {
        await db.open_bill_items.add({ ...item, openBillId: localId });
      }
    });

    await addToSyncQueue('open_bill', openBillId, 'CREATE', openBill);

    toast.success(`📋 Open Bill disimpan! ${tableNumber ? `Meja ${tableNumber}` : customerName}`);
    clearCart();
    setShowCart(false);
    setActiveTab('products');
  };

  const handleLoadOpenBill = (openBill) => {
    loadFromOpenBill(openBill);
    setEditingOpenBill(openBill);
    setShowOpenBills(false);
    setActiveTab('cart');
    toast.success(`📋 Open Bill dimuat: ${openBill.tableNumber ? `Meja ${openBill.tableNumber}` : openBill.customerName}`);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* ======= LEFT PANEL: Products ======= */}
      <div className={`flex flex-col flex-1 overflow-hidden ${activeTab === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        {/* Search + Tools */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-2 bg-cream-50 border-b border-coffee-100">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-coffee-100 focus:border-coffee-400 rounded-xl py-2.5 pl-9 pr-4 text-sm text-coffee-900 placeholder-coffee-300 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setShowOpenBills(true)}
            className="relative flex-shrink-0 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
          >
            📋 <span className="hidden sm:block">Open Bill</span>
            {openBillsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {openBillsCount}
              </span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide bg-cream-50 border-b border-coffee-100 flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-coffee-800 text-cream-100 shadow-coffee'
                  : 'bg-white text-coffee-700 border border-coffee-200 hover:border-coffee-400'
              }`}
            >
              <span>{CATEGORIES_ICON[cat] || '📦'}</span>
              <span className="capitalize">{cat === 'all' ? 'Semua' : cat}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {!products ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-spin-slow">☕</div>
                <p className="text-coffee-400">Memuat produk...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-3">😕</div>
                <p className="text-coffee-400 font-medium">Produk tidak ditemukan</p>
                <p className="text-coffee-300 text-sm mt-1">Coba kata kunci lain</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => {
                    addItem(product);
                    setActiveTab('cart');
                  }}
                  inCart={items.find(i => i.productId === (product.serverId || product.id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======= RIGHT PANEL: Cart ======= */}
      <div className={`flex flex-col lg:w-80 xl:w-96 border-l border-coffee-100 bg-white overflow-hidden ${
        activeTab === 'products' ? 'hidden lg:flex' : 'flex flex-1'
      }`}>
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-coffee-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-coffee-900 flex items-center gap-2">
              🛒 Pesanan
              {!isEmpty && (
                <span className="bg-coffee-800 text-cream-100 text-xs px-2 py-0.5 rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </h2>
            {editingOpenBill && (
              <p className="text-xs text-amber-600 font-medium mt-0.5">
                📋 Edit: {editingOpenBill.tableNumber ? `Meja ${editingOpenBill.tableNumber}` : editingOpenBill.customerName}
              </p>
            )}
          </div>
          {!isEmpty && (
            <button
              onClick={() => { clearCart(); setEditingOpenBill(null); }}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Hapus semua
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-coffee-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                🛒
              </div>
              <p className="text-coffee-400 font-medium">Keranjang kosong</p>
              <p className="text-coffee-300 text-sm mt-1">Pilih produk untuk mulai pesanan</p>
            </div>
          ) : (
            <div className="divide-y divide-coffee-50">
              {items.map(item => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onRemove={() => removeItem(item.productId)}
                  onQuantityChange={(qty) => updateQuantity(item.productId, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary + Actions */}
        {!isEmpty && (
          <div className="border-t border-coffee-100 p-4 space-y-3 flex-shrink-0">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-coffee-600 flex-shrink-0">Diskon:</label>
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="0"
                className="flex-1 border border-coffee-200 focus:border-coffee-400 rounded-lg px-2 py-1.5 text-sm text-right outline-none"
              />
            </div>

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-coffee-600">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>Diskon</span>
                  <span>- {formatRupiah(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-coffee-900 pt-2 border-t border-coffee-100 text-base">
                <span>Total</span>
                <span className="text-coffee-800">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCart(true)}
                className="py-2.5 rounded-xl border-2 border-coffee-300 text-coffee-700 font-semibold text-sm hover:bg-coffee-50 transition-all active:scale-95"
              >
                📋 Gantung
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="py-2.5 rounded-xl bg-coffee-800 hover:bg-coffee-900 text-cream-100 font-bold text-sm transition-all active:scale-95 shadow-coffee"
              >
                💳 Bayar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Tab Switch */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-coffee-200 safe-bottom">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'products'
                ? 'text-coffee-800 border-t-2 border-coffee-800'
                : 'text-coffee-400'
            }`}
          >
            <span>🍽️</span> Menu
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'cart'
                ? 'text-coffee-800 border-t-2 border-coffee-800'
                : 'text-coffee-400'
            }`}
          >
            <span>🛒</span> Keranjang
            {!isEmpty && (
              <span className="absolute top-2 right-6 bg-coffee-800 text-cream-100 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={handlePayment}
          onClose={() => setShowPayment(false)}
          cashBook={cashBook}
        />
      )}

      {showCart && (
        <OpenBillModal
          onSave={handleSaveOpenBill}
          onClose={() => setShowCart(false)}
        />
      )}

      {showOpenBills && (
        <OpenBillsListModal
          onLoad={handleLoadOpenBill}
          onClose={() => setShowOpenBills(false)}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onAdd, inCart }) {
  return (
    <button
      onClick={onAdd}
      className={`group bg-white rounded-2xl border-2 transition-all duration-200 active:scale-95 overflow-hidden text-left shadow-card hover:shadow-card-hover ${
        inCart ? 'border-coffee-400' : 'border-coffee-100 hover:border-coffee-300'
      }`}
    >
      {/* Image */}
      <div className="aspect-square bg-coffee-100 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-coffee-100 to-coffee-200">
            {CATEGORIES_ICON[product.category] || '☕'}
          </div>
        )}
        {inCart && (
          <div className="absolute top-1.5 right-1.5 bg-coffee-800 text-cream-100 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
            {inCart.quantity}
          </div>
        )}
        {product.stock !== null && product.stock !== undefined && product.stock <= 5 && (
          <div className="absolute bottom-1 left-1 bg-red-500/90 text-white text-xs px-1.5 py-0.5 rounded-full">
            Sisa {product.stock}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-semibold text-coffee-900 leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs text-coffee-400 mt-0.5 font-medium">{formatRupiah(product.price)}</p>
      </div>
    </button>
  );
}

// Open Bills List Modal
function OpenBillsListModal({ onLoad, onClose }) {
  const openBills = useLiveQuery(() =>
    db.open_bills.where('status').equals('OPEN').reverse().sortBy('createdAt')
  , []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-coffee-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-display text-lg font-semibold text-coffee-900">📋 Open Bills</h3>
          <button onClick={onClose} className="text-coffee-400 hover:text-coffee-700 text-xl">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {!openBills || openBills.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-coffee-400">Tidak ada open bill</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {openBills.map(bill => (
                <button
                  key={bill.id}
                  onClick={() => onLoad(bill)}
                  className="w-full bg-coffee-50 hover:bg-coffee-100 rounded-xl p-4 text-left transition-all border border-coffee-200 hover:border-coffee-400"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-coffee-900">
                        {bill.tableNumber ? `🪑 Meja ${bill.tableNumber}` : `👤 ${bill.customerName}`}
                      </p>
                      <p className="text-xs text-coffee-400 mt-1">{formatDateTime(bill.createdAt)}</p>
                      <p className="text-xs text-coffee-600 mt-0.5">
                        {bill.items?.length || 0} item
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-800">{formatRupiah(bill.total)}</p>
                      <span className="badge-amber mt-1">OPEN</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
