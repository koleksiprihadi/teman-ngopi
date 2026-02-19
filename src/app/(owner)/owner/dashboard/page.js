// src/app/(owner)/owner/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '@/lib/dexie/db';
import { formatRupiah } from '@/utils/currency';
import { formatDate, getTodayString } from '@/utils/date';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const [selectedDate] = useState(getTodayString());
  const [showModalCapital, setShowModalCapital] = useState(false);
  const [cutOffTime, setCutOffTime] = useState('22:00');
  const [weekData, setWeekData] = useState([]);

  const cashBook = useLiveQuery(() =>
    db.cash_books.where('date').equals(selectedDate).first()
  , [selectedDate]);

  const todayTransactions = useLiveQuery(async () => {
    if (!cashBook) return [];
    return db.transactions
      .where('cashBookId').equals(cashBook.serverId || String(cashBook.id))
      .toArray();
  }, [cashBook]);

  const gantungCount = useLiveQuery(() =>
    db.transactions.where('isGantung').equals(1).count()
  , []);

  const openBillsCount = useLiveQuery(() =>
    db.open_bills.where('status').equals('OPEN').count()
  , []);

  const pendingSync = useLiveQuery(() =>
    db.sync_queue.where('status').equals('pending').count()
  , []);

  // Weekly data for chart
  useEffect(() => {
    async function loadWeekData() {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const book = await db.cash_books.where('date').equals(dateStr).first();
        const dayTxns = book
          ? await db.transactions.where('cashBookId').equals(String(book.id)).toArray()
          : [];
        const total = dayTxns.reduce((s, t) => s + t.total, 0);
        days.push({
          day: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
          total,
          date: dateStr,
        });
      }
      setWeekData(days);
    }
    loadWeekData();
  }, []);

  const todayStats = {
    totalSales: todayTransactions?.reduce((s, t) => s + t.total, 0) || 0,
    totalCash: todayTransactions?.filter(t => t.paymentMethod === 'TUNAI').reduce((s, t) => s + t.total, 0) || 0,
    totalNonCash: todayTransactions?.filter(t => t.paymentMethod === 'NON_TUNAI').reduce((s, t) => s + t.total, 0) || 0,
    txnCount: todayTransactions?.length || 0,
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-8">
      {/* Welcome + Date */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-coffee-900">Selamat datang! ☕</h1>
          <p className="text-coffee-400 text-sm mt-0.5">{formatDate(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        {!cashBook ? (
          <button
            onClick={() => setShowModalCapital(true)}
            className="btn-primary flex items-center gap-2"
          >
            💰 Buka Kas Hari Ini
          </button>
        ) : (
          <div className="badge-green text-sm py-1.5 px-3">
            ✅ Kas Sudah Dibuka
          </div>
        )}
      </div>

      {/* Alert if no cashbook */}
      {!cashBook && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">Buku Kas Belum Dibuka</p>
            <p className="text-amber-600 text-sm mt-1">Buka buku kas terlebih dahulu untuk mulai mencatat transaksi hari ini.</p>
            <button
              onClick={() => setShowModalCapital(true)}
              className="mt-2 text-sm font-semibold text-amber-700 underline hover:text-amber-900"
            >
              Buka Sekarang →
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon="💰"
          label="Total Penjualan"
          value={formatRupiah(todayStats.totalSales)}
          sub={`${todayStats.txnCount} transaksi`}
          color="coffee"
        />
        <StatCard
          icon="💵"
          label="Tunai"
          value={formatRupiah(todayStats.totalCash)}
          color="emerald"
        />
        <StatCard
          icon="💳"
          label="Non Tunai"
          value={formatRupiah(todayStats.totalNonCash)}
          color="blue"
        />
        <StatCard
          icon="💼"
          label="Modal Awal"
          value={formatRupiah(cashBook?.initialCapital || 0)}
          sub="Kas hari ini"
          color="amber"
        />
      </div>

      {/* Quick Actions + Chart */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Chart */}
        <div className="card">
          <h3 className="font-display font-semibold text-coffee-900 mb-4">📈 Penjualan 7 Hari</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FAE9C8" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A0522D' }} />
              <YAxis tick={{ fontSize: 10, fill: '#A0522D' }} tickFormatter={v => v >= 1000 ? `${v/1000}K` : v} />
              <Tooltip
                formatter={(v) => [formatRupiah(v), 'Penjualan']}
                contentStyle={{ borderRadius: 8, border: '1px solid #FAE9C8', fontFamily: 'Nunito' }}
              />
              <Bar dataKey="total" fill="#8B4513" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-coffee-900">🚀 Aksi Cepat</h3>

          {[
            { href: '/owner/cashbook', icon: '📖', label: 'Lihat Buku Kas', desc: cashBook ? `Saldo: ${formatRupiah(cashBook.totalCash + cashBook.totalNonCash)}` : 'Belum ada buku kas' },
            { href: '/owner/reports', icon: '📊', label: 'Laporan Harian', desc: 'Laba rugi & rekap' },
            { href: '/owner/products', icon: '🍽️', label: 'Kelola Produk', desc: 'Tambah / edit menu' },
            { href: '/owner/users', icon: '👥', label: 'Kelola Kasir', desc: 'Manajemen akun kasir' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="card-hover flex items-center gap-4 p-4"
            >
              <div className="w-10 h-10 bg-coffee-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-coffee-900 text-sm">{item.label}</p>
                <p className="text-xs text-coffee-400 truncate">{item.desc}</p>
              </div>
              <span className="text-coffee-300">›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid sm:grid-cols-3 gap-3">
        {gantungCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-semibold text-red-800">Transaksi Gantung</p>
              <p className="text-red-600 text-sm">{gantungCount} transaksi belum masuk buku kas</p>
            </div>
          </div>
        )}
        {openBillsCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-amber-800">Open Bill</p>
              <p className="text-amber-600 text-sm">{openBillsCount} tagihan belum dibayar</p>
            </div>
          </div>
        )}
        {pendingSync > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <p className="font-semibold text-blue-800">Sinkronisasi</p>
              <p className="text-blue-600 text-sm">{pendingSync} data belum tersinkron</p>
            </div>
          </div>
        )}
      </div>

      {/* Open Capital Modal */}
      {showModalCapital && (
        <OpenCapitalModal
          onClose={() => setShowModalCapital(false)}
          onSuccess={() => setShowModalCapital(false)}
          cutOffTime={cutOffTime}
          setCutOffTime={setCutOffTime}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  const colorMap = {
    coffee: 'bg-coffee-100 text-coffee-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-coffee-400">{label}</p>
        <p className="text-lg font-bold text-coffee-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-coffee-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function OpenCapitalModal({ onClose, onSuccess, cutOffTime, setCutOffTime }) {
  const [capital, setCapital] = useState('');
  const [localCutOff, setLocalCutOff] = useState(cutOffTime);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!capital || isNaN(Number(capital))) {
      toast.error('Masukkan jumlah modal yang valid');
      return;
    }
    setLoading(true);
    try {
      const id = Date.now().toString();
      const today = getTodayString();
      await db.cash_books.add({
        date: today,
        ownerId: 'local',
        initialCapital: Number(capital),
        totalCash: 0,
        totalNonCash: 0,
        totalExpenses: 0,
        finalBalance: 0,
        cutOffTime: localCutOff,
        isClosed: false,
        serverId: null,
        createdAt: new Date().toISOString(),
      });
      toast.success('✅ Buku kas hari ini berhasil dibuka!');
      setCutOffTime(localCutOff);
      onSuccess();
    } catch (err) {
      toast.error('Gagal membuka buku kas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="bg-coffee-gradient px-5 py-4">
          <h3 className="font-display text-xl font-bold text-cream-100">💰 Buka Kas Hari Ini</h3>
          <p className="text-white/60 text-sm">{formatDate(new Date())}</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Modal Awal (Rp)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="Contoh: 500000"
              className="input-field text-right text-lg font-bold"
              autoFocus
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">⏰ Jam Cut-Off</label>
            <input
              type="time"
              value={localCutOff}
              onChange={(e) => setLocalCutOff(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-coffee-400 mt-1">Transaksi setelah jam ini akan menjadi "Gantung"</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={onClose} className="btn-secondary py-3">Batal</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary py-3">
              {loading ? '⏳...' : '✅ Buka Kas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
