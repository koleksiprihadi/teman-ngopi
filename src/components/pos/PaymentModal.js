// src/components/pos/PaymentModal.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { formatRupiah, parseRupiah } from '@/utils/currency';
import { isAfterCutOff } from '@/utils/date';

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

export default function PaymentModal({ total, onConfirm, onClose, cashBook }) {
  const [method, setMethod] = useState('TUNAI');
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const isGantung = isAfterCutOff(cashBook?.cutOffTime || '22:00');
  const amountPaid = parseRupiah(amountInput) || 0;
  const change = method === 'TUNAI' ? amountPaid - total : 0;
  const canPay = method === 'NON_TUNAI' || amountPaid >= total;

  useEffect(() => {
    if (method === 'TUNAI' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [method]);

  const handleQuickAmount = (amount) => {
    setAmountInput(amount.toString());
  };

  const handleExactAmount = () => {
    setAmountInput(total.toString());
  };

  const handleConfirm = async () => {
    if (!canPay) return;
    setLoading(true);
    await onConfirm({
      paymentMethod: method,
      amountPaid: method === 'TUNAI' ? amountPaid : total,
    });
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-coffee-gradient text-cream-100 px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-xl font-bold">💳 Pembayaran</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
          </div>
          <div className="text-3xl font-bold font-display">{formatRupiah(total)}</div>
          {isGantung && (
            <div className="mt-2 bg-amber-400/20 border border-amber-400/30 rounded-lg px-3 py-1.5 text-xs text-amber-200 flex items-center gap-1.5">
              ⏰ <span>Setelah jam cut-off — transaksi akan menjadi <strong>GANTUNG</strong></span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Payment Method */}
          <div>
            <p className="text-xs font-semibold text-coffee-400 uppercase tracking-wide mb-2">Metode Pembayaran</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'TUNAI', label: '💵 Tunai', desc: 'Cash' },
                { value: 'NON_TUNAI', label: '💳 Non Tunai', desc: 'QRIS / Transfer' },
              ].map(m => (
                <button
                  key={m.value}
                  onClick={() => { setMethod(m.value); setAmountInput(''); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    method === m.value
                      ? 'border-coffee-600 bg-coffee-50'
                      : 'border-coffee-200 hover:border-coffee-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-coffee-900">{m.label}</div>
                  <div className="text-xs text-coffee-400">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Input */}
          {method === 'TUNAI' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-coffee-400 uppercase tracking-wide">Jumlah Bayar</p>
                  <button
                    onClick={handleExactAmount}
                    className="text-xs text-coffee-600 hover:text-coffee-800 font-medium underline"
                  >
                    Uang pas
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400 font-medium text-sm">Rp</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full border-2 border-coffee-200 focus:border-coffee-600 rounded-xl py-3 pl-9 pr-4 text-right text-lg font-bold text-coffee-900 outline-none transition-all"
                    placeholder="0"
                    min={0}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-1.5">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleQuickAmount(
                      amountPaid > 0 ? amountPaid + amt : amt
                    )}
                    className="py-2 bg-coffee-100 hover:bg-coffee-200 rounded-lg text-xs font-semibold text-coffee-800 transition-all active:scale-95"
                  >
                    +{amt >= 1000 ? `${amt/1000}rb` : amt}
                  </button>
                ))}
              </div>

              {/* Change */}
              {amountPaid > 0 && (
                <div className={`rounded-xl p-3 flex justify-between items-center ${
                  change >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <span className="text-sm font-medium text-coffee-700">
                    {change >= 0 ? '💰 Kembalian' : '⚠️ Kurang'}
                  </span>
                  <span className={`text-lg font-bold ${change >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatRupiah(Math.abs(change))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Non-Cash Info */}
          {method === 'NON_TUNAI' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-sm font-medium text-blue-800">QRIS / Transfer Bank</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{formatRupiah(total)}</p>
            </div>
          )}

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={!canPay || loading}
            className="w-full py-4 rounded-xl bg-coffee-800 hover:bg-coffee-900 text-cream-100 font-bold text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-coffee"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              `✅ Konfirmasi ${method === 'TUNAI' ? `${formatRupiah(amountPaid)}` : 'Pembayaran'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
