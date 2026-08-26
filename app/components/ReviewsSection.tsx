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

  const approvedReviews = reviews.filter((r) => r.approved !== false);

  if (approvedReviews.length === 0) return null;

  return (
    <section className="py-20 bg-slate-950 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">Verified Testimonials</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
            Loved By Over 50,000+ Fragrance Lovers
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-amber-400" role="img" aria-label="5 out of 5 stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="text-slate-300 font-semibold text-sm">4.9 / 5.0 Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900/60 border border-amber-900/30 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-0.5 text-amber-400"
                    role="img"
                    aria-label={`${rev.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-100 text-base mb-2">{rev.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">&ldquo;{rev.comment}&rdquo;</p>
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
