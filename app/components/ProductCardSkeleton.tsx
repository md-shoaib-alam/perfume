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
        <div className="h-5 sm:h-6 w-3/4 bg-slate-200/80 rounded-md mb-2" />

        {/* Category Subtitle Skeleton */}
        <div className="h-3 w-1/3 bg-slate-100 rounded-md mb-2" />

        {/* Subtitle / Accords Skeleton */}
        <div className="h-3 w-2/3 bg-slate-100 rounded-md mb-3 hidden sm:block" />

        {/* Price Skeleton */}
        <div className="h-4 w-1/4 bg-slate-200/90 rounded-md mb-3" />

        {/* Size Pills Skeleton */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div className="h-5 w-10 sm:h-6 sm:w-12 bg-slate-100 rounded-full" />
          <div className="h-5 w-10 sm:h-6 sm:w-12 bg-slate-100 rounded-full" />
          <div className="h-5 w-10 sm:h-6 sm:w-12 bg-slate-100 rounded-full" />
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <main className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Gallery Skeleton */}
        <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 items-start">
          <div className="flex md:flex-col gap-2.5 w-full md:w-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-none" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-none" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-none" />
          </div>
          <div className="aspect-square w-full flex-1 bg-slate-100 rounded-none" />
        </div>

        {/* Details Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-slate-200 rounded-full" />
            <div className="h-8 sm:h-10 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-full bg-slate-100 rounded-md" />
            <div className="h-4 w-1/3 bg-slate-100 rounded-md" />
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="h-8 w-36 bg-slate-200 rounded-lg" />
            <div className="h-3 w-28 bg-slate-100 rounded-md" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded-md" />
            <div className="flex gap-2.5">
              <div className="h-10 w-20 bg-slate-100 rounded-xl" />
              <div className="h-10 w-20 bg-slate-100 rounded-xl" />
              <div className="h-10 w-20 bg-slate-100 rounded-xl" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <div className="h-12 w-28 bg-slate-100 rounded-xl" />
            <div className="h-12 flex-1 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
};
