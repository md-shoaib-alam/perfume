'use client';

import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between items-center text-center font-serif bg-white h-full p-1 sm:p-2 rounded-xl border border-transparent animate-pulse select-none">
      {/* Top Section */}
      <div className="w-full flex flex-col items-center">
        {/* Product Image Skeleton */}
        <div className="relative w-full aspect-square bg-slate-100 rounded-lg mb-2.5 sm:mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Product Name Skeleton */}
        <div className="h-5 sm:h-6 lg:h-[30px] w-1/2 bg-slate-200/80 rounded-md mb-1" />

        {/* Category Subtitle Skeleton */}
        <div className="h-[15px] sm:h-4 w-1/3 bg-slate-100 rounded-md mb-1 sm:mb-1.5" />

        {/* Subtitle / Accords Skeleton */}
        <div className="h-3 sm:h-[15px] w-5/6 bg-slate-100 rounded-md mb-1.5 sm:mb-2.5" />

        {/* Price Skeleton */}
        <div className="h-4 sm:h-5 w-1/5 bg-slate-200/90 rounded-md mb-2 sm:mb-3" />

        {/* Size Pills Skeleton */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <div className="h-5 sm:h-[26px] w-10 sm:w-14 bg-slate-100 rounded-full" />
          <div className="h-5 sm:h-[26px] w-10 sm:w-14 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* Bottom Section: Add to Cart Button Skeleton */}
      <div className="w-full mt-auto pt-1">
        <div className="w-full h-8 sm:h-10 bg-slate-200/80 rounded-md" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Gallery Skeleton */}
        <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 items-start">
          <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto w-full md:w-20 md:shrink-0 md:max-h-[580px] pb-2 md:pb-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-2 border-slate-200 bg-slate-100 shrink-0" />
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-2 border-slate-200 bg-slate-100 shrink-0" />
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-2 border-slate-200 bg-slate-100 shrink-0" />
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-2 border-slate-200 bg-slate-100 shrink-0" />
          </div>
          <div className="aspect-square w-full flex-1 bg-slate-100 border border-slate-200/80" />
        </div>

        {/* Details Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-4 w-28 bg-slate-200 rounded-full" />
              <div className="h-5 w-14 bg-slate-100 rounded-full" />
            </div>
            <div className="h-8 sm:h-9 lg:h-10 w-1/2 bg-slate-200 rounded-lg" />
            <div className="h-5 w-full bg-slate-100 rounded-md mt-2" />
            <div className="h-4 w-2/5 bg-slate-100 rounded-md mt-3" />
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="h-8 sm:h-9 w-32 bg-slate-200 rounded-lg" />
            <div className="h-3 w-28 bg-slate-100 rounded-md mt-1" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded-md" />
            <div className="flex flex-wrap gap-2.5">
              <div className="h-[38px] w-16 sm:w-20 bg-slate-100 rounded-xl" />
              <div className="h-[38px] w-16 sm:w-20 bg-slate-100 rounded-xl" />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3">
              <div className="h-11 w-28 bg-slate-100 rounded-xl" />
              <div className="h-11 flex-1 bg-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200">
            <div className="h-11 bg-amber-50/50 border border-amber-200/60 rounded-xl" />
            <div className="h-11 bg-amber-50/50 border border-amber-200/60 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
};
