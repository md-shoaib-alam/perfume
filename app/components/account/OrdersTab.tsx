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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Order History & Tracking</h3>
          <p className="text-xs text-slate-400">Track shipments, view itemized invoices, and delivery status.</p>
        </div>
        {orders.length > 0 && (
          <span className="text-xs font-bold text-[#b88f3e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        )}
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
                className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs hover:border-[#caa04c]/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 sm:gap-4 group"
              >
                {/* Left: Box Icon in rounded container + Order Number & Date */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#d09e44] shrink-0 group-hover:bg-amber-50/60 group-hover:border-amber-200/50 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#b88f3e] transition-colors">
                      Order #{orderNum}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal">
                      {dateStr}
                    </p>
                  </div>
                </div>

                {/* Right: Price + Status Badge + Chevron Icon */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
                    Rs.{(Number(ord.total || ord.totalAmount) || 0).toLocaleString('en-IN')}
                  </span>
                  
                  <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap ${
                    rawStatus === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700'
                      : rawStatus === 'shipped' || rawStatus === 'in_transit'
                      ? 'bg-blue-50 text-blue-700'
                      : rawStatus === 'cancelled'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {ord.orderStatus || ord.status || 'PENDING'}
                  </span>

                  <span className="text-slate-400 group-hover:text-[#caa04c] transition-colors hidden sm:inline">
                    <svg className="w-4 h-4 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
