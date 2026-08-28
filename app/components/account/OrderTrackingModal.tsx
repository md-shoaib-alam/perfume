'use client';

import React from 'react';
import Link from 'next/link';
import { slugify } from '../../utils/slug';

interface OrderTrackingModalProps {
  order: any;
  onClose: () => void;
  displayName?: string;
  defaultAddress?: string;
  defaultCity?: string;
  defaultPincode?: string;
  defaultPhone?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  displayName = '',
  defaultAddress = '',
  defaultCity = '',
  defaultPincode = '',
  defaultPhone = ''
}) => {
  if (!order) return null;

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
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'in_transit' || s === 'in transit' || s === 'shipped') return 3;
    if (s === 'sent_out' || s === 'dispatched' || s === 'packaged') return 2;
    if (s === 'processing' || s === 'confirmed' || s === 'pending') return 1;
    if (s === 'cancelled') return 0;
    return 1;
  };

  const items = getOrderItems(order);
  const rawStatus = (order.orderStatus || order.status || 'Processing').toLowerCase();
  const isCancelled = rawStatus === 'cancelled';
  const isDelivered = rawStatus === 'delivered';
  const isInTransit = rawStatus === 'in_transit' || rawStatus === 'in transit' || rawStatus === 'shipped';
  const trackingStep = getTrackingStep(rawStatus);

  const orderIdText = order.orderNumber || (order._id ? `NSH-${order._id.slice(-5).toUpperCase()}` : (order.id ? `NSH-${order.id.slice(-5).toUpperCase()}` : 'NSH-1234'));
  const awbNumber = order.trackingNumber || `NSH-EXP-${(order._id || order.id || '98412').slice(-6).toUpperCase()}`;

  const trackingLiveUrl = order.trackingUrl || order.trackingLink || (
    order.trackingNumber
      ? `https://www.delhivery.com/track/package/${encodeURIComponent(order.trackingNumber)}`
      : `https://www.delhivery.com/track/package/${encodeURIComponent(awbNumber)}`
  );

  const orderDateObj = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedOrderDate = orderDateObj.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const deliveryDateObj = new Date(orderDateObj);
  deliveryDateObj.setDate(deliveryDateObj.getDate() + 4);
  const formattedDeliveryDate = deliveryDateObj.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const steps = [
    {
      title: 'Packaged',
      time: orderDateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ', 10:30 AM',
      stage: 1
    },
    {
      title: 'Sent out',
      time: trackingStep >= 2
        ? orderDateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ', 04:15 PM'
        : 'Waiting...',
      stage: 2
    },
    {
      title: 'In Transit',
      time: trackingStep >= 3 ? 'Active Courier' : 'Waiting...',
      stage: 3
    },
    {
      title: 'Delivered',
      time: trackingStep >= 4 ? formattedDeliveryDate : 'Waiting...',
      stage: 4
    }
  ];

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching reference image with Track Live button */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            {/* Box Icon Container */}
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              isCancelled
                ? 'bg-rose-50 border border-rose-200 text-rose-500'
                : 'bg-amber-50/70 border border-amber-200/80 text-[#caa04c]'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight">
                Order {orderIdText}
              </h3>
              <span className={`px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full border ${
                isCancelled
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isDelivered
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                  : isInTransit
                  ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                  : 'bg-amber-50 text-amber-800 border-amber-200/50'
              }`}>
                {isCancelled
                  ? 'Cancelled'
                  : isDelivered
                  ? 'Delivered'
                  : isInTransit
                  ? 'Order In Transit'
                  : 'Ready to ship'}
              </span>
            </div>
          </div>

          {/* Top Right Action: Track Live Button (Only if In Transit) + Close Icon */}
          <div className="flex items-center gap-2 shrink-0">
            {isInTransit && (
              <a
                href={trackingLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-2 bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Track Live</span>
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Order Details"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Section: Order Tracking */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Order Tracking
              </h4>
            </div>

            {/* Subheader: Product Stage & ETA */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-800">
                {isCancelled
                  ? 'Order Cancelled'
                  : isDelivered
                  ? 'Product Delivered'
                  : isInTransit
                  ? 'Product in Transit'
                  : 'Package Ready for Dispatch'}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                {isCancelled ? (
                  <span className="text-rose-600 font-bold">Status: Void</span>
                ) : (
                  <>EST: <span className="font-bold text-slate-700">3–5 days</span></>
                )}
              </span>
            </div>

            {/* If Cancelled: Show Cancelled Alert Box */}
            {isCancelled ? (
              <div className="bg-rose-50/70 rounded-2xl p-5 sm:p-6 border border-rose-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs sm:text-sm font-bold text-rose-900">Order Cancellation Notice</h5>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    This order has been cancelled and will not be dispatched. If payment was made online, a refund will automatically process to your original source within 3–5 business days.
                  </p>
                </div>
              </div>
            ) : (
              /* Stepper Progress Card for Active Orders */
              <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
                <div className="relative flex items-center justify-between">
                  {/* Horizontal Progress Lines connecting nodes */}
                  <div className="absolute left-[12%] right-[12%] top-3.5 sm:top-4 h-[2px] bg-slate-200 -z-0" />
                  <div
                    className="absolute left-[12%] top-3.5 sm:top-4 h-[2px] bg-[#caa04c] -z-0 transition-all duration-500"
                    style={{
                      width: trackingStep <= 1 ? '0%' : trackingStep === 2 ? '38%' : trackingStep === 3 ? '75%' : '76%'
                    }}
                  />

                  {/* 4 Nodes */}
                  {steps.map((step, idx) => {
                    const isDone = trackingStep >= step.stage;
                    const isCurrent = trackingStep === step.stage;

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center flex-1 text-center">
                        {/* Node Circle */}
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#caa04c] text-white shadow-xs'
                            : isCurrent
                            ? 'bg-white border-2 border-[#caa04c] text-[#caa04c] ring-4 ring-amber-100/50'
                            : 'bg-white border-2 border-slate-200 text-slate-300'
                        }`}>
                          {isDone ? (
                            <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-[#caa04c] animate-pulse" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-200" />
                          )}
                        </div>

                        {/* Step Labels */}
                        <p className={`mt-2.5 text-xs sm:text-sm font-bold ${
                          isDone ? 'text-slate-900' : isCurrent ? 'text-[#b88f3e]' : 'text-slate-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-0.5">
                          {step.time}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Order Items ({items.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {items.map((item: any, idx: number) => {
                const productSlug = slugify(item.name || item.productName || item.productId || item.id || '');
                const productHref = productSlug ? `/products/${productSlug}` : '/collections/all';

                return (
                  <Link
                    key={idx}
                    href={productHref}
                    className="p-3.5 sm:p-4 flex items-center gap-3.5 bg-white hover:bg-amber-50/40 transition-all cursor-pointer group"
                    title={`View ${item.name}`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-13 h-13 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0 group-hover:border-[#caa04c]/60 transition-colors"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#caa04c] shrink-0 font-serif font-bold text-xs group-hover:border-[#caa04c] transition-colors">
                        BB
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-[#b88f3e] transition-colors">
                          {item.name}
                        </h5>
                        <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#caa04c] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Size: <span className="font-semibold text-slate-700">{item.size || '50ml'}</span> • Qty: <span className="font-semibold text-slate-700">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#b88f3e] transition-colors">
                        Rs.{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-400">
                          Rs.{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Payment Summary
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Payment Method:</span>
              <span className="font-semibold capitalize text-slate-900">
                {order.paymentMethod === 'razorpay' ? 'Prepaid (Razorpay)' : (order.paymentMethod || 'Prepaid Online')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-emerald-600">Complimentary Free Shipping</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total {isCancelled ? 'Refund Due' : 'Paid'}:</span>
              <span className="font-bold text-base text-slate-900">
                Rs.{(Number(order.total || order.totalAmount) || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Need assistance? Contact concierge support.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
