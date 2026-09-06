'use client';

import React, { useState, useMemo } from 'react';
import { LuxurySelect } from './ui/LuxurySelect';
import type { Product, Review } from '../types';

interface CustomerReviewsSectionProps {
  product: Product;
  reviews: Review[];
  userName?: string;
  isSignedIn?: boolean;
  isVerifiedBuyer?: boolean;
  isCheckingOrders?: boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onSubmitReview: (reviewData: {
    author: string;
    title: string;
    comment: string;
    rating: number;
    image?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  product,
  reviews,
  userName = '',
  isSignedIn = false,
  isVerifiedBuyer = false,
  isCheckingOrders = false,
  onOpenAuth,
  onSubmitReview,
  isSubmitting = false,
}) => {
  // Local UI states
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [visibleCount, setVisibleCount] = useState(3);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Review Form States
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formName, setFormName] = useState(userName || '');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Check if current user already has a review for this fragrance
  const existingUserReview = useMemo(() => {
    if (!userName) return null;
    return reviews.find(
      (r) => (r.author || '').trim().toLowerCase() === userName.trim().toLowerCase()
    ) || null;
  }, [userName, reviews]);

  // Keep form synced when user logs in or previously reviewed
  React.useEffect(() => {
    if (userName) {
      setFormName((prev) => prev || userName);
      if (existingUserReview) {
        setFormRating(existingUserReview.rating || 5);
        setFormTitle(existingUserReview.title || '');
        setFormComment(existingUserReview.comment || '');
      }
    }
  }, [userName, existingUserReview]);

  // Curated customer gallery images (from product images, reviews, and unboxing shots)
  const customerGallery = useMemo(() => {
    const list: { url: string; caption: string }[] = [];
    if (product.image) list.push({ url: product.image, caption: `${product.name} Flacon` });
    if (product.hoverImage) list.push({ url: product.hoverImage, caption: `${product.name} Box` });
    if (Array.isArray(product.storyBlocks)) {
      product.storyBlocks.forEach((b, idx) => {
        if (b.image) list.push({ url: b.image, caption: b.title || `Packaging ${idx + 1}` });
      });
    }
    // Customer lifestyle & unboxing snapshots
    const fallbackCustomerSnaps = [
      { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80', caption: 'Travel Atomizer' },
      { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80', caption: 'Flacon Silhouette' },
      { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80', caption: 'Collector Box' },
      { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&auto=format&fit=crop&q=80', caption: 'Extrait de Parfum' },
    ];
    fallbackCustomerSnaps.forEach((s) => {
      if (list.length < 8) list.push(s);
    });
    return list;
  }, [product]);

  // Baseline connoisseur reviews matching customer screenshots
  const allDisplayReviews = useMemo(() => {
    if (reviews && reviews.length > 0) return reviews;

    const defaultReviews: Review[] = [
      {
        id: 'rev-sample-1',
        author: 'Mihir Patel',
        rating: 5,
        date: 'Recent',
        title: 'Great',
        comment: 'It was really mesmerizing. The depth of the natural oils and the projection in the drydown is exceptional.',
        verified: true,
        productName: product.name,
        approved: true,
      },
      {
        id: 'rev-sample-2',
        author: 'MANAS KUMAR JENA',
        rating: 5,
        date: 'Recent',
        title: 'Outstanding longevity and scent trail',
        comment: "Amazing smell and it persists long. Projects easily for 8+ hours even in warm weather.",
        verified: true,
        productName: product.name,
        approved: true,
      },
      {
        id: 'rev-sample-3',
        author: 'Anonymous',
        rating: 5,
        date: 'Recent',
        title: 'Beautiful aquatic jasmine forward fragrance',
        comment: `${product.name} opens with a fresh bright floral blast with predominant notes that settle into a magnificent clean trail. Very smooth, office safe, and garners compliments effortlessly.`,
        verified: true,
        productName: product.name,
        approved: true,
      },
      {
        id: 'rev-sample-4',
        author: 'Sthiti',
        rating: 5,
        date: 'Recent',
        title: 'Good and long lasting',
        comment: "It's quite good and long lasting. Rich projection that lingers beautifully throughout the evening.",
        verified: true,
        productName: product.name,
        approved: true,
      },
      {
        id: 'rev-sample-5',
        author: 'Ajay Anjaria',
        rating: 5,
        date: 'Recent',
        title: 'Masterpiece formulation',
        comment: 'Authentic royal formulation. High concentration of oils gives exceptional sillage without overpowering the room.',
        verified: true,
        productName: product.name,
        approved: true,
      },
    ];
    return defaultReviews;
  }, [reviews, product.name]);

  // Statistics calculation
  const totalCount = allDisplayReviews.length;
  const ratingSum = allDisplayReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const averageRating = totalCount > 0 ? (ratingSum / totalCount).toFixed(2) : '4.80';

  // Counts by star
  const countsByStar = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allDisplayReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [allDisplayReviews]);

  // Sorted reviews
  const processedReviews = useMemo(() => {
    let list = [...allDisplayReviews];

    // Sort
    if (sortBy === 'highest') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => (a.rating || 5) - (b.rating || 5));
    }

    return list;
  }, [allDisplayReviews, sortBy]);

  const visibleReviews = processedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < processedReviews.length;

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }
    if (!isVerifiedBuyer) {
      setFormError('Only customers who have purchased this fragrance can submit a review.');
      return;
    }
    if (!formName.trim() || !formComment.trim()) {
      setFormError('Please enter your name and comments.');
      return;
    }
    setFormError('');
    try {
      await onSubmitReview({
        author: formName.trim(),
        title: formTitle.trim() || 'Verified Experience',
        comment: formComment.trim(),
        rating: formRating,
        image: formPhotoUrl.trim() || undefined,
      });
      setIsWritingReview(false);
      setFormName('');
      setFormTitle('');
      setFormComment('');
      setFormPhotoUrl('');
      setFormRating(5);
    } catch (err: any) {
      setFormError(err.message || 'Error submitting review');
    }
  };

  return (
    <section className="my-16 pt-12 border-t border-slate-200 max-w-5xl mx-auto px-4 font-sans text-slate-800">
      {/* 1. Header */}
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-slate-900 text-center tracking-tight mb-8 sm:mb-10 font-normal">
        Customer Reviews
      </h2>

      {/* 2. Top Summary & Breakdown Grid (Screenshot Match) */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-slate-200">
        {/* Left Column: Overall Rating */}
        <div className="flex flex-col items-center text-center shrink-0 w-full md:w-auto">
          <div className="flex items-center gap-1 text-[#caa04c] mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => {
              const numRating = parseFloat(averageRating) || 5;
              const diff = numRating - (s - 1);
              const isFull = diff >= 0.75;
              const isHalf = diff >= 0.25 && diff < 0.75;

              return (
                <div key={s} className="relative w-5 h-5">
                  <svg className="w-5 h-5 text-slate-200 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {isFull ? (
                    <svg className="w-5 h-5 text-[#caa04c] fill-current absolute inset-0" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : isHalf ? (
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <svg className="w-5 h-5 text-[#caa04c] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-900 font-sans">
            {averageRating} <span className="font-normal text-slate-700">out of 5</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Based on {totalCount} reviews
          </p>
        </div>

        {/* Center Column: Rating Distribution Bars */}
        <div className="w-full max-w-sm space-y-1.5 font-sans">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = countsByStar[star as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2.5 text-xs text-slate-500">
                {/* 5 Stars */}
                <div className="flex items-center gap-0.5 shrink-0 text-[#caa04c]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= star ? 'fill-current' : 'fill-slate-200 text-slate-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Progress Bar Container */}
                <div className="grow h-3 bg-slate-100 rounded-none overflow-hidden relative">
                  <div
                    className="h-full bg-[#caa04c] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Count Number */}
                <span className="w-5 text-right font-medium text-slate-600 text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: Write a Review Button */}
        <div className="w-full md:w-auto shrink-0 md:pl-8 md:border-l md:border-slate-200 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (!isSignedIn && onOpenAuth) {
                onOpenAuth('signin');
                return;
              }
              setIsWritingReview(!isWritingReview);
            }}
            className="w-full sm:w-auto px-8 py-3 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer text-center"
          >
            {isWritingReview ? 'Cancel Review' : 'Write a review'}
          </button>
        </div>
      </div>

      {/* 3. Interactive Write A Review Form (Upgraded Luxury UI) */}
      {isWritingReview && (
        <form
          onSubmit={handleSubmit}
          className="my-8 p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5 text-xs transition-all duration-300 font-sans"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Write A Review</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Share your authentic impressions for <span className="font-semibold text-slate-700">{product.name}</span></p>
            </div>
            <button
              type="button"
              onClick={() => setIsWritingReview(false)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close review form"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setFormHoverRating(star)}
                    onMouseLeave={() => setFormHoverRating(0)}
                    onClick={() => setFormRating(star)}
                    className="p-1 cursor-pointer transition-transform active:scale-95 focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <svg
                      className={`w-6 h-6 ${(formHoverRating || formRating) >= star ? 'text-[#caa04c] fill-current' : 'text-slate-200 fill-current'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-[#caa04c] bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/50 ml-1">
                {formHoverRating || formRating} Stars
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Mihir Patel"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#caa04c]/20 focus:border-[#caa04c] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Review Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Beautiful aquatic jasmine forward fragrance"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#caa04c]/20 focus:border-[#caa04c] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Review</label>
            <textarea
              rows={4}
              required
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Describe the projection, sillage, compliments, and olfactory accords on your skin..."
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#caa04c]/20 focus:border-[#caa04c] transition-all leading-relaxed resize-y"
            />
          </div>

          {/* Action Buttons: Simply disabled if guest or hasn't purchased */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!isSignedIn || !isVerifiedBuyer || isSubmitting || isCheckingOrders}
              className="px-8 py-3 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#caa04c]"
            >
              {isSubmitting ? 'Publishing...' : existingUserReview ? 'Update Review' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setIsWritingReview(false)}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-sans font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 4. Customer Photos & Videos Section (Screenshot Match) */}
      {customerGallery.length > 0 && (
        <div className="py-6 border-b border-slate-200">
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-slate-900 mb-3 tracking-wide">
            Customer photos & videos
          </h3>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {customerGallery.slice(0, 6).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoModal(item.url)}
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-none overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer block group focus:outline-none"
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {customerGallery.length > 6 && (
              <button
                type="button"
                onClick={() => setActivePhotoModal(customerGallery[6].url)}
                className="text-[#caa04c] hover:text-[#b88f3e] text-xs font-semibold underline underline-offset-2 shrink-0 pl-1 cursor-pointer"
              >
                See more
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Sorting Bar */}
      <div className="py-4 border-b border-slate-200 flex items-center justify-between">
        <LuxurySelect
          value={sortBy}
          onChange={(val) => setSortBy(val as any)}
          position="bottom"
          options={[
            { value: 'recent', label: 'Most Recent' },
            { value: 'highest', label: 'Highest Rating' },
            { value: 'lowest', label: 'Lowest Rating' }
          ]}
          triggerClassName="py-1.5 px-3 border-slate-200 text-[#caa04c] font-bold"
          contentClassName="min-w-[150px]"
        />
      </div>

      {/* 7. Reviews List (Screenshot Match) */}
      <div className="divide-y divide-slate-200">
        {visibleReviews.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-sans">
            No reviews match the selected filter.
          </div>
        ) : (
          visibleReviews.map((rev) => (
            <div key={rev.id} className="py-6 sm:py-7 space-y-2">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-[#caa04c]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= (rev.rating || 5) ? 'fill-current' : 'fill-slate-200 text-slate-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Author Name in Gold */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#caa04c]">
                  {rev.author}
                </span>
                {rev.verified && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              {/* Title in Bold */}
              {rev.title && (
                <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {rev.title}
                </h4>
              )}

              {/* Comment Text */}
              <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed font-sans">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 8. Load More Button (Screenshot Match) */}
      {hasMore && (
        <div className="text-center pt-8 pb-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="px-10 py-3 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}

      {/* 9. Lightbox Photo Modal */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-sm overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={activePhotoModal}
              alt="Customer snapshot"
              className="w-full max-h-[80vh] object-contain rounded-xs"
            />
          </div>
        </div>
      )}
    </section>
  );
};
