'use client';
import React, { useState } from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct
}) => {
  const sizes = product.sizeOptions && product.sizeOptions.length > 0
    ? product.sizeOptions.map((opt) => opt.size)
    : ['100ml', '50ml', '15ml'];

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '100ml');

  // Compute price for selected size
  const getCurrentSizeOption = () => {
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      const match = product.sizeOptions.find((opt) => opt.size === selectedSize);
      if (match) return match;
    }
    // Fallback calculations
    if (selectedSize === '15ml') {
      return {
        size: '15ml',
        price: product.id === 'haute-vetiver' ? 1900 : Math.round(product.price * 0.224),
        isSoldOut: product.id === 'haute-vetiver'
      };
    }
    if (selectedSize === '50ml') {
      return {
        size: '50ml',
        price: Math.round(product.price * 0.58),
        isSoldOut: false
      };
    }
    return {
      size: '100ml',
      price: product.price,
      isSoldOut: false
    };
  };

  const currentOption = getCurrentSizeOption();
  const currentPrice = currentOption.price;
  const isCurrentlySoldOut = !!currentOption.isSoldOut;

  return (
    <div className="flex flex-col justify-between items-center text-center font-serif bg-white h-full p-1 sm:p-2 rounded-xl border border-transparent">
      {/* Top Section */}
      <div className="w-full flex flex-col items-center">
        {/* Product Image */}
        <div 
          onClick={() => onSelectProduct(product)}
          className="relative w-full aspect-square max-h-[190px] sm:max-h-none overflow-hidden mb-2.5 sm:mb-4 cursor-pointer bg-slate-50 rounded-lg group"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        </div>

        {/* Product Name */}
        <h3 
          onClick={() => onSelectProduct(product)}
          className="font-serif text-lg sm:text-2xl font-normal text-slate-800 cursor-pointer hover:text-[#d6a750] transition-colors leading-tight mb-1"
        >
          {product.name}
        </h3>

        {/* Subtitle / Category */}
        <p className="text-[11px] sm:text-xs font-sans text-slate-400 font-normal tracking-wider mb-1.5 sm:mb-2">
          {product.category === 'extrait-de-parfum' ? 'Extrait De Parfum' : product.category}
        </p>

        {/* Description / Accords */}
        <p className="text-[11px] sm:text-xs font-sans text-slate-500 font-normal leading-relaxed max-w-xs mb-2 sm:mb-3 px-1">
          {product.subtitle}
        </p>

        {/* Price */}
        <p className="text-xs sm:text-sm font-sans font-bold text-slate-900 mb-3 sm:mb-4">
          Rs.{currentPrice.toLocaleString('en-IN')}.00
        </p>

        {/* Dynamic Size Selector Pills */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-2.5 py-0.5 sm:px-4 sm:py-1 text-[11px] sm:text-xs font-sans rounded-full transition-all border ${
                selectedSize === size
                  ? 'bg-[#353534] text-white border-[#353534] font-bold'
                  : 'bg-[#f5f5f5] text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Shipping Note */}
        {product.shippingNote && (
          <p className="text-[10px] sm:text-[11px] font-sans font-bold text-[#42b535] mb-2 sm:mb-3 tracking-tight text-center">
            {product.shippingNote}
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        disabled={isCurrentlySoldOut}
        onClick={() => onAddToCart(product, selectedSize)}
        className={`w-full py-2.5 sm:py-3.5 font-sans font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-colors shadow-sm ${
          isCurrentlySoldOut
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-[#d6a750] hover:bg-[#353534] text-white cursor-pointer'
        }`}
      >
        {isCurrentlySoldOut ? 'OUT OF STOCK' : (product.buttonText || 'ADD TO CART')}
      </button>
    </div>
  );
};
