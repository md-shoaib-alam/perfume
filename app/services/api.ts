import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import type { Product, Review } from '../types';
import { resolveProductSizeOptions } from '@/lib/pricing';

// Helper to format Appwrite Product document to Product interface
const formatProductDoc = (doc: any): Product => {
  let parsedNotes = { top: [] as string[], heart: [] as string[], base: [] as string[] };
  if (doc.notes) {
    try {
      parsedNotes = typeof doc.notes === 'string' ? JSON.parse(doc.notes) : doc.notes;
    } catch (e) {
      parsedNotes = { top: [String(doc.notes)], heart: [], base: [] };
    }
  }

  const parsedSizeOptions = resolveProductSizeOptions(doc);

  let parsedStoryBlocks = [];
  if (doc.storyBlocks) {
    try {
      parsedStoryBlocks = typeof doc.storyBlocks === 'string' ? JSON.parse(doc.storyBlocks) : doc.storyBlocks;
    } catch (e) {
      parsedStoryBlocks = [];
    }
  }

  return {
    id: doc.$id || doc.id,
    name: doc.name || 'Untitled Perfume',
    subtitle: doc.subtitle || '',
    category: doc.category || 'extrait-de-parfum',
    gender: doc.gender || 'Unisex',
    price: Number(doc.price) || 0,
    originalPrice: Number(doc.originalPrice || doc.price) || 0,
    rating: Number(doc.rating) || 4.8,
    reviewsCount: Number(doc.reviewsCount) || 0,
    volume: doc.volume || '100ml',
    image: doc.image || '',
    hoverImage: doc.hoverImage || doc.image || '',
    isBestseller: Boolean(doc.isBestseller),
    isNew: Boolean(doc.isNew),
    isPreOrder: Boolean(doc.isPreOrder),
    shippingNote: doc.shippingNote || '',
    buttonText: doc.buttonText || '',
    tagline: doc.tagline || '',
    badgeText: doc.badgeText || '',
    badgeSubtext: doc.badgeSubtext || '',
    notes: parsedNotes,
    description: doc.description || '',
    stock: doc.stock == null ? 100 : Number(doc.stock),
    collection: doc.collection || '',
    sizeOptions: parsedSizeOptions,
    storyBlocks: parsedStoryBlocks
  };
};

// Client in-memory cache for ultra-fast instant rendering
const productsMemoryCache = new Map<string, { data: Product[]; timestamp: number }>();
let heroSlidesMemoryCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const api = {
  // Clear cache helper
  invalidateProductsCache() {
    productsMemoryCache.clear();
  },
  invalidateHeroCache() {
    heroSlidesMemoryCache = null;
  },

  // =========================================================================
  // 1. PRODUCTS
  // =========================================================================
  async getProducts(category?: string, gender?: string): Promise<Product[]> {
    const cacheKey = `${category || ''}_${gender || ''}`;
    const cached = productsMemoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS && cached.data.length > 0) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (gender && gender !== 'All') params.set('gender', gender);
      
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          productsMemoryCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/products proxy error, trying direct SDK:', err);
    }

    try {
      const queries: string[] = [Query.limit(100)];
      if (category) queries.push(Query.equal('category', category));
      if (gender && gender !== 'All') queries.push(Query.equal('gender', gender));

      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'products', queries);
      if (res && res.documents) {
        const formatted = res.documents.map(formatProductDoc);
        if (formatted.length > 0) {
          productsMemoryCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
        }
        return formatted;
      }
    } catch (err) {
      console.warn('Appwrite getProducts query error:', err);
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
      console.warn('API /api/products/[id] error, trying direct SDK:', err);
    }

    try {
      const doc = await databases.getDocument(APPWRITE_DATABASE_ID, 'products', id);
      return formatProductDoc(doc);
    } catch (err) {
      try {
        const list = await databases.listDocuments(APPWRITE_DATABASE_ID, 'products', [Query.limit(100)]);
        const match = (list.documents || []).find((d: any) => {
          const s = (d.name || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/&/g, '-and-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
          return s === id.toLowerCase() || d.$id === id;
        });
        if (match) return formatProductDoc(match);
      } catch (listErr) {
        console.warn('Appwrite getProductById query error:', listErr);
      }
      return null;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API createProduct failed, fallback to SDK:', err);
    }

    try {
      const docData: any = {
        name: product.name || 'Untitled Perfume',
        subtitle: product.subtitle || '',
        category: product.category || 'extrait-de-parfum',
        gender: product.gender || 'Unisex',
        price: Number(product.price || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        rating: Number(product.rating || 4.8),
        reviewsCount: Number(product.reviewsCount || 0),
        volume: product.volume || '100ml',
        image: product.image || '',
        hoverImage: product.hoverImage || product.image || '',
        description: product.description || '',
        notes: JSON.stringify(product.notes || {}),
        isBestseller: Boolean(product.isBestseller),
        isNew: Boolean(product.isNew),
        isPreOrder: Boolean(product.isPreOrder),
        shippingNote: product.shippingNote || '',
        buttonText: product.buttonText || '',
        tagline: product.tagline || '',
        badgeText: product.badgeText || '',
        badgeSubtext: product.badgeSubtext || '',
        collection: product.collection || '',
        sizeOptions: JSON.stringify(product.sizeOptions || []),
        storyBlocks: JSON.stringify(product.storyBlocks || []),
        stock: product.stock == null ? 100 : Number(product.stock)
      };

      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'products',
        ID.unique(),
        docData
      );
      this.invalidateProductsCache();
      return formatProductDoc(doc);
    } catch (err: any) {
      console.error('Appwrite createProduct error:', err);
      throw new Error(err.message || 'Failed to create product in Appwrite');
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });
      if (res.ok) {
        this.invalidateProductsCache();
        return await res.json();
      }
    } catch (err) {
      console.warn('API updateProduct failed, fallback to SDK:', err);
    }

    try {
      const cleanData: any = {};
      if (updates.name !== undefined) cleanData.name = updates.name;
      if (updates.subtitle !== undefined) cleanData.subtitle = updates.subtitle;
      if (updates.category !== undefined) cleanData.category = updates.category;
      if (updates.gender !== undefined) cleanData.gender = updates.gender;
      if (updates.collection !== undefined) cleanData.collection = updates.collection;
      if (updates.price !== undefined) cleanData.price = Number(updates.price);
      if (updates.originalPrice !== undefined) cleanData.originalPrice = Number(updates.originalPrice);
      if (updates.rating !== undefined) cleanData.rating = Number(updates.rating);
      if (updates.reviewsCount !== undefined) cleanData.reviewsCount = Number(updates.reviewsCount);
      if (updates.volume !== undefined) cleanData.volume = updates.volume;
      if (updates.image !== undefined) cleanData.image = updates.image;
      if (updates.hoverImage !== undefined) cleanData.hoverImage = updates.hoverImage;
      if (updates.description !== undefined) cleanData.description = updates.description;
      if (updates.notes !== undefined) cleanData.notes = typeof updates.notes === 'string' ? updates.notes : JSON.stringify(updates.notes);
      if (updates.isBestseller !== undefined) cleanData.isBestseller = Boolean(updates.isBestseller);
      if (updates.isNew !== undefined) cleanData.isNew = Boolean(updates.isNew);
      if (updates.isPreOrder !== undefined) cleanData.isPreOrder = Boolean(updates.isPreOrder);
      if (updates.shippingNote !== undefined) cleanData.shippingNote = updates.shippingNote;
      if (updates.buttonText !== undefined) cleanData.buttonText = updates.buttonText;
      if (updates.tagline !== undefined) cleanData.tagline = updates.tagline;
      if (updates.badgeText !== undefined) cleanData.badgeText = updates.badgeText;
      if (updates.badgeSubtext !== undefined) cleanData.badgeSubtext = updates.badgeSubtext;
      if (updates.sizeOptions !== undefined) cleanData.sizeOptions = typeof updates.sizeOptions === 'string' ? updates.sizeOptions : JSON.stringify(updates.sizeOptions);
      if (updates.storyBlocks !== undefined) cleanData.storyBlocks = typeof updates.storyBlocks === 'string' ? updates.storyBlocks : JSON.stringify(updates.storyBlocks);
      if (updates.stock !== undefined) cleanData.stock = updates.stock == null ? 100 : Number(updates.stock);

      const doc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'products',
        id,
        cleanData
      );
      this.invalidateProductsCache();
      return formatProductDoc(doc);
    } catch (err: any) {
      console.error('Appwrite updateProduct error:', err);
      throw new Error(err.message || 'Failed to update product in Appwrite');
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        this.invalidateProductsCache();
        return true;
      }
    } catch (err) {
      console.warn('API deleteProduct failed, fallback to SDK:', err);
    }

    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, 'products', id);
      this.invalidateProductsCache();
      return true;
    } catch (err: any) {
      console.error('Appwrite deleteProduct error:', err);
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
      console.warn('API /api/orders error, trying direct SDK:', err);
    }

    try {
      const queries: string[] = [Query.limit(100), Query.orderDesc('$createdAt')];
      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'orders', queries);
      if (res && res.documents) {
        return res.documents.map((doc: any) => {
          let parsedItems = [];
          try {
            parsedItems = typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items;
          } catch (e) {
            parsedItems = [];
          }
          let parsedShipping: any = {};
          try {
            parsedShipping = typeof doc.shippingAddress === 'string' ? JSON.parse(doc.shippingAddress) : (doc.shippingAddress || {});
          } catch (e) {
            parsedShipping = {};
          }
          return {
            _id: doc.$id,
            id: doc.$id,
            orderNumber: `NSH-${doc.$id.slice(-5).toUpperCase()}`,
            userId: doc.userId,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
            customerPhone: doc.customerPhone,
            shippingAddress: doc.shippingAddress,
            total: Number(doc.totalAmount),
            totalAmount: Number(doc.totalAmount),
            status: doc.status || 'pending',
            orderStatus: doc.status || 'pending',
            paymentStatus: doc.paymentStatus || 'pending',
            paymentMethod: doc.paymentMethod || parsedShipping?.paymentMethod || (doc.paymentStatus === 'paid' ? 'razorpay' : 'cod'),
            items: parsedItems,
            createdAt: doc.$createdAt
          };
        });
      }
    } catch (err) {
      console.warn('Appwrite getOrders error:', err);
    }
    return [];
  },

  async createOrder(orderData: any): Promise<any> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API createOrder failed, fallback to direct SDK:', err);
    }

    try {
      const shippingObj = typeof orderData.shippingAddress === 'object' && orderData.shippingAddress !== null
        ? { ...orderData.shippingAddress, paymentMethod: orderData.paymentMethod || 'cod' }
        : { address: String(orderData.shippingAddress || '').trim(), paymentMethod: orderData.paymentMethod || 'cod' };

      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'orders',
        ID.unique(),
        {
          userId: orderData.userId || '',
          customerName: orderData.customerName || orderData.name || 'Customer',
          customerEmail: orderData.customerEmail || orderData.email || '',
          customerPhone: orderData.customerPhone || orderData.phone || '',
          shippingAddress: JSON.stringify(shippingObj),
          totalAmount: Number(orderData.total || orderData.totalAmount || 0),
          status: orderData.status || 'pending',
          paymentStatus: orderData.paymentStatus || 'pending',
          items: JSON.stringify(orderData.items || [])
        }
      );
      return {
        _id: doc.$id,
        id: doc.$id,
        orderNumber: `NSH-${doc.$id.slice(-5).toUpperCase()}`,
        ...orderData,
        createdAt: doc.$createdAt
      };
    } catch (err: any) {
      console.error('Appwrite createOrder error:', err);
      throw new Error(err.message || 'Failed to place order in Appwrite');
    }
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

  async updateOrderStatus(id: string, status: string, trackingNumber?: string, trackingUrl?: string): Promise<any> {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, trackingNumber, trackingUrl })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API updateOrderStatus failed, fallback to direct SDK:', err);
    }

    try {
      const payload: any = { status };
      if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
      if (trackingUrl !== undefined) payload.trackingUrl = trackingUrl;

      const doc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'orders',
        id,
        payload
      );
      return { id: doc.$id, status: doc.status, trackingNumber: (doc as any).trackingNumber, trackingUrl: (doc as any).trackingUrl };
    } catch (err: any) {
      console.error('Appwrite updateOrderStatus error:', err);
      throw new Error(err.message || 'Failed to update order status');
    }
  },

  // =========================================================================
  // 3. REVIEWS
  // =========================================================================
  async getReviews(productName?: string): Promise<Review[]> {
    try {
      const queries: string[] = [Query.limit(50), Query.orderDesc('$createdAt')];
      if (productName) {
        queries.push(Query.equal('productName', productName));
      }
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'reviews', queries);
      if (res && res.documents) {
        return res.documents.map((d: any) => ({
          id: d.$id,
          author: d.author,
          rating: Number(d.rating) || 5,
          date: d.date || 'Recent',
          title: d.title || '',
          comment: d.comment,
          verified: Boolean(d.verified),
          productName: d.productName,
          approved: d.approved !== undefined ? Boolean(d.approved) : true
        }));
      }
    } catch (err) {
      console.warn('Appwrite getReviews error:', err);
    }
    return [];
  },

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    try {
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'reviews',
        ID.unique(),
        {
          productName: reviewData.productName || 'General',
          author: reviewData.author || 'Verified Customer',
          rating: Number(reviewData.rating || 5),
          title: reviewData.title || '',
          comment: reviewData.comment || '',
          verified: true,
          approved: true,
          date: new Date().toISOString().split('T')[0]
        }
      );
      return {
        id: doc.$id,
        author: doc.author,
        rating: Number(doc.rating),
        date: doc.date,
        title: doc.title,
        comment: doc.comment,
        verified: doc.verified,
        productName: doc.productName,
        approved: doc.approved !== undefined ? Boolean(doc.approved) : true
      };
    } catch (err: any) {
      console.error('Appwrite createReview error:', err);
      throw new Error(err.message || 'Failed to submit review');
    }
  },

  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    try {
      const doc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'reviews',
        id,
        data
      );
      return {
        id: doc.$id,
        author: doc.author,
        rating: Number(doc.rating),
        date: doc.date,
        title: doc.title,
        comment: doc.comment,
        verified: doc.verified,
        productName: doc.productName,
        approved: doc.approved !== undefined ? Boolean(doc.approved) : true
      };
    } catch (err: any) {
      console.error('Appwrite updateReview error:', err);
      throw err;
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, 'reviews', id);
      return true;
    } catch (err: any) {
      console.error('Appwrite deleteReview error:', err);
      throw err;
    }
  },

  // =========================================================================
  // 4. COUPONS
  // =========================================================================
  async getCoupons(): Promise<any[]> {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [Query.limit(50)]);
      if (res && res.documents) {
        return res.documents.map(d => ({
          id: d.$id,
          code: d.code,
          discountPercentage: d.discountPercentage,
          discountAmount: d.discountAmount,
          minOrderAmount: d.minOrderAmount,
          isActive: d.isActive
        }));
      }
    } catch (err) {
      console.warn('Appwrite getCoupons error:', err);
    }
    return [];
  },

  async validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        'coupons',
        [Query.equal('code', cleanCode), Query.equal('isActive', true)]
      );

      if (res.documents && res.documents.length > 0) {
        const coupon = res.documents[0];
        if (orderTotal < Number(coupon.minOrderAmount || 0)) {
          return {
            valid: false,
            discount: 0,
            message: `Minimum order amount of Rs.${coupon.minOrderAmount} required.`
          };
        }

        let discount = 0;
        if (coupon.discountPercentage > 0) {
          discount = Math.round((orderTotal * coupon.discountPercentage) / 100);
        } else if (coupon.discountAmount > 0) {
          discount = Number(coupon.discountAmount);
        }

        return {
          valid: true,
          discount,
          message: `Coupon ${cleanCode} applied! Saved Rs.${discount}`
        };
      }
    } catch (err) {
      console.warn('Appwrite validateCoupon error:', err);
    }
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
  },

  // =========================================================================
  // 5. HERO SLIDES
  // =========================================================================
  async getHeroSlides(): Promise<any[]> {
    const now = Date.now();
    if (heroSlidesMemoryCache && now - heroSlidesMemoryCache.timestamp < CACHE_TTL_MS && heroSlidesMemoryCache.data.length > 0) {
      return heroSlidesMemoryCache.data;
    }

    try {
      const res = await fetch('/api/hero');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          heroSlidesMemoryCache = { data, timestamp: Date.now() };
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/hero error, trying direct SDK:', err);
    }

    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'hero_slides', [Query.limit(10)]);
      if (res && res.documents) {
        const formatted = res.documents.map(d => ({
          id: d.$id,
          name: d.name,
          desktopImage: d.desktopImage,
          mobileImage: d.mobileImage,
          linkUrl: d.linkUrl
        }));
        if (formatted.length > 0) {
          heroSlidesMemoryCache = { data: formatted, timestamp: Date.now() };
        }
        return formatted;
      }
    } catch (err) {
      console.warn('Appwrite getHeroSlides error:', err);
    }

    if (heroSlidesMemoryCache && heroSlidesMemoryCache.data.length > 0) {
      return heroSlidesMemoryCache.data;
    }

    return [];
  },

  async saveHeroSlide(slide: any): Promise<any> {
    try {
      let res;
      if (slide.id && !slide.id.startsWith('slide-')) {
        res = await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          'hero_slides',
          slide.id,
          {
            name: slide.name,
            desktopImage: slide.desktopImage,
            mobileImage: slide.mobileImage,
            linkUrl: slide.linkUrl
          }
        );
      } else {
        res = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'hero_slides',
          ID.unique(),
          {
            name: slide.name,
            desktopImage: slide.desktopImage,
            mobileImage: slide.mobileImage,
            linkUrl: slide.linkUrl
          }
        );
      }
      this.invalidateHeroCache();
      return res;
    } catch (err: any) {
      console.error('Appwrite saveHeroSlide error:', err);
      throw err;
    }
  },

  async deleteHeroSlide(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, 'hero_slides', id);
      this.invalidateHeroCache();
      return true;
    } catch (err) {
      console.error('Appwrite deleteHeroSlide error:', err);
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
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('API /api/collections error, trying direct SDK:', err);
    }

    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'collections', [Query.limit(50)]);
      if (res && res.documents) {
        return res.documents.map((d: any) => ({
          id: d.$id,
          slug: d.slug || '',
          name: d.name || '',
          subname: d.subname || '',
          image: d.image || '',
          bannerImage: d.bannerImage || '',
          subtitle: d.subtitle || '',
          editorial: d.editorial || '',
          badge: d.badge || ''
        }));
      }
    } catch (err) {
      console.warn('Appwrite getCollections error:', err);
    }
    return [];
  },

  async updateCollection(id: string, data: any): Promise<any> {
    try {
      const cleanData: any = {};
      if (data.name !== undefined) cleanData.name = data.name;
      if (data.subname !== undefined) cleanData.subname = data.subname;
      if (data.image !== undefined) cleanData.image = data.image;
      if (data.slug !== undefined) cleanData.slug = data.slug;
      if (data.bannerImage !== undefined) cleanData.bannerImage = data.bannerImage;
      if (data.subtitle !== undefined) cleanData.subtitle = data.subtitle;
      if (data.editorial !== undefined) cleanData.editorial = data.editorial;
      if (data.badge !== undefined) cleanData.badge = data.badge;

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'collections',
        id,
        cleanData
      );
    } catch (err: any) {
      console.error('Appwrite updateCollection error:', err);
      throw err;
    }
  },

  // =========================================================================
  // 7. SETTINGS
  // =========================================================================
  async getSettings(): Promise<any> {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'settings', [Query.limit(1)]);
      if (res.documents && res.documents.length > 0) {
        return res.documents[0];
      }
    } catch (err) {
      console.warn('Appwrite getSettings error:', err);
    }
    return null;
  },

  async updateSettings(settings: any): Promise<any> {
    try {
      const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'settings', [Query.limit(1)]);
      if (existing.documents && existing.documents.length > 0) {
        const docId = existing.documents[0].$id;
        const doc = await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          'settings',
          docId,
          settings
        );
        return doc;
      } else {
        const doc = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'settings',
          ID.unique(),
          settings
        );
        return doc;
      }
    } catch (err: any) {
      console.error('Appwrite updateSettings error:', err);
      throw err;
    }
  },

  // =========================================================================
  // 8. ADMIN STATS
  // =========================================================================
  async getStats(): Promise<any> {
    try {
      const [prodsRes, ordersRes, reviewsRes] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, 'products', [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, 'orders', [Query.limit(100), Query.orderDesc('$createdAt')]),
        databases.listDocuments(APPWRITE_DATABASE_ID, 'reviews', [Query.limit(100)])
      ]);

      const orders = ordersRes.documents;
      const totalRevenue = orders.reduce((sum, o: any) => sum + (Number(o.totalAmount) || 0), 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length;

      // Dynamic past 7 days velocity
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          day: days[d.getDay()],
          dateStr: d.toISOString().split('T')[0],
          revenue: 0,
          orders: 0
        };
      });

      orders.forEach((o: any) => {
        const orderDate = (o.$createdAt || '').split('T')[0];
        const match = past7Days.find(p => p.dateStr === orderDate);
        if (match) {
          match.revenue += Number(o.totalAmount || 0);
          match.orders += 1;
        }
      });

      const maxDayRevenue = Math.max(...past7Days.map(d => d.revenue), 1);
      const weeklyTrends = past7Days.map(d => ({
        day: d.day,
        amt: d.revenue >= 1000 ? `₹${(d.revenue / 1000).toFixed(0)}k` : `₹${d.revenue}`,
        val: d.revenue === 0 ? 8 : Math.max(12, Math.round((d.revenue / maxDayRevenue) * 100))
      }));

      const stockAlerts = prodsRes.documents.slice(0, 5).map((p: any) => ({
        id: p.$id,
        name: p.name,
        volume: p.volume || '100ml',
        stock: Number(p.stock !== undefined ? p.stock : 100),
        isLow: Number(p.stock !== undefined ? p.stock : 100) < 20,
        isPreOrder: Boolean(p.isPreOrder)
      }));

      return {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: prodsRes.total,
        totalReviews: reviewsRes.total,
        pendingOrders,
        lowStockProducts: prodsRes.documents.filter((p: any) => Number(p.stock) < 20).length,
        weeklyTrends,
        stockAlerts,
        recentOrders: orders.slice(0, 5).map(o => ({
          _id: o.$id,
          id: o.$id,
          orderNumber: `NSH-${o.$id.slice(-5).toUpperCase()}`,
          customerName: o.customerName,
          total: Number(o.totalAmount),
          status: o.status,
          createdAt: o.$createdAt
        }))
      };
    } catch (err) {
      console.warn('Appwrite getStats error:', err);
      throw err;
    }
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

  async getPressLogos(): Promise<string[]> {
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

  async savePressLogos(logos: string[]): Promise<boolean> {
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
  async getCelebrities(): Promise<any[]> {
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

  async saveCelebrities(celebrities: any[]): Promise<boolean> {
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
  }
};
