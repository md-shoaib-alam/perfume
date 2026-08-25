'use client';
import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
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

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'hero' | 'collections' | 'perfumers' | 'coupons' | 'reviews' | 'settings'
  >('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const TABS = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '🧴' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'hero', label: 'Hero Banner', icon: '🖼️' },
    { id: 'collections', label: 'Collections', icon: '✨' },
    { id: 'perfumers', label: 'Perfumers & Stars', icon: '👑' },
    { id: 'coupons', label: 'Coupons & Offers', icon: '🏷️' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:w-64 bg-[#1a1a1a] text-white flex-col justify-between p-6 border-r border-white/10 shrink-0">
        <div className="space-y-8">
          {/* Admin Logo */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-widest text-[#d6a750]">NEESH</span>
              <span className="text-[10px] bg-[#d6a750]/20 text-[#d6a750] px-2 py-0.5 rounded font-mono font-bold uppercase">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Management Console</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#c59b48] text-black shadow-md font-bold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Action */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <span>←</span> Back to Storefront
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg text-lg"
            >
              ☰
            </button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 capitalize">
              {activeTab} Management
            </h1>
          </div>

          {/* User & Auth Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="hidden sm:inline-flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-all"
            >
              Storefront Preview
            </button>

            {/* Clerk Authentication Integration */}
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
                <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">Admin User</span>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-xs font-bold text-[#c59b48] hover:underline">
                    Admin Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-[#1a1a1a] text-white p-4 border-b border-white/10 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold ${
                  activeTab === tab.id ? 'bg-[#c59b48] text-black font-bold' : 'text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            <button
              onClick={onBackToStore}
              className="w-full py-2 bg-white/10 text-white rounded text-xs font-semibold mt-2"
            >
              ← Back to Storefront
            </button>
          </div>
        )}

        {/* Body View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <DashboardOverview onNavigateTo={(tab) => setActiveTab(tab as any)} />}
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

    </div>
  );
};
