// src/hooks/useCart.js
'use client';
import { useState, useCallback } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === (product.serverId || product.id));
      if (existing) {
        return prev.map(i =>
          i.productId === existing.productId
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
            : i
        );
      }
      return [...prev, {
        productId: product.serverId || product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        localProductId: product.id,
      }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i =>
      i.productId === productId
        ? { ...i, quantity: qty, subtotal: qty * i.price }
        : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount(0);
  }, []);

  const loadFromOpenBill = useCallback((openBill) => {
    const cartItems = (openBill.items || []).map(item => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));
    setItems(cartItems);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const total = Math.max(0, subtotal - discount);

  return {
    items,
    discount,
    setDiscount,
    subtotal,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadFromOpenBill,
    isEmpty: items.length === 0,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
