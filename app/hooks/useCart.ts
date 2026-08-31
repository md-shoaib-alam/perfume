'use client';

import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
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

// ==========================================
// Module-level Single Source of Truth Cart Store
// ==========================================
let cartStore: CartItem[] = [];
let isStoreLoaded = false;
const storeListeners = new Set<() => void>();

let isCartOpenStore = false;
const cartOpenListeners = new Set<() => void>();

function initStoreIfNeeded() {
  if (isStoreLoaded || typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        cartStore = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load cart from localStorage:', e);
  }
  isStoreLoaded = true;
}

function emitStoreChange() {
  for (const listener of storeListeners) {
    listener();
  }
}

function emitCartOpenChange() {
  for (const listener of cartOpenListeners) {
    listener();
  }
}

function setCartStore(nextCart: CartItem[], userId?: string | null) {
  cartStore = nextCart;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      if (userId) {
        localStorage.setItem(getUserCartStorageKey(userId), JSON.stringify(nextCart));
      }
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }
  emitStoreChange();
}

function subscribeToStore(callback: () => void) {
  storeListeners.add(callback);
  return () => {
    storeListeners.delete(callback);
  };
}

function getStoreSnapshot(): CartItem[] {
  initStoreIfNeeded();
  return cartStore;
}

const SERVER_EMPTY_CART: CartItem[] = [];
function getServerSnapshot(): CartItem[] {
  return SERVER_EMPTY_CART;
}

function subscribeCartOpen(callback: () => void) {
  cartOpenListeners.add(callback);
  return () => {
    cartOpenListeners.delete(callback);
  };
}

function getCartOpenSnapshot(): boolean {
  return isCartOpenStore;
}

function getServerCartOpenSnapshot(): boolean {
  return false;
}

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CART_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          cartStore = parsed;
          emitStoreChange();
        }
      } catch (err) {}
    }
  });
}

export function useCart() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const cartItems = useSyncExternalStore(subscribeToStore, getStoreSnapshot, getServerSnapshot);
  const isCartOpen = useSyncExternalStore(subscribeCartOpen, getCartOpenSnapshot, getServerCartOpenSnapshot);
  const prevUserIdRef = useRef<string | null>(null);

  const setIsCartOpen = useCallback((open: boolean) => {
    isCartOpenStore = open;
    emitCartOpenChange();
  }, []);

  // Account Cart Synchronization & Login Merge
  useEffect(() => {
    if (!isStoreLoaded || !isUserLoaded) return;

    const currentUserId = user?.id || null;
    const prevUserId = prevUserIdRef.current;

    // Merge when transitioning from unauthenticated -> authenticated
    if (currentUserId && prevUserId !== currentUserId) {
      try {
        const userSavedKey = getUserCartStorageKey(currentUserId);
        const userSavedRaw = localStorage.getItem(userSavedKey);
        const userSavedItems: CartItem[] = userSavedRaw ? JSON.parse(userSavedRaw) : [];
        const currentLocalItems = cartStore;

        if (userSavedItems.length > 0 || currentLocalItems.length > 0) {
          const merged = mergeCartLists(currentLocalItems, userSavedItems);
          setCartStore(merged, currentUserId);
        }
      } catch (err) {
        console.warn('Cart login merge error:', err);
      }
    }

    prevUserIdRef.current = currentUserId;
  }, [user, isUserLoaded]);

  const addToCart = useCallback((product: Product, size?: string, unitPrice?: number, quantity: number = 1) => {
    initStoreIfNeeded();
    const cleanId = getCleanProductId(product);
    const sizeOpts = resolveProductSizeOptions(product);
    const resolvedSize = size || (sizeOpts.length > 0 ? sizeOpts[0].size : product.volume || '100ml');
    const resolvedPrice = unitPrice != null && unitPrice > 0 
      ? unitPrice 
      : resolveProductUnitPrice(product, resolvedSize);

    const targetKey = getItemCompositeKey(cleanId, resolvedSize);

    const existingIndex = cartStore.findIndex((item) => {
      const itemCleanId = getCleanProductId(item.product);
      return getItemCompositeKey(itemCleanId, item.selectedSize) === targetKey;
    });

    let nextItems: CartItem[];
    if (existingIndex > -1) {
      nextItems = cartStore.map((item, idx) =>
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
        ...cartStore,
        { product: cleanProduct, quantity, selectedSize: resolvedSize, unitPrice: resolvedPrice }
      ];
    }

    setCartStore(nextItems, user?.id);
    setIsCartOpen(true);
  }, [user?.id, setIsCartOpen]);

  const updateQuantity = useCallback((productId: string, delta: number, size?: string) => {
    initStoreIfNeeded();
    const targetCleanId = productId.toLowerCase().trim();
    const targetSize = size ? size.toLowerCase().trim() : undefined;

    const nextItems = cartStore
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

    setCartStore(nextItems, user?.id);
  }, [user?.id]);

  const removeItem = useCallback((productId: string, size?: string) => {
    initStoreIfNeeded();
    const targetCleanId = productId.toLowerCase().trim();
    const targetSize = size ? size.toLowerCase().trim() : undefined;

    const nextItems = cartStore.filter((item) => {
      const itemCleanId = getCleanProductId(item.product);
      const itemSize = (item.selectedSize || '').toLowerCase().trim();
      const isSameProduct = itemCleanId === targetCleanId;
      const isSameSize = targetSize === undefined || itemSize === targetSize;

      return !(isSameProduct && isSameSize);
    });

    setCartStore(nextItems, user?.id);
  }, [user?.id]);

  const clearCart = useCallback(() => {
    setCartStore([], user?.id);
  }, [user?.id]);

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
    isLoaded: isStoreLoaded
  };
}
