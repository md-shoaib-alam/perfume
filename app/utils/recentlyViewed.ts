import type { Product } from '../types';

const RECENTLY_VIEWED_KEY = 'neesh_recently_viewed';
const MAX_RECENT_ITEMS = 20;

export function getRecentlyViewed(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading recently viewed from localStorage:', err);
    return [];
  }
}

export function addRecentlyViewed(product: Product): void {
  if (typeof window === 'undefined' || !product || !product.id) return;
  try {
    const current = getRecentlyViewed();
    // Filter out duplicate by id or name
    const filtered = current.filter(
      (p) => p.id !== product.id && p.name?.toLowerCase() !== product.name?.toLowerCase()
    );
    // Put current product at top
    const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('recently_viewed_updated'));
  } catch (err) {
    console.warn('Error saving recently viewed to localStorage:', err);
  }
}

export function removeRecentlyViewed(productId: string): Product[] {
  if (typeof window === 'undefined' || !productId) return [];
  try {
    const current = getRecentlyViewed();
    const updated = current.filter((p) => p.id !== productId && (p as any)._id !== productId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('recently_viewed_updated'));
    return updated;
  } catch (err) {
    console.warn('Error removing recently viewed item:', err);
    return [];
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    window.dispatchEvent(new Event('recently_viewed_updated'));
  } catch (err) {
    console.warn('Error clearing recently viewed:', err);
  }
}
