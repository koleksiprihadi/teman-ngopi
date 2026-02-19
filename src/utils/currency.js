// src/utils/currency.js
export function formatRupiah(amount) {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function parseRupiah(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}
