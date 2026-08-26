'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Product } from '../types';

interface TravelSetSectionProps {
  onCustomize: (product?: Product) => void;
  product?: Product;
}

export const TravelSetSection: React.FC<TravelSetSectionProps> = ({ onCustomize, product: initialProduct }) => {
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState<boolean>(!initialProduct);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }

    const loadTravelSetOffer = async () => {
      try {
        const products = await api.getProducts();
        const found = products.find(
          (p) =>
            p.category === 'travel-set' ||
            p.name.toLowerCase().includes('travel') ||
            p.category === 'gift-set'
        );
        if (found) {
          setProduct(found);
        }
      } catch (err) {
        console.warn('Failed to load travel set product from Appwrite:', err);
      } finally {
        setLoading(false);
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
    <section className="py-20 bg-slate-900 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl border border-amber-900/50 p-8 md:p-14 overflow-hidden relative shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-900/50">
                {badgeText}
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                {product?.name ? product.name.toUpperCase() : 'NEESH MY CLOSET'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                  {headingTitle}
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onCustomize(product || undefined)}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-full shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  {buttonLabel}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl">
                <img
                  src={imageUrl}
                  alt={product?.name || 'Custom Travel Set'}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[320px] object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
