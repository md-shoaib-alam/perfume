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
import { CouponsManager } from './CouponsManager';
import { ReviewsManager } from './ReviewsManager';
import { SettingsManager } from './SettingsManager';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

type TabType = 'overview' | 'products' | 'orders' | 'hero' | 'collections' | 'perfumers' | 'coupons' | 'reviews' | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const TABS = [
    { id: 'overview', name: 'Dashboard', icon: '📊' },
    { id: 'products', name: 'Products & Stock', icon: '💎' },
    { id: 'orders', name: 'Orders & Sales', icon: '📦' },
    { id: 'hero', name: 'Hero Carousel', icon: '🎬' },
    { id: 'collections', name: 'Collections & Circles', icon: '🔘' },
    { id: 'perfumers', name: 'Perfumers & Celebs', icon: '👑' },
    { id: 'coupons', name: 'Discount Coupons', icon: '🏷️' },
    { id: 'reviews', name: 'Customer Reviews', icon: '⭐' },
    { id: 'settings', name: 'Store Settings', icon: '⚙️' }
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
