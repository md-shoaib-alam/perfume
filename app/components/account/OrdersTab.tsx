'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { slugify } from '../../utils/slug';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/useQueries';

interface OrdersTabProps {
  orders: any[];
  selectedOrder?: any | null;
  onSelectOrder: (order: any) => void;
  onDeselectOrder?: () => void;
  displayName?: string;
  defaultAddress?: string;
  defaultCity?: string;
  defaultPincode?: string;
  defaultPhone?: string;
  onShopNow?: () => void;
  onClose?: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  selectedOrder,
  onSelectOrder,
  onDeselectOrder,
  displayName = 'Verified Customer',
  defaultAddress = '',
  defaultCity = '',
  defaultPincode = '',
  defaultPhone = '',
  onShopNow,
  onClose
}) => {
  const queryClient = useQueryClient();

  // Inline Rate & Review state for delivered items
  const [activeReviewProduct, setActiveReviewProduct] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<{ [productName: string]: string }>({});
  const [isExistingReview, setIsExistingReview] = useState<boolean>(false);

  // Load existing review when opening inline review form
  useEffect(() => {
    if (activeReviewProduct) {
      let isMounted = true;
      api.getReviews(activeReviewProduct).then((revs) => {
        if (!isMounted) return;
        const myReview = revs.find(
          (r) => (r.author || '').trim().toLowerCase() === (displayName || '').trim().toLowerCase()
        );
        if (myReview) {
          setReviewRating(myReview.rating || 5);
          setReviewTitle(myReview.title || '');
          setReviewComment(myReview.comment || '');
          setIsExistingReview(true);
        } else {
          setReviewRating(5);
          setReviewTitle('');
          setReviewComment('');
          setIsExistingReview(false);
        }
      }).catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [activeReviewProduct, displayName]);

  const handleInlineReviewSubmit = async (productName: string) => {
    if (!productName || !reviewComment.trim() || isSubmittingReview) return;
    setIsSubmittingReview(true);
    try {
      await api.createReview({
        productName,
        author: displayName || 'Verified Customer',
        title: reviewTitle.trim() || 'Verified Purchase Impression',
        comment: reviewComment.trim(),
        rating: reviewRating,
        verified: true,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productName) });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      setReviewSuccessMsg((prev) => ({
        ...prev,
        [productName]: isExistingReview ? 'Review updated successfully!' : 'Verified review published successfully!'
      }));
      setActiveReviewProduct(null);
    } catch (err) {
      console.error('Failed to submit inline review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper parsers for selected order
  const getOrderItems = (ord: any) => {
    if (Array.isArray(ord.items) && ord.items.length > 0) return ord.items;
    if (typeof ord.items === 'string') {
      try {
        const parsed = JSON.parse(ord.items);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        name: ord.productName || ord.name || 'Imperial Fragrance',
        price: ord.price || ord.total || ord.totalAmount || 0,
        quantity: ord.quantity || 1,
        size: ord.size || '50ml',
        image: ord.image || ord.productImage || ''
      }
    ];
  };

  const getShippingAddress = (ord: any) => {
    if (ord.shippingDetails && typeof ord.shippingDetails === 'object') return ord.shippingDetails;
    if (typeof ord.shippingAddress === 'string') {
      try {
        const parsed = JSON.parse(ord.shippingAddress);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        // fallback string
      }
    }
    return null;
  };

  const getTrackingStep = (status?: string) => {
    const s = (status || '').toLowerCase().trim().replace(/[-_]/g, ' ');
    if (s === 'delivered' || s === 'completed') return 5;
    if (s === 'out for delivery') return 4;
    if (s === 'shipped' || s === 'in transit' || s === 'dispatched') return 3;
    if (s === 'packed' || s === 'packaged' || s === 'ready for dispatch' || s === 'sent out') return 2;
    if (s === 'order placed' || s === 'placed' || s === 'processing' || s === 'confirmed' || s === 'pending') return 1;
    if (s === 'cancelled') return 0;
    return 1;
  };

  // ---------------------------------------------------------------------------
  // VIEW 1: IN-PAGE ORDER DETAILS & LIVE TRACKING (When order is selected)
  // ---------------------------------------------------------------------------
  if (selectedOrder) {
    const items = getOrderItems(selectedOrder);
    const rawStatus = (selectedOrder.orderStatus || selectedOrder.status || 'Order Placed').toLowerCase();
    const isCancelled = rawStatus === 'cancelled';
    const isDelivered = rawStatus === 'delivered';
    const isInTransit = rawStatus === 'in_transit' || rawStatus === 'in transit' || rawStatus === 'shipped' || rawStatus === 'out for delivery';
    const trackingStep = getTrackingStep(rawStatus);

    const orderIdText = selectedOrder.orderNumber || (selectedOrder._id ? `NSH-${selectedOrder._id.slice(-5).toUpperCase()}` : (selectedOrder.id ? `NSH-${selectedOrder.id.slice(-5).toUpperCase()}` : 'NSH-1234'));
    const awbNumber = selectedOrder.trackingNumber || `NSH-EXP-${(selectedOrder._id || selectedOrder.id || '98412').slice(-6).toUpperCase()}`;

    const trackingLiveUrl = selectedOrder.trackingUrl || selectedOrder.trackingLink || (
      selectedOrder.trackingNumber
        ? `https://www.delhivery.com/track/package/${encodeURIComponent(selectedOrder.trackingNumber)}`
        : `https://www.delhivery.com/track/package/${encodeURIComponent(awbNumber)}`
    );

    const orderDateObj = selectedOrder.createdAt ? new Date(selectedOrder.createdAt) : new Date();
    const formattedOrderDate = orderDateObj.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const shippingInfo = getShippingAddress(selectedOrder);

    const steps = [
      {
        title: 'ORDER PLACED',
        stage: 1,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        title: 'PACKED',
        stage: 2,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      },
      {
        title: 'SHIPPED',
        stage: 3,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      },
      {
        title: 'OUT FOR DELIVERY',
        stage: 4,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      },
      {
        title: 'DELIVERED',
        stage: 5,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      }
    ];

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => onDeselectOrder ? onDeselectOrder() : onSelectOrder(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#caa04c] transition-colors cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-amber-50 group-hover:text-[#caa04c] flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            <span>Back to All Orders</span>
          </button>

          <span className="text-xs text-slate-400">
            Placed on {formattedOrderDate}
          </span>
        </div>

        {/* Order Header Summary Banner */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isCancelled
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-amber-50/70 text-[#caa04c] border border-amber-200/80'
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Order #{orderIdText}
                </h3>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${
                  isCancelled
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isDelivered
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isInTransit
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-[#b88f3e] border-amber-200'
                }`}>
                  {isCancelled ? 'Cancelled' : isDelivered ? 'Delivered' : isInTransit ? 'In Transit' : 'Ready to Ship'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: <strong className="text-slate-900">Rs.{(Number(selectedOrder.total || selectedOrder.totalAmount) || 0).toLocaleString('en-IN')}</strong> • {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </p>
            </div>
          </div>

          {isInTransit && (
            <a
              href={trackingLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <span>Track Live Delivery</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Live Stepper Card */}
        {!isCancelled ? (
          <div className="bg-[#faf9f6] rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Shipment Timeline</h4>
              <span className="text-xs text-slate-400">
                Status: <strong className="text-slate-800 capitalize">{rawStatus}</strong>
              </span>
            </div>

            {/* Desktop Horizontal Stepper */}
            <div className="hidden sm:block pt-2">
              <div className="flex items-center justify-between relative">
                {/* Horizontal Background Line */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 z-0" />
                <div
                  className="absolute top-5 left-8 h-1 bg-[#caa04c] z-0 transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, ((trackingStep - 1) / 4) * 100))}%` }}
                />

                {steps.map((step, idx) => {
                  const isDone = trackingStep >= step.stage;
                  const isCurrent = trackingStep === step.stage;

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isDone || isCurrent
                            ? 'bg-[#caa04c] text-white shadow-xs ring-4 ring-amber-100/60'
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 whitespace-nowrap ${
                        isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="block sm:hidden space-y-3 pt-1">
              {steps.map((step, idx) => {
                const isDone = trackingStep >= step.stage;
                const isCurrent = trackingStep === step.stage;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isDone || isCurrent ? 'bg-[#caa04c] text-white' : 'bg-white border border-slate-200 text-slate-400'
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-rose-900">Order Cancelled</h5>
              <p className="text-xs text-rose-700 mt-0.5">
                This order was cancelled. Any prepaid amounts are credited back to your original payment method.
              </p>
            </div>
          </div>
        )}

        {/* Ordered Fragrances Item List with Inline Review */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Ordered Items ({items.length})
          </h4>

          <div className="divide-y divide-slate-100">
            {items.map((item: any, idx: number) => {
              const pName = item.name || item.productName || 'Fragrance';
              const pSlug = slugify(pName);
              const isReviewingThis = activeReviewProduct === pName;
              const hasSuccessMsg = reviewSuccessMsg[pName];

              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  {/* Item Main Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {item.image || item.productImage ? (
                        <img
                          src={item.image || item.productImage}
                          alt={pName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#caa04c] font-serif font-bold text-xs shrink-0">
                          BB
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/products/${pSlug}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#caa04c] transition-colors"
                        >
                          {pName}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.size && <span>Size: <strong className="text-slate-700">{item.size}</strong> • </span>}
                          Qty: <strong className="text-slate-700">{item.quantity || 1}</strong>
                        </p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          Rs.{(Number(item.price) || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Rate & Review Button for Delivered Orders */}
                    {isDelivered && (
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isReviewingThis) {
                              setActiveReviewProduct(null);
                            } else {
                              setActiveReviewProduct(pName);
                            }
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isReviewingThis
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-amber-50/80 hover:bg-amber-100 text-[#b88f3e] border-amber-200/80'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 fill-current text-[#caa04c]" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{isReviewingThis ? 'Cancel Review' : 'Rate & Review'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Success Banner */}
                  {hasSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{hasSuccessMsg}</span>
                    </div>
                  )}

                  {/* Inline Review Form (Expands smoothly right under item) */}
                  {isReviewingThis && (
                    <div className="bg-[#faf9f6] border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 animate-fade-in text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-slate-900">
                          {isExistingReview ? 'Update Your Review' : 'Write Verified Review'} for {pName}
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                          Verified Buyer
                        </span>
                      </div>

                      {/* Star Picker */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Rating</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              className="p-1 cursor-pointer text-[#caa04c]"
                            >
                              <svg
                                className={`w-6 h-6 ${(reviewHoverRating || reviewRating) >= star ? 'fill-current' : 'fill-none stroke-current'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                          <span className="font-bold text-[#caa04c] bg-amber-50 px-2 py-0.5 rounded-full ml-1 border border-amber-200 text-[11px]">
                            {reviewHoverRating || reviewRating} / 5 Stars
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Review Headline (Optional)</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Luxurious long-lasting sillage"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#caa04c]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Detailed Feedback *</label>
                        <textarea
                          rows={3}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share how this fragrance performs on your skin..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#caa04c]"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleInlineReviewSubmit(pName)}
                          disabled={isSubmittingReview || !reviewComment.trim()}
                          className="px-6 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isSubmittingReview ? 'Saving...' : isExistingReview ? 'Update Review' : 'Save Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReviewProduct(null)}
                          className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping & Payment Cards in 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shipping Address Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Delivery Information
            </span>
            <p className="font-bold text-slate-900">
              {shippingInfo?.name || shippingInfo?.fullName || displayName || 'Valued Customer'}
            </p>
            <p className="text-slate-600 leading-relaxed">
              {shippingInfo?.address || shippingInfo?.addressLine1 || defaultAddress || 'Residential Address'}
              {shippingInfo?.city || defaultCity ? `, ${shippingInfo?.city || defaultCity}` : ''}
              {shippingInfo?.state ? `, ${shippingInfo.state}` : ''}
              {shippingInfo?.pincode || shippingInfo?.postalCode || defaultPincode ? ` - ${shippingInfo?.pincode || shippingInfo?.postalCode || defaultPincode}` : ''}
            </p>
            {(shippingInfo?.phone || defaultPhone) && (
              <p className="text-slate-500 pt-1">
                Phone: <strong className="text-slate-800">{shippingInfo?.phone || defaultPhone}</strong>
              </p>
            )}
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Payment Summary
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Payment Method:</span>
              <span className="font-semibold capitalize text-slate-900">
                {selectedOrder.paymentMethod === 'razorpay' ? 'Prepaid (Razorpay)' : (selectedOrder.paymentMethod || 'Prepaid Online')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping:</span>
              <span className="font-semibold text-emerald-600">Complimentary Free Shipping</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total {isCancelled ? 'Refund Due' : 'Paid'}:</span>
              <span className="font-bold text-base text-slate-900">
                Rs.{(Number(selectedOrder.total || selectedOrder.totalAmount) || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 2: ORDERS LIST (Default view when no order is selected)
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-3 sm:space-y-4 font-sans">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Order History & Tracking</h3>
          {orders.length > 0 && (
            <span className="text-xs font-bold text-[#b88f3e] bg-amber-50 px-2.5 sm:px-3 py-1 rounded-full border border-amber-200/50 whitespace-nowrap shrink-0">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1 hidden sm:block">Track shipments, view itemized invoices, and delivery status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-100 text-center text-slate-400 shadow-2xs">
          <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
            <svg className="w-full h-full fill-none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-slate-700 mb-1">No Orders Found</h4>
          <p className="text-xs text-slate-400 mb-4">You haven&apos;t placed any orders yet. Discover our luxury fragrance catalog.</p>
          <button
            type="button"
            onClick={() => {
              if (onShopNow) onShopNow();
              else if (onClose) onClose();
            }}
            className="px-5 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord, i) => {
            const rawStatus = (ord.orderStatus || ord.status || 'pending').toLowerCase();
            const orderNum = ord.orderNumber || (ord._id ? `NSH-${ord._id.slice(-5).toUpperCase()}` : (ord.id ? `NSH-${ord.id.slice(-5).toUpperCase()}` : `NSH-00${i + 1}`));
            const dateStr = ord.createdAt
              ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recent';

            return (
              <div
                key={ord._id || ord.id || i}
                onClick={() => onSelectOrder(ord)}
                className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#caa04c]/60 hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2.5 sm:gap-3 group"
              >
                {/* Row 1: Order Info (left) + Status Badge (right) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#d09e44] shrink-0 group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-[#b88f3e] transition-colors leading-tight">
                        Order #{orderNum}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400 font-normal leading-tight">
                        {dateStr}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-bold rounded-full uppercase tracking-wider whitespace-nowrap border leading-tight shrink-0 ${
                    rawStatus === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      : rawStatus === 'out for delivery' || rawStatus === 'out_for_delivery'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                      : rawStatus === 'shipped' || rawStatus === 'in_transit' || rawStatus === 'in transit'
                      ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                      : rawStatus === 'packed' || rawStatus === 'packaged'
                      ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                      : rawStatus === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                      : 'bg-amber-50/80 text-[#b88f3e] border-amber-200/60'
                  }`}>
                    {ord.orderStatus || ord.status || 'ORDER PLACED'}
                  </span>
                </div>

                {/* Row 2: Rate & Review Badge + Price */}
                <div className="flex items-center justify-between gap-2 sm:justify-between sm:gap-3 pt-1 border-t border-slate-50">
                  {rawStatus === 'delivered' ? (
                    <span className="text-[11px] font-bold text-[#b88f3e] flex items-center gap-1 bg-amber-50/70 border border-amber-200/50 px-2 py-0.5 rounded-md">
                      <svg className="w-3 h-3 fill-current text-[#caa04c]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Rate & Review Fragrance
                    </span>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-800 whitespace-nowrap leading-tight">
                      Rs.{(Number(ord.total || ord.totalAmount) || 0).toLocaleString('en-IN')}
                    </span>

                    <span className="text-slate-400 group-hover:text-[#caa04c] transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
