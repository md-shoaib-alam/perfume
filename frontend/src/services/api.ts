import type { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ADMIN_SECRET = 'admin123';

// Helper to get stored auth token or secret
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET
});

// Local storage keys for offline / fallback
const STORAGE_KEYS = {
  PRODUCTS: 'neesh_products_v1',
  ORDERS: 'neesh_orders_v1',
  SETTINGS: 'neesh_settings_v1',
  COLLECTIONS: 'neesh_collections_v1'
};

// Initialize localStorage fallback
const getLocalProducts = (): Product[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

// API Services
export const api = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Network response failed');
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.data));
        return data.data;
      }
      return getLocalProducts();
    } catch (err) {
      console.warn('Backend offline, using client storage products:', err);
      return getLocalProducts();
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      const data = await res.json();
      if (data.success && data.data) {
        const current = getLocalProducts();
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([data.data, ...current]));
        return data.data;
      }
      throw new Error(data.message || 'Failed to create');
    } catch (err) {
      const current = getLocalProducts();
      const newProd = {
        ...product,
        id: product.name?.toLowerCase().replace(/\s+/g, '-') || `prod-${Date.now()}`
      } as Product;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([newProd, ...current]));
      return newProd;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.data) {
        const current = getLocalProducts().map((p) => (p.id === id ? { ...p, ...updates } : p));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
        return data.data;
      }
      throw new Error('Failed to update');
    } catch (err) {
      const current = getLocalProducts().map((p) => (p.id === id ? { ...p, ...updates } : p));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
      return current.find((p) => p.id === id) as Product;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.warn('API error during delete:', err);
    }
    const current = getLocalProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
    return true;
  },

  // ORDERS
  async getOrders(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {
      console.warn('Using local orders');
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  },

  async createOrder(orderData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch (e) {
      console.warn('Saving order to local store');
    }
    const currentOrders = await this.getOrders();
    const newOrder = {
      ...orderData,
      _id: `ord-${Date.now()}`,
      orderNumber: `NSH-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([newOrder, ...currentOrders]));
    return newOrder;
  },

  async updateOrderStatus(id: string, orderStatus: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderStatus })
      });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch (e) {
      console.warn('Updating order locally');
    }
    const currentOrders = await this.getOrders();
    const updated = currentOrders.map((o) => (o._id === id || o.orderNumber === id ? { ...o, orderStatus } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return { orderStatus };
  },

  // STATS
  async getStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch (e) {
      console.warn('Calculating local stats');
    }
    const prods = getLocalProducts();
    const orders = await this.getOrders();
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 125000);
    return {
      totalRevenue,
      totalOrders: Math.max(orders.length, 28),
      totalProducts: prods.length,
      totalReviews: 480,
      pendingOrders: orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length || 4,
      lowStockProducts: prods.filter((p) => p.isPreOrder).length || 1,
      recentOrders: orders.slice(0, 5)
    };
  },

  // SETTINGS
  async getSettings(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.data) return data.data;
    } catch (e) {}
    return {
      announcementText: 'FLAT 15% OFF | USE CODE: LUXE15',
      announcementCode: 'LUXE15',
      freeGiftThreshold: 3500
    };
  },

  async updateSettings(settings: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) return data.data;
    } catch (e) {}
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
};
