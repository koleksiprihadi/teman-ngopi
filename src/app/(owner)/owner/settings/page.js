// src/app/(owner)/owner/settings/page.js
'use client';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { setSetting, getSetting } from '@/lib/dexie/db';
import { syncAll } from '@/lib/sync/syncManager';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [cutOff, setCutOff] = useState('22:00');
  const [syncing, setSyncing] = useState(false);

  const pendingCount = useLiveQuery(() =>
    db.sync_queue.where('status').equals('pending').count()
  , []);

  const failedCount = useLiveQuery(() =>
    db.sync_queue.where('status').equals('failed').count()
  , []);

  const handleSaveCutOff = async () => {
    await setSetting('default_cutoff', cutOff);
    toast.success(`⏰ Jam cut-off diatur ke ${cutOff}`);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    await syncAll();
    setSyncing(false);
    toast.success('✅ Sinkronisasi selesai');
  };

  const handleClearCache = async () => {
    if (!confirm('Hapus semua data yang sudah tersinkron dari cache lokal?')) return;
    await db.sync_queue.where('status').equals('synced').delete();
    toast.success('🧹 Cache dibersihkan');
  };

  const handleResetFailed = async () => {
    await db.sync_queue.where('status').equals('failed').modify({ status: 'pending', attempts: 0 });
    toast.success('🔄 Data gagal direset untuk dicoba ulang');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 pb-8">
      <h1 className="font-display text-2xl font-bold text-coffee-900">⚙️ Pengaturan</h1>

      {/* Cut-off Setting */}
      <div className="card space-y-4">
        <h2 className="font-display text-lg font-semibold text-coffee-900">⏰ Jam Cut-Off Default</h2>
        <p className="text-sm text-coffee-500">Transaksi setelah jam ini akan otomatis menjadi "Gantung" dan masuk ke buku kas hari berikutnya.</p>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={cutOff}
            onChange={e => setCutOff(e.target.value)}
            className="input-field w-auto"
          />
          <button onClick={handleSaveCutOff} className="btn-primary">Simpan</button>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="card space-y-4">
        <h2 className="font-display text-lg font-semibold text-coffee-900">🔄 Sinkronisasi Data</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-800">{pendingCount || 0}</p>
            <p className="text-xs text-amber-600">Data Pending</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-800">{failedCount || 0}</p>
            <p className="text-xs text-red-600">Data Gagal</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {syncing ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Menyinkron...</>
            ) : '🔄 Sinkron Manual'}
          </button>

          {failedCount > 0 && (
            <button onClick={handleResetFailed} className="w-full btn-secondary text-sm">
              ♻️ Reset Data Gagal ({failedCount})
            </button>
          )}

          <button onClick={handleClearCache} className="w-full text-sm text-coffee-400 hover:text-coffee-700 underline">
            🧹 Bersihkan Cache Tersinkron
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="card space-y-3">
        <h2 className="font-display text-lg font-semibold text-coffee-900">ℹ️ Info Aplikasi</h2>
        <div className="space-y-2 text-sm text-coffee-600">
          <div className="flex justify-between"><span>Versi Aplikasi</span><span className="font-semibold">1.0.0</span></div>
          <div className="flex justify-between"><span>Nama Toko</span><span className="font-semibold">Teman Ngopi</span></div>
          <div className="flex justify-between"><span>Database</span><span className="font-semibold">IndexedDB (Dexie)</span></div>
          <div className="flex justify-between"><span>Sync Server</span><span className="font-semibold">Supabase</span></div>
        </div>
      </div>
    </div>
  );
}
