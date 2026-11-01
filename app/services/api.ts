import type { Product, Review } from '../types';

// Client in-memory cache for ultra-fast instant rendering
const productsMemoryCache = new Map<string, { data: Product[]; timestamp: number }>();
let heroSlidesMemoryCache: { data: any[]; timestamp: number } | null = null;
export const PRODUCTS_CACHE_TTL_MS = 2 * 60 * 1000;
export const HERO_CACHE_TTL_MS = 2 * 60 * 1000;
export const COLLECTIONS_CACHE_TTL_MS = 2 * 60 * 1000;

// Every mutation goes through a guarded /api route; the browser never writes to Appwrite directly.
async function apiRequest<T>(url: string, init: RequestInit, failMessage: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error(failMessage);
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || failMessage);
  return payload as T;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  // Clear cache helper
  invalidateProductsCache() {
    productsMemoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bb_products_cache');
      } catch {}
    }
  },
  invalidateHeroCache() {
    heroSlidesMemoryCache = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bb_hero_slides_cache');
      } catch {}
    }
  },
  invalidateCollectionsCache() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bb_collections_cache');
      } catch {}
    }
  },

  // =========================================================================
  // 1. PRODUCTS (short-lived localStorage & memory cache)
  // =========================================================================
  async getProducts(category?: string, gender?: string): Promise<Product[]> {
    const cacheKey = `${category || ''}_${gender || ''}`;
    const cached = productsMemoryCache.get(cacheKey);
    const now = Date.now();

    // 1. Check in-memory cache
    if (cached && now - cached.timestamp < PRODUCTS_CACHE_TTL_MS && cached.data.length > 0) {
      return cached.data;
    }

    // 2. Check localStorage cache (zero network hit while the TTL is fresh)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('bb_products_cache');
        if (raw) {
          const parsed = JSON.parse(raw);
          const allProducts: Product[] = Array.isArray(parsed) ? parsed : parsed?.data;
          const timestamp = Array.isArray(parsed) ? 0 : parsed?.timestamp || 0;
          if (Array.isArray(allProducts) && allProducts.length > 0 && now - timestamp < PRODUCTS_CACHE_TTL_MS) {
            let filtered = allProducts;
            if (category && category !== 'all') {
              filtered = filtered.filter(p => p.category === category);
            }
            if (gender && gender !== 'All' && gender !== 'all') {
              filtered = filtered.filter(p => p.gender === gender || p.gender === 'Unisex');
            }
            productsMemoryCache.set(cacheKey, { data: filtered, timestamp });
            return filtered;
          }
        }
      } catch {}
    }

    // 3. If cache expired or not found, fetch fresh from API
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (gender && gender !== 'All') params.set('gender', gender);
      
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          productsMemoryCache.set(cacheKey, { data, timestamp: Date.now() });
          if (!category && (!gender || gender === 'All') && typeof window !== 'undefined') {
            try {
              localStorage.setItem('bb_products_cache', JSON.stringify({ data, timestamp: Date.now() }));
            } catch {}
          }
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/products proxy error:', err);
    }

    if (cached && cached.data.length > 0) {
      return cached.data;
    }

    return [];
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) return data;
      }
    } catch (err) {
      console.warn('API /api/products?id error:', err);
    }
    return null;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const created = await apiRequest<Product>(
      '/api/products',
      jsonInit('POST', product),
      'Failed to create product'
    );
    this.invalidateProductsCache();
    return created;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const updated = await apiRequest<Product>(
      '/api/products',
      jsonInit('PUT', { id, updates }),
      'Failed to update product'
    );
    this.invalidateProductsCache();
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiRequest(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Failed to delete product');
      this.invalidateProductsCache();
      return true;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 2. ORDERS
  // =========================================================================
  async getOrders(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `/api/orders?userId=${encodeURIComponent(userId)}` : '/api/orders';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('API /api/orders error:', err);
    }
    return [];
  },

  async createRazorpayOrder(payload: { items: any[]; customer: any; couponCode?: string }): Promise<any> {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initialize payment session');
    }
    return await res.json();
  },

  async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    orderId: string;
  }): Promise<any> {
    const res = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Payment verification failed');
    }
    return await res.json();
  },

  async cancelRazorpayOrder(orderId: string): Promise<any> {
    try {
      const res = await fetch('/api/razorpay/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to cancel order');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('cancelRazorpayOrder notice:', err.message || err);
      return { success: false, error: err.message };
    }
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string, trackingUrl?: string, customerData?: any): Promise<any> {
    return apiRequest(
      '/api/orders',
      jsonInit('PUT', {
        id,
        status,
        trackingNumber,
        trackingUrl,
        customerName: customerData?.name,
        customerEmail: customerData?.email,
        customerPhone: customerData?.phone,
        shippingAddress: customerData?.address ? customerData : undefined
      }),
      'Failed to update order status'
    );
  },

  // =========================================================================
  // 3. REVIEWS
  // =========================================================================
  async getReviews(productName?: string): Promise<Review[]> {
    try {
      const url = productName
        ? `/api/reviews?productName=${encodeURIComponent(productName)}`
        : '/api/reviews';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('API /api/reviews error:', err);
    }
    return [];
  },

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    return apiRequest('/api/reviews', jsonInit('POST', reviewData), 'Failed to submit review');
  },

  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    return apiRequest('/api/reviews', jsonInit('PUT', { id, updates: data }), 'Failed to update review');
  },

  async deleteReview(id: string): Promise<boolean> {
    await apiRequest(`/api/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Failed to delete review');
    return true;
  },

  // =========================================================================
  // 4. COUPONS
  // =========================================================================
  async getCoupons(): Promise<any[]> {
    try {
      const res = await fetch('/api/coupons', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('API /api/coupons error:', err);
    }
    return [];
  },

  async createCoupon(data: {
    code: string;
    discountPercentage?: number;
    discountAmount?: number;
    minOrderAmount?: number;
    isActive?: boolean;
  }): Promise<any> {
    return apiRequest('/api/coupons', jsonInit('POST', data), 'Failed to create coupon');
  },

  async updateCoupon(id: string, data: Partial<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
    minOrderAmount: number;
    isActive: boolean;
  }>): Promise<any> {
    return apiRequest('/api/coupons', jsonInit('PUT', { id, updates: data }), 'Failed to update coupon');
  },

  async deleteCoupon(id: string): Promise<boolean> {
    await apiRequest(`/api/coupons?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Failed to delete coupon');
    return true;
  },

  async validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
    try {
      return await apiRequest('/api/coupons/validate', jsonInit('POST', { code, orderTotal }), 'Invalid or expired coupon code');
    } catch {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }
  },

  // =========================================================================
  // 5. HERO SLIDES (short-lived localStorage cache)
  // =========================================================================
  async getHeroSlides(): Promise<any[]> {
    const now = Date.now();

    // 1. Check in-memory cache (fastest)
    if (heroSlidesMemoryCache && now - heroSlidesMemoryCache.timestamp < HERO_CACHE_TTL_MS && heroSlidesMemoryCache.data.length > 0) {
      return heroSlidesMemoryCache.data;
    }

    // 2. Check localStorage cache (within 15 minutes -> zero database call)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('bb_hero_slides_cache');
        if (raw) {
          const parsed = JSON.parse(raw);
          const data = Array.isArray(parsed) ? parsed : parsed?.data;
          const timestamp = Array.isArray(parsed) ? 0 : parsed?.timestamp || 0;
          if (Array.isArray(data) && data.length > 0 && now - timestamp < HERO_CACHE_TTL_MS) {
            heroSlidesMemoryCache = { data, timestamp };
            return data;
          }
        }
      } catch {}
    }

    // 3. If cache missing or expired -> fetch fresh from the API route
    try {
      const res = await fetch('/api/hero');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          heroSlidesMemoryCache = { data, timestamp: Date.now() };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('bb_hero_slides_cache', JSON.stringify({ data, timestamp: Date.now() }));
            } catch {}
          }
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/hero error:', err);
    }

    if (heroSlidesMemoryCache && heroSlidesMemoryCache.data.length > 0) {
      return heroSlidesMemoryCache.data;
    }

    return [];
  },

  async saveHeroSlide(slide: any): Promise<any> {
    const isExisting = slide.id && !String(slide.id).startsWith('slide-');
    const saved = await apiRequest(
      '/api/hero',
      jsonInit(isExisting ? 'PUT' : 'POST', slide),
      'Failed to save hero slide'
    );
    this.invalidateHeroCache();
    return saved;
  },

  async deleteHeroSlide(id: string): Promise<boolean> {
    try {
      await apiRequest(`/api/hero?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, 'Failed to delete slide');
      this.invalidateHeroCache();
      return true;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 6. COLLECTIONS (Story Circles)
  // =========================================================================
  async getCollections(): Promise<any[]> {
    try {
      const res = await fetch('/api/collections', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (err) {
      console.warn('API /api/collections error:', err);
    }
    return [];
  },

  async updateCollection(id: string, data: any): Promise<any> {
    const updated = await apiRequest(
      '/api/collections',
      jsonInit('PUT', { id, updates: data }),
      'Failed to update collection'
    );
    this.invalidateCollectionsCache();
    return updated;
  },

  // =========================================================================
  // 7. SETTINGS
  // =========================================================================
  async getSettings(): Promise<any> {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API /api/settings error:', err);
    }
    return null;
  },

  async updateSettings(settings: any): Promise<any> {
    return apiRequest('/api/settings', jsonInit('PUT', settings), 'Failed to save settings');
  },

  // =========================================================================
  // 8. ADMIN STATS
  // =========================================================================
  async getStats(): Promise<any> {
    return apiRequest('/api/stats', { cache: 'no-store' }, 'Failed to load dashboard stats');
  },

  // =========================================================================
  // 9. REELS & PRESS LOGOS
  // =========================================================================
  async getReels(): Promise<any[]> {
    try {
      const res = await fetch('/api/reels', { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch reels:', err);
    }
    return [];
  },

  async saveReels(reels: any[]): Promise<boolean> {
    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reels)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save reels:', err);
      return false;
    }
  },

  async getPressLogos(): Promise<any[]> {
    try {
      const res = await fetch('/api/press', { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch press logos:', err);
    }
    return [];
  },

  async savePressLogos(logos: any[]): Promise<boolean> {
    try {
      const res = await fetch('/api/press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logos)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save press logos:', err);
      return false;
    }
  },

  // =========================================================================
  // 10. CELEBRITIES & PERFUMERS
  // =========================================================================
  async getCelebrities(): Promise<any> {
    try {
      const res = await fetch('/api/celebrities', { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch celebrities:', err);
    }
    return [];
  },

  async saveCelebrities(celebrities: any): Promise<boolean> {
    try {
      const res = await fetch('/api/celebrities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(celebrities)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save celebrities:', err);
      return false;
    }
  },

  async getPerfumers(): Promise<any[]> {
    try {
      const res = await fetch('/api/perfumers', { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch perfumers:', err);
    }
    return [];
  },

  async savePerfumers(perfumers: any[]): Promise<boolean> {
    try {
      const res = await fetch('/api/perfumers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfumers)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save perfumers:', err);
      return false;
    }
  },

  // =========================================================================
  // 11. USER PROFILE & WISHLIST
  // =========================================================================
  async getUserProfile(userId: string): Promise<any> {
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
    return { phone: '', address: '', city: '', pincode: '', wishlist: [], recentViews: [] };
  },

  async saveUserProfile(userId: string, profileData: any): Promise<boolean> {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profileData })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save user profile:', err);
      return false;
    }
  },

  async syncUserWithAppwrite(userData: {
    userId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    pincode?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to sync user with Appwrite:', err);
      return false;
    }
  },

  // =========================================================================
  // 12. INSTAGRAM SHOWCASE
  // =========================================================================
  async getInstagramPosts(): Promise<any> {
    try {
      const res = await fetch('/api/instagram', { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch Instagram posts:', err);
    }
    return {
      title: '',
      handle: '',
      profileUrl: '',
      items: []
    };
  },

  async saveInstagramPosts(data: any): Promise<any | null> {
    try {
      const res = await fetch('/api/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Failed to save Instagram posts:', err);
      return null;
    }
  }
};
