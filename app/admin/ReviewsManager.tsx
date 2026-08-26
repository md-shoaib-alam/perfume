'use client';
import React, { useState } from 'react';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  product: string;
  title: string;
  comment: string;
  verified: boolean;
  approved: boolean;
  date: string;
}

export const ReviewsManager: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      author: 'Rohit Malhotra',
      rating: 5,
      product: 'Glazed Water',
      title: 'Lasts more than 12 hours easily',
      comment: 'The scent profile is extremely refined. Crisp citrus turning into salty ambergris. Got multiple compliments on day one.',
      verified: true,
      approved: true,
      date: '24 Aug 2026'
    },
    {
      id: 'rev-2',
      author: 'Ananya Deshmukh',
      rating: 5,
      product: 'Mehr',
      title: 'Pure royalty in a bottle',
      comment: 'Very warm golden floral with rich vanilla. Smells luxurious and lasts all day through meetings.',
      verified: true,
      approved: true,
      date: '22 Aug 2026'
    },
    {
      id: 'rev-3',
      author: 'Karan Mehra',
      rating: 4,
      product: 'Haute Vetiver',
      title: 'Complex and masculine',
      comment: 'Raw earthy vetiver with leather smoke. Definitely niche fragrance quality.',
      verified: true,
      approved: true,
      date: '18 Aug 2026'
    }
  ]);

  const toggleApproval = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Customer Reviews & Testimonials</h2>
          <p className="text-xs text-slate-500">Moderate customer ratings and feature verified buyer reviews on product pages.</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                {rev.verified && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    ✓ VERIFIED BUYER
                  </span>
                )}
                <span className="text-[11px] text-slate-400">{rev.date}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</span>
                <span className="font-semibold text-slate-800 text-xs">{rev.title}</span>
                <span className="text-[11px] text-slate-500">• {rev.product}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0">
              <button
                onClick={() => toggleApproval(rev.id)}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  rev.approved
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {rev.approved ? 'PUBLISHED' : 'PENDING'}
              </button>
              <button
                onClick={() => deleteReview(rev.id)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
