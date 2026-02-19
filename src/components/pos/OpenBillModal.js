// src/components/pos/OpenBillModal.js
'use client';
import { useState } from 'react';

export default function OpenBillModal({ onSave, onClose }) {
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');

  const handleSave = () => {
    if (!tableNumber && !customerName) return;
    onSave({ tableNumber, customerName });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-coffee-gradient px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-cream-100">📋 Simpan Open Bill</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
          </div>
          <p className="text-white/60 text-sm mt-1">Isi nomor meja atau nama pelanggan</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Nomor Meja</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Contoh: 1, 2A, VIP"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-coffee-200" />
            <span className="text-sm text-coffee-400">atau</span>
            <div className="flex-1 h-px bg-coffee-200" />
          </div>

          <div>
            <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Nama Pelanggan</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary py-3">Batal</button>
            <button
              onClick={handleSave}
              disabled={!tableNumber && !customerName}
              className="btn-primary py-3 disabled:opacity-40"
            >
              📋 Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
