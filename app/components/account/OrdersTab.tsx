'use client';

import React from 'react';

interface OrdersTabProps {
  orders: any[];
  onSelectOrder: (order: any) => void;
  onShopNow?: () => void;
  onClose?: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onSelectOrder,
  onShopNow,
  onClose
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
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
                className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs hover:border-[#caa04c]/60 hover:shadow-xs transition-all cursor-pointer flex flex-col gap-2.5 sm:gap-3 group"
              >
                {/* Row 1: Order Info (left) + Status Badge (right) */}
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Box Icon in rounded container + Order Number & Date */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#d09e44] shrink-0 group-hover:bg-amber-50/60 group-hover:border-amber-200/50 transition-colors">
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

                  {/* Right: Status Badge */}
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

                {/* Row 2: Price + Arrow (both right on desktop) */}
                <div className="flex items-center justify-between gap-2 sm:justify-between sm:gap-3">
                  {rawStatus === 'delivered' ? (
                    <span className="text-[11px] font-bold text-[#b88f3e] flex items-center gap-1 bg-amber-50/70 border border-amber-200/50 px-2 py-0.5 rounded-md">
                      <svg className="w-3 h-3 fill-current text-[#caa04c]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Rate & Review Products
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
