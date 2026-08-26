'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getProductSlug } from '../utils/slug';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, unitPrice?: number) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct
}) => {
  const productSlug = getProductSlug(product);

  const sizes = useMemo(() => {
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      return product.sizeOptions.map((opt) => opt.size);
    }
    return [product.volume || '100ml'];
  }, [product.sizeOptions, product.volume]);

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || product.volume || '100ml');

  // Resync selectedSize if the product or available size list changes
  useEffect(() => {
    if (!sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0] || product.volume || '100ml');
    }
  }, [product.id, sizes, selectedSize, product.volume]);

  // Resolve active size option directly from database record
  const currentOption = useMemo(() => {
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      const match = product.sizeOptions.find((opt) => opt.size === selectedSize);
      if (match) return match;
    }
    return {
      size: product.volume || '100ml',
      price: product.price,
      isSoldOut: false
    };
  }, [product.sizeOptions, product.volume, product.price, selectedSize]);

  const currentPrice = currentOption.price;
  const isCurrentlySoldOut = !!currentOption.isSoldOut;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex flex-col justify-between items-center text-center font-serif bg-white h-full p-1 sm:p-2 rounded-xl border border-transparent">
      {/* Top Section */}
      <div className="w-full flex flex-col items-center">
        {/* Product Image */}
        <Link 
          href={`/products/${productSlug}`}
          onClick={(e) => {
            if (onSelectProduct) {
              // If parent handled it via custom handler
            }
          }}
          className="relative w-full aspect-square max-h-[190px] sm:max-h-none overflow-hidden mb-2.5 sm:mb-4 cursor-pointer bg-slate-100 rounded-lg group block"
        >
          {/* Skeleton shimmer before load */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-lg" />
          )}

          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Sold Out Badge when selected size is sold out */}
          {isCurrentlySoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-2xs">
              <div className="w-15 h-15 rounded-full bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center text-center shadow-md border border-slate-100">
                <span className="text-[10px] font-extrabold tracking-wider leading-tight text-slate-900">SOLD</span>
                <span className="text-[10px] font-extrabold tracking-wider leading-tight text-slate-900">OUT</span>
              </div>
            </div>
          )}
        </Link>

        {/* Product Name */}
        <Link 
          href={`/products/${productSlug}`}
          className="font-serif text-lg sm:text-2xl font-normal text-slate-800 cursor-pointer hover:text-[#d6a750] transition-colors leading-tight mb-1 block"
        >
          {product.name}
        </Link>

        {/* Subtitle / Category */}
        <p className="text-[11px] sm:text-xs font-sans text-slate-400 font-normal tracking-wider mb-1.5 sm:mb-2">
          {product.category === 'extrait-de-parfum' ? 'Extrait De Parfum' : product.category}
        </p>

        {/* Description / Accords */}
        <p className="text-[11px] sm:text-xs font-sans text-slate-500 font-normal leading-relaxed max-w-xs mb-2 sm:mb-3 px-1 line-clamp-2">
          {product.subtitle}
        </p>

        {/* Price */}
        <p className="text-xs sm:text-sm font-sans font-bold text-slate-900 mb-3 sm:mb-4">
          Rs.{currentPrice.toLocaleString('en-IN')}.00
        </p>

        {/* Dynamic Size Selector Pills (Only when sizes are defined) */}
        {sizes.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-2.5 py-0.5 sm:px-4 sm:py-1 text-[11px] sm:text-xs font-sans rounded-full transition-all border cursor-pointer ${
                  selectedSize === size
                    ? 'bg-[#353534] text-white border-[#353534] font-bold'
                    : 'bg-[#f5f5f5] text-slate-600 border-transparent hover:bg-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Add to Cart Button */}
      <div className="w-full mt-auto">
        <button
          type="button"
          onClick={() => onAddToCart(product, selectedSize, currentPrice)}
          disabled={isCurrentlySoldOut}
          className={`w-full py-2.5 sm:py-3.5 px-4 font-sans font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-300 shadow-2xs rounded-lg ${
            isCurrentlySoldOut
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#caa04c] text-[#222222] hover:bg-[#b88f3e] hover:text-white active:scale-98 cursor-pointer'
          }`}
        >
          {isCurrentlySoldOut ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
};
