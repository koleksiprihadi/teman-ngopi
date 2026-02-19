// src/components/pos/CartItem.js
'use client';
import { formatRupiah } from '@/utils/currency';

export default function CartItem({ item, onRemove, onQuantityChange }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-cream-50 transition-colors">
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-coffee-900 truncate">{item.productName}</p>
        <p className="text-xs text-coffee-400">{formatRupiah(item.price)} / pcs</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onQuantityChange(item.quantity - 1)}
          className="w-7 h-7 bg-coffee-100 hover:bg-coffee-200 rounded-lg flex items-center justify-center text-coffee-800 font-bold text-sm transition-all active:scale-90"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-bold text-coffee-900">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.quantity + 1)}
          className="w-7 h-7 bg-coffee-800 hover:bg-coffee-900 rounded-lg flex items-center justify-center text-cream-100 font-bold text-sm transition-all active:scale-90"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0 w-20">
        <p className="text-sm font-bold text-coffee-900">{formatRupiah(item.subtotal)}</p>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
      >
        🗑️
      </button>
    </div>
  );
}
