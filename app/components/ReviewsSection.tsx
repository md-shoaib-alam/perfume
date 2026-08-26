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
    <section className="py-20 bg-[#fafafa] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-[#caa04c] font-semibold">Verified Testimonials</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 mt-2">
            Loved By Over 50,000+ Fragrance Lovers
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-[#caa04c]" role="img" aria-label="5 out of 5 stars">
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
            <span className="text-slate-600 font-semibold text-sm">4.9 / 5.0 Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-[#d6a750]/50 hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-0.5 text-[#caa04c]"
                    role="img"
                    aria-label={`${rev.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'}`}
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
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
                  &ldquo;{rev.title}&rdquo;
                </h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-4">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{rev.author}</span>
                  <span className="text-[11px] text-slate-400">{rev.productName}</span>
                </div>
                <span className="text-[10px] text-slate-400">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
