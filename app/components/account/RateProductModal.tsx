'use client';

import React, { useState } from 'react';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/useQueries';
import { useConfirm } from '../CustomConfirmModal';

interface RateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
  productSize?: string;
  orderNumber?: string;
  userDisplayName?: string;
  onSuccess?: () => void;
}

export const RateProductModal: React.FC<RateProductModalProps> = ({
  isOpen,
  onClose,
  productName,
  productImage,
  productSize,
  orderNumber,
  userDisplayName = 'Verified Customer',
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const { showAlert } = useConfirm();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [author, setAuthor] = useState<string>(userDisplayName);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!productName || !comment.trim()) {
      await showAlert({
        title: 'Review Required',
        message: 'Please write a brief description of your fragrance experience.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createReview({
        productName,
        author: author.trim() || userDisplayName || 'Verified Buyer',
        title: title.trim() || 'Verified Purchase Impression',
        comment: comment.trim(),
        rating,
        verified: true,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productName) });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      await showAlert({
        title: 'Review Published',
        message: `Thank you for reviewing ${productName}! Your verified buyer rating has been recorded.`,
        variant: 'success'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      await showAlert({
        title: 'Submission Error',
        message: err.message || 'Could not save review. Please try again later.',
        variant: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#caa04c]" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Rate & Review Fragrance
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Information Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3.5">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="w-13 h-13 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-13 h-13 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#caa04c] font-serif font-bold text-xs shrink-0">
              BB
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
              {productName}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
              {productSize && <span>Size: <strong className="text-slate-700">{productSize}</strong></span>}
              {orderNumber && <span>• Order #{orderNumber}</span>}
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200/50">
              <svg className="w-3 h-3 fill-current text-emerald-600" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified Buyer
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Star Rating */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 text-xs">
              Overall Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-[#caa04c] hover:scale-110 transition-transform cursor-pointer"
                  aria-label={`${star} Star`}
                >
                  <svg
                    className={`w-7 h-7 ${
                      star <= currentDisplayRating
                        ? 'fill-current text-[#caa04c]'
                        : 'fill-none stroke-current text-slate-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="font-bold text-slate-800 text-xs ml-2">
                {currentDisplayRating === 5 && 'Outstanding (5/5)'}
                {currentDisplayRating === 4 && 'Very Good (4/5)'}
                {currentDisplayRating === 3 && 'Average (3/5)'}
                {currentDisplayRating === 2 && 'Below Expectation (2/5)'}
                {currentDisplayRating === 1 && 'Poor (1/5)'}
              </span>
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Public Name *
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Rohail Khan"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] transition-colors"
            />
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rich agarwood with 12+ hours longevity"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] transition-colors"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Experience & Feedback *
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how the fragrance opens, develops on your skin, the sillage trail, and longevity..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] transition-colors leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Submitting...' : 'Publish Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
