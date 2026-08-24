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
  const [selectedSize, setSelectedSize] = useState<'100ml' | '50ml' | '15ml'>('100ml');

  const getPriceForSize = (basePrice: number, size: '100ml' | '50ml' | '15ml') => {
    if (size === '15ml') {
      return product.id === 'haute-vetiver' ? 1900 : Math.round(basePrice * 0.224);
    }
    if (size === '50ml') {
      return Math.round(basePrice * 0.58);
    }
    return basePrice;
  };

  const currentPrice = getPriceForSize(product.price, selectedSize);

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
            className="w-full h-full object-cover"
          />

          {/* Sold Out Badge when 15ml is selected on Haute Vetiver */}
          {selectedSize === '15ml' && product.id === 'haute-vetiver' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
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

        {/* Size Selector Pills */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {(['100ml', '50ml', '15ml'] as const).map((size) => (
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

        {/* Shipping Note (e.g. Shipping Starts From 31st August) */}
        {product.shippingNote && (
          <p className="text-[10px] sm:text-[11px] font-sans font-bold text-[#42b535] mb-2 sm:mb-3 tracking-tight text-center">
            {product.shippingNote}
          </p>
        )}
      </div>

      {/* Gold Action Button */}
      <button
        onClick={() => onAddToCart(product, selectedSize)}
        className="w-full py-2.5 sm:py-3.5 bg-[#d6a750] hover:bg-[#353534] text-white font-sans font-bold text-[11px] sm:text-xs uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
      >
        {product.buttonText || 'ADD TO CART'}
      </button>
    </div>
  );
};
