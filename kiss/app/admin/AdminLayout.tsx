'use client';
import React, { useState } from 'react';
import { Show, UserButton } from '@clerk/nextjs';
import { AuthModal } from '../auth/AuthModal';
import { DashboardOverview } from './DashboardOverview';
import { ProductsManager } from './ProductsManager';
import { OrdersManager } from './OrdersManager';
import { HeroManager } from './HeroManager';
import { CollectionsManager } from './CollectionsManager';
import { PerfumersCelebritiesManager } from './PerfumersCelebritiesManager';
import { ReelsPressManager } from './ReelsPressManager';
import { CouponsManager } from './CouponsManager';
import { ReviewsManager } from './ReviewsManager';
import { SettingsManager } from './SettingsManager';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

type TabType = 'overview' | 'products' | 'orders' | 'hero' | 'reels' | 'collections' | 'perfumers' | 'coupons' | 'reviews' | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const TABS: { id: TabType; name: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      name: 'Dashboard',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      )
    },
    {
      id: 'products',
      name: 'Products & Stock',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'orders',
      name: 'Orders & Sales',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'hero',
      name: 'Hero Carousel',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'reels',
      name: 'Reels & Press',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      id: 'collections',
      name: 'Collections & Circles',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'perfumers',
      name: 'Perfumers & Celebs',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'coupons',
      name: 'Discount Coupons',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      id: 'reviews',
      name: 'Customer Reviews',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      id: 'settings',
      name: 'Store Settings',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-[#111827] text-slate-300 flex flex-col justify-between hidden md:flex shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-serif text-xl font-bold tracking-widest text-[#c59b48]">NEESH™</span>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">Admin Management</p>
            </div>
            <span className="bg-[#c59b48]/10 text-[#c59b48] border border-[#c59b48]/20 px-2 py-0.5 rounded text-[10px] font-bold">
              PRO
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-[#c59b48] text-black font-bold shadow-md shadow-[#c59b48]/20' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            <span>←</span>
            <span>Back to Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-800">
              {TABS.find(t => t.id === activeTab)?.name}
            </h1>
          </div>

          {/* User & Auth Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="hidden sm:inline-flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-all cursor-pointer"
            >
              Storefront Preview
            </button>

            {/* Custom Authentication Integration */}
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <Show when="signed-in">
                <UserButton afterSignOutUrl="/" />
                <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">Admin User</span>
              </Show>
              <Show when="signed-out">
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs font-bold text-[#c59b48] hover:underline cursor-pointer"
                >
                  Admin Sign In
                </button>
              </Show>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-[#111827] text-white p-4 border-b border-white/10 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold ${
                  activeTab === tab.id ? 'bg-[#c59b48] text-black font-bold' : 'text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Tab Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'hero' && <HeroManager />}
          {activeTab === 'reels' && <ReelsPressManager />}
          {activeTab === 'collections' && <CollectionsManager />}
          {activeTab === 'perfumers' && <PerfumersCelebritiesManager />}
          {activeTab === 'coupons' && <CouponsManager />}
          {activeTab === 'reviews' && <ReviewsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>

      </div>

      {/* Unified Custom Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

    </div>
  );
};
