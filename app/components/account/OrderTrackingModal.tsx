'use client';

import React, { useState } from 'react';

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
  const [copiedAwb, setCopiedAwb] = useState(false);

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
    if (s === 'delivered') return 3;
    if (s === 'in_transit' || s === 'shipped') return 2;
    if (s === 'processing' || s === 'confirmed' || s === 'pending') return 1;
    return 0;
  };

  const items = getOrderItems(order);
  const shipping = getShippingAddress(order);
  const trackingStep = getTrackingStep(order.orderStatus || order.status);
  const rawStatus = (order.orderStatus || order.status || 'Processing').toLowerCase();
  const awbNumber = `NSH-EXP-${(order._id || order.id || '98412').slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Order #{order.orderNumber || order._id?.slice(-5)?.toUpperCase() || order.id?.slice(-5)?.toUpperCase()}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                rawStatus === 'delivered'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : rawStatus === 'shipped' || rawStatus === 'in_transit'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : rawStatus === 'cancelled'
                  ? 'bg-red-50 text-red-700 border border-red-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}>
                {order.orderStatus || order.status || 'Processing'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close Order Details"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* 1. Shipment Tracking Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Shipment Status
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                Estimated delivery: 3–5 days
              </span>
            </div>

            {/* Timeline Progress Track */}
            <div className="relative pt-2 pb-1">
              {/* Background Bar */}
              <div className="absolute top-5 left-8 right-8 h-[2px] bg-slate-200 -z-0 rounded-full" />
              
              {/* Active Champagne Gold Progress Bar */}
              <div
                className="absolute top-5 left-8 h-[2px] bg-[#caa04c] -z-0 rounded-full transition-all duration-500"
                style={{
                  width: trackingStep === 0 ? '0%' : trackingStep === 1 ? '33%' : trackingStep === 2 ? '66%' : 'calc(100% - 4rem)'
                }}
              />

              {/* 4 Step Nodes */}
              <div className="grid grid-cols-4 gap-1 text-center relative z-10">
                {[
                  'Confirmed',
                  'Processing',
                  'In Transit',
                  'Delivered'
                ].map((title, idx) => {
                  const isDone = trackingStep > idx;
                  const isCurrent = trackingStep === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-[#caa04c] text-white shadow-xs ring-4 ring-slate-50'
                          : isCurrent
                          ? 'bg-white border-2 border-[#caa04c] text-[#caa04c] ring-4 ring-amber-50 shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-400 ring-4 ring-slate-50'
                      }`}>
                        {isDone ? (
                          <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#caa04c] animate-pulse" />
                        ) : (
                          <span className="text-[11px] font-semibold">{idx + 1}</span>
                        )}
                      </div>

                      <p className={`mt-2.5 text-[11px] sm:text-xs font-bold leading-tight ${
                        isCurrent || isDone ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Number Card */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Tracking Number</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 truncate block">{awbNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(awbNumber);
                  setCopiedAwb(true);
                  setTimeout(() => setCopiedAwb(false), 2000);
                }}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-[#916618] text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copiedAwb ? 'Copied' : 'Copy Tracking Number'}</span>
              </button>
            </div>
          </div>

          {/* 2. Ordered Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Order Items ({items.length})
            </h4>
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">No items found for this order.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 sm:p-4 flex items-center gap-3.5 bg-white">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#caa04c] shrink-0 font-serif font-bold text-xs">
                        NEESH
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.name}</h5>
                      <p className="text-[11px] text-slate-500">
                        Size: <span className="font-semibold text-slate-700">{item.size}</span> • Qty: <span className="font-semibold text-slate-700">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900">
                        Rs.{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-400">
                          Rs.{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Shipping & Payment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Shipping Address */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Shipping Address
              </span>
              <p className="font-bold text-slate-900">{shipping?.name || order.customerName || displayName}</p>
              <p className="text-slate-600 leading-relaxed">
                {shipping?.address || order.shippingAddress || defaultAddress || 'Standard Address'}<br />
                {shipping?.city || defaultCity ? `${shipping?.city || defaultCity}, ` : ''}{shipping?.pincode || defaultPincode || ''}
              </p>
              <p className="text-slate-500 pt-1">
                Phone: {shipping?.phone || order.customerPhone || defaultPhone || '—'}
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Payment Details
                </span>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Method:</span>
                  <span className="font-semibold capitalize text-slate-900">
                    {order.paymentMethod === 'razorpay' ? 'Prepaid (Razorpay)' : (order.paymentMethod || 'Prepaid')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Shipping:</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total:</span>
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  Rs.{(Number(order.total || order.totalAmount) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Need help with this order? Contact support.
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
