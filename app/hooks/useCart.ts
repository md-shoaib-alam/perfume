'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '../types';
import { resolveProductUnitPrice, resolveProductSizeOptions } from '@/lib/pricing';

const CART_STORAGE_KEY = 'neesh_cart_items_v1';

const getCleanProductId = (product: Product | { id?: string; name?: string }): string => {
  return String((product as any)?.id || (product as any)?.$id || (product as any)?.name || 'item')
    .toLowerCase()
    .trim();
};

const getItemCompositeKey = (productId: string, size?: string): string => {
  const cleanId = productId.toLowerCase().trim();
  const cleanSize = (size || 'default').toLowerCase().trim();
  return `${cleanId}::${cleanSize}`;
};

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from storage:', e);
    }
    setIsLoaded(true);

    const handleSync = () => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Persist cart to localStorage whenever cartItems change after initial load
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product: Product, size?: string, unitPrice?: number, quantity: number = 1) => {
    const cleanId = getCleanProductId(product);
    const sizeOpts = resolveProductSizeOptions(product);
    const resolvedSize = size || (sizeOpts.length > 0 ? sizeOpts[0].size : product.volume || '100ml');
    const resolvedPrice = unitPrice != null && unitPrice > 0 
      ? unitPrice 
      : resolveProductUnitPrice(product, resolvedSize);

    const targetKey = getItemCompositeKey(cleanId, resolvedSize);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const itemCleanId = getCleanProductId(item.product);
        return getItemCompositeKey(itemCleanId, item.selectedSize) === targetKey;
      });

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity, unitPrice: resolvedPrice }
            : item
        );
      } else {
        const cleanProduct: Product = {
          ...product,
          id: product.id || cleanId
        };
        return [
          ...prev,
          { product: cleanProduct, quantity, selectedSize: resolvedSize, unitPrice: resolvedPrice }
        ];
      }
    });

    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number, size?: string) => {
    const targetCleanId = productId.toLowerCase().trim();
    const targetSize = size ? size.toLowerCase().trim() : undefined;

    setCartItems((prev) =>
      prev
        .map((item) => {
          const itemCleanId = getCleanProductId(item.product);
          const itemSize = (item.selectedSize || '').toLowerCase().trim();
          const isSameProduct = itemCleanId === targetCleanId;
          const isSameSize = targetSize === undefined || itemSize === targetSize;

          if (isSameProduct && isSameSize) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((productId: string, size?: string) => {
    const targetCleanId = productId.toLowerCase().trim();
    const targetSize = size ? size.toLowerCase().trim() : undefined;

    setCartItems((prev) =>
      prev.filter((item) => {
        const itemCleanId = getCleanProductId(item.product);
        const itemSize = (item.selectedSize || '').toLowerCase().trim();
        const isSameProduct = itemCleanId === targetCleanId;
        const isSameSize = targetSize === undefined || itemSize === targetSize;

        // Keep item if it does not match both product ID and size
        return !(isSameProduct && isSameSize);
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

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
