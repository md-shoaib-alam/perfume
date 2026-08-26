'use client';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Product } from '../types';

interface TravelSetSectionProps {
  onCustomize: (product?: Product) => void;
  product?: Product;
}

export const TravelSetSection: React.FC<TravelSetSectionProps> = ({
  onCustomize,
  product: initialProduct
}) => {
  const [product, setProduct] = useState<Product | null>(initialProduct || null);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }

    const loadTravelSetOffer = async () => {
      try {
        const products = await api.getProducts('discovery-set');
        if (products && products.length > 0) {
          const match =
            products.find(
              (p) =>
                p.name.toLowerCase().includes('travel') ||
                p.name.toLowerCase().includes('closet') ||
                p.subtitle?.toLowerCase().includes('travel')
            ) || products[0];
          setProduct(match);
        }
      } catch (err) {
        console.warn('Failed to load travel set product:', err);
      }
    };

    loadTravelSetOffer();
  }, [initialProduct]);

  const badgeText = product?.badgeText || 'Customizable Luxury Atomizers';
  const headingTitle = product?.tagline || 'BUILD YOUR PORTABLE TRAVEL SET';
  const description =
    product?.description ||
    'Choose any 3 or 5 pocket-sized 10ml travel spray atomizers in gold-embossed cases. Perfect for flight carry-ons, evening galas, and on-the-go touchups.';
  const priceFormatted = product?.price ? `₹${product.price.toLocaleString('en-IN')}` : '₹2,499';
  const buttonLabel = product?.buttonText || `Create Custom Travel Box (${priceFormatted})`;
  const imageUrl =
    product?.image ||
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80';

  return (
    <section className="py-20 bg-[#fafafa] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#faf9f6] rounded-3xl border border-amber-200/60 p-8 md:p-14 overflow-hidden relative shadow-md">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#916618] font-bold bg-amber-100/70 px-3.5 py-1.5 rounded-full border border-amber-200/60 inline-block">
                {badgeText}
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 leading-tight">
                {product?.name ? product.name : 'NEESH MY CLOSET'} <br />
                <span className="text-[#b88f3e]">
                  {headingTitle}
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
                {description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onCustomize(product || undefined)}
                  className="px-8 py-3.5 bg-[#c59b48] hover:bg-[#b58b38] active:bg-[#a57b28] text-white font-bold uppercase tracking-widest text-xs rounded-full shadow-md transition-all cursor-pointer"
                >
                  {buttonLabel}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-amber-200/60 shadow-xl bg-white aspect-square max-h-[420px]">
                <img
                  src={imageUrl}
                  alt={product?.name || 'Travel Set'}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
