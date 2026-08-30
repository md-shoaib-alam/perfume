'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Review } from '../types';
import { useConfirm } from '../components/CustomConfirmModal';

export const ReviewsManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data || []);
    } catch (err: any) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const toggleApproval = async (rev: Review) => {
    const nextApproved = rev.approved === false ? true : false;
    try {
      await api.updateReview(rev.id, { approved: nextApproved });
      await loadReviews();
    } catch (err: any) {
      await showAlert({
        title: 'Error Updating Review',
        message: `Failed to update approval status: ${err.message}`,
        variant: 'danger'
      });
    }
  };

  const handleDeleteReview = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Customer Review',
      message: 'Are you sure you want to permanently delete this customer review from Appwrite?',
      confirmText: 'Delete Review',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deleteReview(id);
      await loadReviews();
    } catch (err: any) {
      await showAlert({
        title: 'Error Deleting Review',
        message: `Failed to delete review: ${err.message}`,
        variant: 'danger'
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Reviews & Testimonials</h2>
          <p className="text-xs text-slate-500">Moderate customer ratings and feature verified buyer reviews on product pages.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-semibold">
          No customer reviews recorded in Appwrite database yet.
        </div>
      ) : (
        <div className="space-y-3.5">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                  {rev.verified && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>VERIFIED BUYER</span>
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="flex items-center gap-0.5 text-amber-500"
                    role="img"
                    aria-label={`${rev.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
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
                  <span className="font-semibold text-slate-800 text-xs">{rev.title}</span>
                  <span className="text-[11px] text-slate-500">• {rev.productName}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0">
                <button
                  onClick={() => toggleApproval(rev)}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    rev.approved !== false
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {rev.approved !== false ? 'PUBLISHED' : 'PENDING'}
                </button>
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
