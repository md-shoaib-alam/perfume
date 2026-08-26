'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '../types';

const CART_STORAGE_KEY = 'neesh_cart_items_v1';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load cart from storage:', e);
    }
    setIsLoaded(true);

    const handleSync = () => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      } catch (e) {}
    };

    window.addEventListener('neesh_cart_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('neesh_cart_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Save to localStorage whenever cartItems changes after initial mount
  const persistCart = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('neesh_cart_updated'));
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, []);

  const addToCart = useCallback((product: Product, size?: string, unitPrice?: number, quantity: number = 1) => {
    const resolvedSize =
      size ||
      (product.sizeOptions && product.sizeOptions.length > 0
        ? product.sizeOptions[0].size
        : product.volume || '100ml');

    const resolvedPrice =
      unitPrice ??
      (product.sizeOptions && product.sizeOptions.length > 0
        ? product.sizeOptions.find((opt) => opt.size === resolvedSize)?.price ?? product.price
        : product.price);

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === resolvedSize
      );
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id && item.selectedSize === resolvedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [
          ...prev,
          { product, quantity, selectedSize: resolvedSize, unitPrice: resolvedPrice }
        ];
      }
      persistCart(updated);
      return updated;
    });

    setIsCartOpen(true);
  }, [persistCart]);

  const updateQuantity = useCallback((productId: string, delta: number, size?: string) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (item.product.id === productId && (size === undefined || item.selectedSize === size)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      persistCart(updated);
      return updated;
    });
  }, [persistCart]);

  const removeItem = useCallback((productId: string, size?: string) => {
    setCartItems((prev) => {
      const updated = prev.filter(
        (item) => !(item.product.id === productId && (size === undefined || item.selectedSize === size))
      );
      persistCart(updated);
      return updated;
    });
  }, [persistCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    persistCart([]);
  }, [persistCart]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cartItems,
    totalCartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isLoaded
  };
}
