'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Product, CartItem } from '../types';
import { resolveProductUnitPrice, resolveProductSizeOptions } from '@/lib/pricing';

const CART_STORAGE_KEY = 'neesh_cart_items_v1';
const getUserCartStorageKey = (userId: string) => `neesh_user_cart_${userId}`;

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

/**
 * Intelligent Cart Merging:
 * 1. Keeps the exact quantity of items currently in the active local cart (so 1 piece never doubles to 2).
 * 2. Seamlessly restores any additional fragrances saved in the user account from other sessions/devices.
 */
const mergeCartLists = (activeLocalList: CartItem[], savedAccountList: CartItem[]): CartItem[] => {
  const mergedMap = new Map<string, CartItem>();

  // 1. First add all active local items (preserves user's exact current chosen quantity)
  activeLocalList.forEach((item) => {
    if (!item?.product) return;
    const cleanId = getCleanProductId(item.product);
    const key = getItemCompositeKey(cleanId, item.selectedSize);
    mergedMap.set(key, { ...item });
  });

  // 2. Add any account items that are not in the local cart (e.g. from another device/session)
  savedAccountList.forEach((item) => {
    if (!item?.product) return;
    const cleanId = getCleanProductId(item.product);
    const key = getItemCompositeKey(cleanId, item.selectedSize);
    if (!mergedMap.has(key)) {
      mergedMap.set(key, { ...item });
    }
  });

  return Array.from(mergedMap.values());
};

export function useCart() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const prevUserIdRef = useRef<string | null>(null);
  const lastAddTimestampRef = useRef<{ [key: string]: number }>({});

  // 1. Initial Client-Side Load from localStorage
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
    window.addEventListener('neesh_cart_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('neesh_cart_updated', handleSync);
    };
  }, []);

  // 2. Intelligent User Login/Logout Cart Merge & Sync
  useEffect(() => {
    if (!isLoaded || !isUserLoaded) return;

    const currentUserId = user?.id || null;
    const prevUserId = prevUserIdRef.current;

    // Trigger merge only when transitioning from unauthenticated -> authenticated
    if (currentUserId && prevUserId !== currentUserId) {
      try {
        const userSavedKey = getUserCartStorageKey(currentUserId);
        const userSavedRaw = localStorage.getItem(userSavedKey);
        const userSavedItems: CartItem[] = userSavedRaw ? JSON.parse(userSavedRaw) : [];

        const currentLocalRaw = localStorage.getItem(CART_STORAGE_KEY);
        const currentLocalItems: CartItem[] = currentLocalRaw ? JSON.parse(currentLocalRaw) : [];

        if (userSavedItems.length > 0 || currentLocalItems.length > 0) {
          // Merge non-destructively: keep exact active quantities without doubling
          const merged = mergeCartLists(currentLocalItems, userSavedItems);
          setCartItems(merged);
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(merged));
          localStorage.setItem(userSavedKey, JSON.stringify(merged));
        }
      } catch (err) {
        console.warn('Cart login merge error:', err);
      }
    }

    prevUserIdRef.current = currentUserId;
  }, [user, isLoaded, isUserLoaded]);

  // 3. Persist cart to active storage and user-scoped storage whenever cartItems change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      if (user?.id) {
        localStorage.setItem(getUserCartStorageKey(user.id), JSON.stringify(cartItems));
      }
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, [cartItems, isLoaded, user]);

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

      let nextItems: CartItem[];
      if (existingIndex > -1) {
        nextItems = prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity, unitPrice: resolvedPrice }
            : item
        );
      } else {
        const cleanProduct: Product = {
          ...product,
          id: product.id || cleanId
        };
        nextItems = [
          ...prev,
          { product: cleanProduct, quantity, selectedSize: resolvedSize, unitPrice: resolvedPrice }
        ];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
        window.dispatchEvent(new Event('neesh_cart_updated'));
      }
      return nextItems;
    });

    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number, size?: string) => {
    const targetCleanId = productId.toLowerCase().trim();
    const targetSize = size ? size.toLowerCase().trim() : undefined;

    setCartItems((prev) => {
      const nextItems = prev
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
        .filter(Boolean) as CartItem[];

      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
        window.dispatchEvent(new Event('neesh_cart_updated'));
      }
      return nextItems;
    });
  }, []);

  const removeItem = useCallback((productId: string, size?: string) => {
    const targetCleanId = productId.toLowerCase().trim();
    const targetSize = size ? size.toLowerCase().trim() : undefined;

    setCartItems((prev) => {
      const nextItems = prev.filter((item) => {
        const itemCleanId = getCleanProductId(item.product);
        const itemSize = (item.selectedSize || '').toLowerCase().trim();
        const isSameProduct = itemCleanId === targetCleanId;
        const isSameSize = targetSize === undefined || itemSize === targetSize;

        return !(isSameProduct && isSameSize);
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
        window.dispatchEvent(new Event('neesh_cart_updated'));
      }
      return nextItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
      if (user?.id) {
        localStorage.setItem(getUserCartStorageKey(user.id), JSON.stringify([]));
      }
      window.dispatchEvent(new Event('neesh_cart_updated'));
    }
  }, [user]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
    0
  );

  return {
    cartItems,
    totalCartCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isLoaded
  };
}
