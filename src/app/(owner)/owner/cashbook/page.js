// src/app/(owner)/owner/cashbook/page.js
'use client';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { addToSyncQueue } from '@/lib/dexie/db';
import { formatRupiah } from '@/utils/currency';
import { formatDate, getTodayString } from '@/utils/date';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export default function CashBookPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expForm, setExpForm] = useState({ description: '', amount: '', category: 'Operasional' });

  const cashBook = useLiveQuery(() =>
    db.cash_books.where('date').equals(selectedDate).first()
  , [selectedDate]);

  const transactions = useLiveQuery(async () => {
    if (!cashBook) return [];
    return db.transactions
      .filter(t => String(t.cashBookId) === String(cashBook.id))
      .reverse()
      .sortBy('createdAt');
  }, [cashBook]);

  const expenses = useLiveQuery(async () => {
    if (!cashBook) return [];
    return db.expenses
      .where('cashBookId').equals(cashBook.id)
      .reverse()
      .sortBy('createdAt');
  }, [cashBook]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!cashBook) { toast.error('Buka buku kas dulu'); return; }
    if (!expForm.description || !expForm.amount) { toast.error('Lengkapi data pengeluaran'); return; }

    const expId = uuidv4();
    const expense = {
      id: expId,
      cashBookId: cashBook.id,
      description: expForm.description,
      amount: Number(expForm.amount),
      category: expForm.category,
      createdAt: new Date().toISOString(),
    };

    await db.expenses.add({ ...expense, serverId: null });
    await db.cash_books.update(cashBook.id, {
      totalExpenses: (cashBook.totalExpenses || 0) + expense.amount,
    });
    await addToSyncQueue('expense', expId, 'CREATE', expense);

    toast.success('✅ Pengeluaran dicatat');
    setExpForm({ description: '', amount: '', category: 'Operasional' });
    setShowExpenseForm(false);
  };

  const handleCloseCashBook = async () => {
    if (!cashBook) return;
    if (!confirm('Tutup buku kas hari ini? Aksi ini tidak dapat dibatalkan.')) return;

    const totalSales = (cashBook.totalCash || 0) + (cashBook.totalNonCash || 0);
    const finalBalance = (cashBook.initialCapital || 0) + (cashBook.totalCash || 0) - (cashBook.totalExpenses || 0);

    await db.cash_books.update(cashBook.id, {
      isClosed: true,
      closedAt: new Date().toISOString(),
      finalBalance,
    });
    await addToSyncQueue('cash_book', cashBook.serverId || cashBook.id, 'UPDATE', {
      ...cashBook, isClosed: true, finalBalance,
    });

    toast.success('📚 Buku kas ditutup!');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-coffee-900">📚 Buku Kas</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input-field w-auto"
        />
      </div>

      {!cashBook ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-coffee-400 font-medium">Tidak ada buku kas untuk tanggal ini</p>
          <p className="text-coffee-300 text-sm mt-1">Pergi ke dashboard untuk membuka buku kas</p>
        </div>
      ) : (
        <>
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`badge text-sm py-1.5 px-3 ${cashBook.isClosed ? 'badge-red' : 'badge-green'}`}>
              {cashBook.isClosed ? '🔒 Ditutup' : '🟢 Aktif'}
            </span>
            {cashBook.isClosed && (
              <span className="text-xs text-coffee-400">Ditutup pada {formatDate(cashBook.closedAt)}</span>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Modal Awal', value: cashBook.initialCapital, icon: '💼', color: 'bg-blue-50 text-blue-800' },
              { label: 'Total Tunai', value: cashBook.totalCash, icon: '💵', color: 'bg-emerald-50 text-emerald-800' },
              { label: 'Non Tunai', value: cashBook.totalNonCash, icon: '💳', color: 'bg-purple-50 text-purple-800' },
              { label: 'Pengeluaran', value: cashBook.totalExpenses, icon: '💸', color: 'bg-red-50 text-red-800' },
            ].map(item => (
              <div key={item.label} className={`card ${item.color} border-none`}>
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-medium opacity-70 mt-1">{item.label}</p>
                <p className="font-bold text-base">{formatRupiah(item.value || 0)}</p>
              </div>
            ))}
          </div>

          {/* Final Balance */}
          <div className="card bg-coffee-gradient text-cream-100 border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Saldo Akhir</p>
                <p className="font-display text-3xl font-bold">
                  {formatRupiah((cashBook.initialCapital || 0) + (cashBook.totalCash || 0) - (cashBook.totalExpenses || 0))}
                </p>
                <p className="text-xs text-white/50 mt-1">Cut-off: {cashBook.cutOffTime}</p>
              </div>
              {!cashBook.isClosed && (
                <button
                  onClick={handleCloseCashBook}
                  className="bg-white/20 hover:bg-white/30 text-cream-100 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  🔒 Tutup Kas
                </button>
              )}
            </div>
          </div>

          {/* Two Column: Transactions + Expenses */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Transactions */}
            <div className="card">
              <h3 className="font-display font-semibold text-coffee-900 mb-3">🧾 Transaksi ({transactions?.length || 0})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {transactions?.length === 0 ? (
                  <p className="text-sm text-coffee-400 text-center py-6">Belum ada transaksi</p>
                ) : transactions?.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm py-2 border-b border-coffee-50">
                    <div>
                      <p className="font-medium text-coffee-900">{t.invoiceNumber}</p>
                      <p className="text-xs text-coffee-400">{t.paymentMethod === 'TUNAI' ? '💵 Tunai' : '💳 Non Tunai'}</p>
                    </div>
                    <p className="font-bold text-emerald-700">{formatRupiah(t.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-coffee-900">💸 Pengeluaran</h3>
                {!cashBook.isClosed && (
                  <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="text-xs text-coffee-600 hover:text-coffee-900 font-semibold flex items-center gap-1"
                  >
                    ➕ Tambah
                  </button>
                )}
              </div>

              {showExpenseForm && (
                <form onSubmit={handleAddExpense} className="mb-3 p-3 bg-coffee-50 rounded-xl space-y-2">
                  <input
                    type="text"
                    value={expForm.description}
                    onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Deskripsi pengeluaran"
                    className="input-field text-sm"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={expForm.amount}
                      onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="Jumlah (Rp)"
                      className="input-field text-sm"
                      required
                      inputMode="numeric"
                    />
                    <select
                      value={expForm.category}
                      onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}
                      className="input-field text-sm"
                    >
                      {['Operasional', 'Bahan Baku', 'Gaji', 'Utilitas', 'Lainnya'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-coffee-800 text-cream-100 rounded-lg text-sm font-semibold">
                    Simpan
                  </button>
                </form>
              )}

              <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
                {expenses?.length === 0 ? (
                  <p className="text-sm text-coffee-400 text-center py-6">Belum ada pengeluaran</p>
                ) : expenses?.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-coffee-50">
                    <div>
                      <p className="font-medium text-coffee-900">{e.description}</p>
                      <p className="text-xs text-coffee-400">{e.category}</p>
                    </div>
                    <p className="font-bold text-red-600">- {formatRupiah(e.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
