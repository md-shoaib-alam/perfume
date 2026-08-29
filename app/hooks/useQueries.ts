'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Product, Review } from '../types';
import { slugify } from '../utils/slug';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const queryKeys = {
  products: (category?: string, gender?: string) => ['products', category || 'all', gender || 'all'] as const,
  allProducts: ['products'] as const,
  product: (idOrSlug: string) => ['product', idOrSlug] as const,
  collections: ['collections'] as const,
  heroSlides: ['heroSlides'] as const,
  settings: ['settings'] as const,
  reviews: (productName: string) => ['reviews', productName] as const,
  reels: ['reels'] as const,
  perfumers: ['perfumers'] as const,
  coupons: ['coupons'] as const,
};

// ---------------------------------------------------------------------------
// 1. Products Queries
// ---------------------------------------------------------------------------
export function useProductsQuery(category?: string, gender?: string) {
  return useQuery({
    queryKey: queryKeys.products(category, gender),
    queryFn: async () => {
      const data = await api.getProducts(category, gender);
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

export function useProductQuery(productIdOrSlug: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.product(productIdOrSlug),
    queryFn: async () => {
      if (!productIdOrSlug) return null;
      const normalizedParam = slugify(productIdOrSlug);

      // Check if product is already cached in any products query
      const allCachedQueries = queryClient.getQueriesData<Product[]>({ queryKey: queryKeys.allProducts });
      for (const [, products] of allCachedQueries) {
        if (Array.isArray(products)) {
          const match = products.find(
            (p) =>
              p.id === productIdOrSlug ||
              slugify(p.name) === normalizedParam ||
              slugify(p.name) === slugify(productIdOrSlug)
          );
          if (match) return match;
        }
      }

      // If not in cache, fetch directly via api
      const product = await api.getProductById(productIdOrSlug);
      return product || null;
    },
    enabled: Boolean(productIdOrSlug),
    staleTime: 1000 * 60 * 10,
  });
}

// ---------------------------------------------------------------------------
// 2. Collections Query
// ---------------------------------------------------------------------------
export function useCollectionsQuery() {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: async () => {
      const data = await api.getCollections();
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ---------------------------------------------------------------------------
// 3. Hero Slides Query
// ---------------------------------------------------------------------------
export function useHeroSlidesQuery() {
  return useQuery({
    queryKey: queryKeys.heroSlides,
    queryFn: async () => {
      const data = await api.getHeroSlides();
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ---------------------------------------------------------------------------
// 4. Store Settings Query
// ---------------------------------------------------------------------------
export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      const data = await api.getSettings();
      return data || null;
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ---------------------------------------------------------------------------
// 5. Reviews Query
// ---------------------------------------------------------------------------
export function useReviewsQuery(productName: string) {
  return useQuery({
    queryKey: queryKeys.reviews(productName),
    queryFn: async () => {
      if (!productName) return [];
      const data = await api.getReviews(productName);
      return data || [];
    },
    enabled: Boolean(productName),
    staleTime: 1000 * 60 * 5,
  });
}

// ---------------------------------------------------------------------------
// 6. Reels & Press Query
// ---------------------------------------------------------------------------
export function useReelsQuery() {
  return useQuery({
    queryKey: queryKeys.reels,
    queryFn: async () => {
      const data = await api.getReels();
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ---------------------------------------------------------------------------
// 7. Master Perfumers Query
// ---------------------------------------------------------------------------
export function usePerfumersQuery() {
  return useQuery({
    queryKey: queryKeys.perfumers,
    queryFn: async () => {
      const data = await api.getPerfumers();
      return data || [];
    },
    staleTime: 1000 * 60 * 20,
  });
}
