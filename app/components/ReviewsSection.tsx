'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Review } from '../types';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getReviews();
        if (data) {
          setReviews(data);
        }
      } catch (e) {}
    };
    load();
    window.addEventListener('focus', load);
    return () => {
      window.removeEventListener('focus', load);
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-20 bg-slate-950 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">Verified Testimonials</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
            Loved By Over 50,000+ Fragrance Lovers
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 text-yellow-400">
            <span>★★★★★</span>
            <span className="text-slate-300 font-semibold text-sm">4.9 / 5.0 Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900/60 border border-amber-900/30 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-yellow-400 text-sm">{'★'.repeat(rev.rating)}</div>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/50">
                    Verified Buyer
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-base mb-2">{rev.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">"{rev.comment}"</p>
              </div>

              <div className="pt-4 border-t border-amber-900/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300">{rev.author}</span>
                <span className="text-slate-500">{rev.productName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Press Badges */}
        <div className="mt-16 pt-10 border-t border-amber-900/20 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold mb-6 block">Featured In Global Publications</span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 text-slate-400 font-serif font-bold text-lg sm:text-xl">
            <span>VOGUE</span>
            <span>GQ</span>
            <span>ELLE</span>
            <span>COSMOPOLITAN</span>
            <span>HARPER'S BAZAAR</span>
          </div>
        </div>

      </div>
    </section>
  );
};
