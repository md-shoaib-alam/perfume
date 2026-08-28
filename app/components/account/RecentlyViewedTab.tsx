'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecentlyViewed, removeRecentlyViewed, clearRecentlyViewed } from '../../utils/recentlyViewed';
import { slugify } from '../../utils/slug';
import type { Product } from '../../types';

interface RecentlyViewedTabProps {
  onAddToCart?: (product: Product, size?: string) => void;
  onShopNow?: () => void;
}

export const RecentlyViewedTab: React.FC<RecentlyViewedTabProps> = ({
  onAddToCart,
  onShopNow
}) => {
  const [recentItems, setRecentItems] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const loadItems = () => {
    const items = getRecentlyViewed();
    setRecentItems(items);
  };

  useEffect(() => {
    loadItems();

    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener('recently_viewed_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('recently_viewed_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = removeRecentlyViewed(productId);
    setRecentItems(updated);
  };

  const handleClear = () => {
    clearRecentlyViewed();
    setRecentItems([]);
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, product.volume || '100ml');
      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recently Viewed Fragrances
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fragrances and discovery formulations you recently explored.
          </p>
        </div>

        {recentItems.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all border border-slate-200 hover:border-red-200 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {recentItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-100 text-center shadow-xs max-w-md mx-auto my-6 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center text-[#caa04c]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">No Recently Viewed Fragrances</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              When you explore our extrait de parfums and olfactory collections, they will automatically appear here for quick access.
            </p>
          </div>
          {onShopNow ? (
            <button
              type="button"
              onClick={onShopNow}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Explore All Fragrances</span>
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : (
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Explore All Fragrances</span>
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
        </div>
      ) : (
        /* Grid of Product Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {recentItems.map((prod) => {
            const productSlug = slugify(prod.name || prod.id || '');
            const productHref = productSlug ? `/products/${productSlug}` : `/products/${prod.id}`;
            const isAdded = !!addedIds[prod.id];
            const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;

            return (
              <div
                key={prod.id}
                className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-amber-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, prod.id)}
                  title="Remove from history"
                  className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 hover:border-red-300 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all shadow-2xs cursor-pointer opacity-80 hover:opacity-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Top Image + Link */}
                <Link href={productHref} className="block relative cursor-pointer overflow-hidden bg-slate-50">
                  <div className="w-full aspect-square relative flex items-center justify-center p-3">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-amber-50/50 flex items-center justify-center text-[#caa04c] font-serif font-bold text-sm">
                        BB
                      </div>
                    )}
                  </div>

                  {/* Category / Gender Badge */}
                  {(prod.category || prod.gender) && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/95 text-[#b88f3e] border border-amber-200/60 rounded-md backdrop-blur-xs shadow-2xs">
                        {prod.category ? prod.category.replace(/-/g, ' ') : prod.gender}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Details Section */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <Link href={productHref} className="block group-hover:text-[#caa04c] transition-colors cursor-pointer">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {prod.subtitle || prod.volume || 'Extrait de Parfum'}
                    </p>
                  </Link>

                  {/* Price & Rating */}
                  <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        Rs.{prod.price.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through">
                          Rs.{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {prod.rating > 0 && (
                      <div className="flex items-center gap-0.5 text-[#caa04c] text-[10px] font-bold shrink-0">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{prod.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, prod)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
