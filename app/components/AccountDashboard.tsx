'use client';

import React from 'react';
import type { Product } from '../types';
import { AccountView } from './AccountView';

interface AccountDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, size: string) => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in-up">
      <div className="relative w-full max-w-6xl bg-white rounded-md shadow-2xl border border-slate-100 overflow-hidden my-auto min-h-[620px] flex flex-col font-sans">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-widest text-[#b69254]">NEESH™</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Customer Account</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shared Account Tabs and Viewport */}
        <AccountView
          onClose={onClose}
          onAddToCart={onAddToCart}
          onShopNow={onClose}
          onLogoutCallback={onClose}
        />

        {/* Footer Attribution */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-center gap-1 text-[11px] text-slate-400 shrink-0">
          <span>Secured by</span>
          <span className="font-extrabold tracking-wider text-slate-800">AXENTRA</span>
        </div>
      </div>
    </div>
  );
};
