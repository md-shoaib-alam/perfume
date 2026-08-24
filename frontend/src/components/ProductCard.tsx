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

  return (
    <div className="flex flex-col justify-between items-center text-center font-serif bg-white h-full p-2 rounded-xl border border-transparent">
      {/* Top Section */}
      <div className="w-full flex flex-col items-center">
        {/* Product Image */}
        <div 
          onClick={() => onSelectProduct(product)}
          className="relative w-full aspect-square overflow-hidden mb-5 cursor-pointer bg-slate-50 rounded-lg group"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Name */}
        <h3 
          onClick={() => onSelectProduct(product)}
          className="font-serif text-xl sm:text-2xl font-normal text-slate-800 cursor-pointer hover:text-[#d6a750] transition-colors leading-tight mb-1"
        >
          {product.name}
        </h3>

        {/* Subtitle / Category */}
        <p className="text-xs font-sans text-slate-400 font-normal tracking-wider mb-2">
          {product.category === 'extrait-de-parfum' ? 'Extrait De Parfum' : product.category}
        </p>

        {/* Description / Accords */}
        <p className="text-xs font-sans text-slate-500 font-normal leading-relaxed max-w-xs mb-3 px-2">
          {product.subtitle}
        </p>

        {/* Price */}
        <p className="text-sm font-sans font-bold text-slate-900 mb-4">
          Rs.{product.price.toLocaleString('en-IN')}.00
        </p>

        {/* Size Selector Pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['100ml', '50ml', '15ml'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-1 text-xs font-sans rounded-full transition-all border ${
                selectedSize === size
                  ? 'bg-[#353534] text-white border-[#353534] font-bold'
                  : 'bg-[#f5f5f5] text-slate-600 border-transparent hover:bg-slate-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Gold ADD TO CART Button */}
      <button
        onClick={() => onAddToCart(product, selectedSize)}
        className="w-full py-3.5 bg-[#d6a750] hover:bg-[#353534] text-white font-sans font-bold text-xs uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
      >
        ADD TO CART
      </button>
    </div>
  );
};
