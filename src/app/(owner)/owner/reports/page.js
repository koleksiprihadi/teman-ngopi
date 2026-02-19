// src/app/(owner)/owner/reports/page.js
'use client';
import { useState, useEffect } from 'react';
import db from '@/lib/dexie/db';
import { formatRupiah } from '@/utils/currency';
import { formatDate, formatDateTime } from '@/utils/date';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#5C3317', '#D2691E', '#FAE9C8', '#8B4513'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gantungList, setGantungList] = useState([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate, endDate;

      if (period === 'today') {
        startDate = new Date(now.toDateString());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      }

      const transactions = await db.transactions
        .filter(t => {
          const created = new Date(t.createdAt);
          return created >= startDate && created <= endDate && t.status !== 'CANCELLED';
        })
        .toArray();

      const expenses = await db.expenses
        .filter(e => {
          const created = new Date(e.createdAt);
          return created >= startDate && created <= endDate;
        })
        .toArray();

      const gantung = await db.transactions.where('isGantung').equals(1).toArray();
      const gantungWithItems = await Promise.all(gantung.map(async (t) => {
        const items = await db.transaction_items.where('transactionId').equals(t.id).toArray();
        return { ...t, items };
      }));
      setGantungList(gantungWithItems);

      const totalSales = transactions.reduce((s, t) => s + t.total, 0);
      const totalCash = transactions.filter(t => t.paymentMethod === 'TUNAI').reduce((s, t) => s + t.total, 0);
      const totalNonCash = transactions.filter(t => t.paymentMethod === 'NON_TUNAI').reduce((s, t) => s + t.total, 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const netProfit = totalSales - totalExpenses;

      const expenseByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      setData({
        totalSales, totalCash, totalNonCash, totalExpenses, netProfit,
        txnCount: transactions.length,
        cashTxnCount: transactions.filter(t => t.paymentMethod === 'TUNAI').length,
        nonCashTxnCount: transactions.filter(t => t.paymentMethod === 'NON_TUNAI').length,
        expenseByCategory,
        pieData: [
          { name: 'Tunai', value: totalCash },
          { name: 'Non Tunai', value: totalNonCash },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-coffee-900">📊 Laporan Keuangan</h1>
        <div className="flex gap-2 bg-coffee-100 rounded-xl p-1">
          {[
            { value: 'today', label: 'Hari Ini' },
            { value: 'month', label: 'Bulan Ini' },
            { value: 'year', label: 'Tahun Ini' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p.value
                  ? 'bg-coffee-800 text-cream-100 shadow-md'
                  : 'text-coffee-600 hover:text-coffee-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-4xl animate-spin-slow">☕</div>
        </div>
      ) : data ? (
        <>
          {/* Laba Rugi */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-coffee-900 mb-4">📑 Laporan Laba Rugi</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                <span className="text-coffee-700 font-medium">Total Penjualan</span>
                <span className="font-bold text-emerald-700">{formatRupiah(data.totalSales)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                <span className="text-coffee-700 font-medium">Total Pengeluaran</span>
                <span className="font-bold text-red-600">- {formatRupiah(data.totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-coffee-50 rounded-xl px-3">
                <span className="font-bold text-coffee-900">Laba Bersih</span>
                <span className={`text-xl font-bold font-display ${data.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatRupiah(data.netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Tunai vs Non Tunai */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-coffee-900 mb-4">💰 Rekap Pembayaran</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-coffee-700 rounded-full" />
                    <span className="text-sm font-medium text-coffee-800">Tunai</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-coffee-900">{formatRupiah(data.totalCash)}</p>
                    <p className="text-xs text-coffee-400">{data.cashTxnCount} transaksi</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-coffee-400 rounded-full" />
                    <span className="text-sm font-medium text-coffee-800">Non Tunai</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-coffee-900">{formatRupiah(data.totalNonCash)}</p>
                    <p className="text-xs text-coffee-400">{data.nonCashTxnCount} transaksi</p>
                  </div>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-semibold text-coffee-700">Total Transaksi</span>
                  <span className="font-bold text-coffee-900">{data.txnCount}</span>
                </div>
              </div>
            </div>

            <div className="card flex flex-col items-center">
              <h2 className="font-display text-lg font-semibold text-coffee-900 mb-4 self-start">📊 Komposisi</h2>
              {data.totalSales > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={data.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatRupiah(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-1 flex items-center justify-center text-coffee-300">
                  <p>Belum ada transaksi</p>
                </div>
              )}
            </div>
          </div>

          {/* Gantung Transactions */}
          {gantungList.length > 0 && (
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-coffee-900 mb-4">⏰ Transaksi Gantung</h2>
              <div className="space-y-2">
                {gantungList.map(t => (
                  <div key={t.id} className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-coffee-900 text-sm">{t.invoiceNumber}</p>
                      <p className="text-xs text-coffee-400">{formatDateTime(t.createdAt)}</p>
                      <p className="text-xs text-coffee-600">{t.items?.length || 0} item</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-800">{formatRupiah(t.total)}</p>
                      <span className="badge-amber">GANTUNG</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
