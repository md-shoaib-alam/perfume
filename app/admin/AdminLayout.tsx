'use client';
import React, { useState, useEffect } from 'react';
import { Show, UserButton } from '@clerk/nextjs';
import { AuthModal } from '../auth/AuthModal';
import { client as appwriteClient } from '@/lib/appwrite';
import { DashboardOverview } from './DashboardOverview';
import { ProductsManager } from './ProductsManager';
import { OrdersManager } from './OrdersManager';
import { HeroManager } from './HeroManager';
import { CollectionsManager } from './CollectionsManager';
import { PerfumersCelebritiesManager } from './PerfumersCelebritiesManager';
import { ReelsPressManager } from './ReelsPressManager';
import { CouponsManager } from './CouponsManager';
import { ReviewsManager } from './ReviewsManager';
import { AnnouncementBarManager } from './AnnouncementBarManager';
import { MessagesManager } from './MessagesManager';
import { SettingsManager } from './SettingsManager';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

type TabType = 'overview' | 'products' | 'orders' | 'hero' | 'announcement' | 'messages' | 'reels' | 'collections' | 'perfumers' | 'coupons' | 'reviews' | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pingStatus, setPingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pingMessage, setPingMessage] = useState<string>('');

  useEffect(() => {
    const tabLabels: Record<TabType, string> = {
      overview: 'Overview',
      products: 'Products',
      orders: 'Orders',
      hero: 'Hero Banners',
      announcement: 'Announcement Bar',
      messages: 'Contact Inquiries',
      reels: 'Reels & Press',
      collections: 'Collections',
      perfumers: 'Perfumers',
      coupons: 'Coupons',
      reviews: 'Reviews',
      settings: 'Settings'
    };
    document.title = `Admin ${tabLabels[activeTab] || 'Dashboard'} – BakhoorBliss`;
  }, [activeTab]);

  const handlePingAppwrite = async () => {
    setPingStatus('loading');
    setPingMessage('Pinging...');
    const startTime = Date.now();
    try {
      if (typeof (appwriteClient as any).ping === 'function') {
        const res = await (appwriteClient as any).ping();
        const duration = Date.now() - startTime;
        setPingStatus('success');
        setPingMessage(`OK (${duration}ms)`);
        console.log('Appwrite ping response:', res);
      } else {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
        if (!endpoint || !projectId) throw new Error('Appwrite environment variables missing');
        await fetch(`${endpoint}/health`, {
          headers: { 'X-Appwrite-Project': projectId }
        });
        const duration = Date.now() - startTime;
        setPingStatus('success');
        setPingMessage(`OK (${duration}ms)`);
      }
    } catch (err: any) {
      console.error('Appwrite ping error:', err);
      setPingStatus('error');
      setPingMessage('Error');
    }

    setTimeout(() => {
      setPingStatus('idle');
      setPingMessage('');
    }, 4000);
  };

  const renderPingIcon = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return (
          <svg className="w-4 h-4 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

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
      id: 'announcement',
      name: 'Announcement Bar',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    },
    {
      id: 'messages',
      name: 'Contact Inquiries',
      icon: (
        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
    <div className="flex min-h-screen bg-[#faf9f6] text-slate-800 font-sans antialiased">
      
      {/* Sidebar - Desktop Refined Light Luxury */}
      <aside className="w-64 bg-white text-slate-700 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs border-r border-slate-200/90">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#d6a750] border border-[#caa04c] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs shrink-0">
                BB
              </div>
              <div className="leading-none">
                <span className="font-bold text-sm tracking-wide text-slate-900 block">
                  BakhoorBliss
                </span>
                <span className="text-[8.5px] font-sans font-semibold tracking-[0.16em] text-slate-400 uppercase block mt-1">
                  Admin Console
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[9px] font-bold font-mono tracking-wider">
              v2.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#fbf7ee] text-[#855e16] font-bold border border-[#caa04c]/50 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-[#b88f3e]' : 'text-slate-400'}>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
          {/* Appwrite Status Ping Button */}
          <button
            onClick={handlePingAppwrite}
            disabled={pingStatus === 'loading'}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              pingStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : pingStatus === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : pingStatus === 'loading'
                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
            title="Test Appwrite Connection Ping"
          >
            <div className="flex items-center gap-2">
              <span>{renderPingIcon(pingStatus)}</span>
              <span className="text-[11px]">Appwrite Cloud</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {pingStatus === 'loading'
                ? 'Pinging...'
                : pingStatus === 'success'
                ? pingMessage || 'Live'
                : pingStatus === 'error'
                ? 'Error'
                : 'Live'}
            </span>
          </button>

          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
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
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors border border-slate-200"
              aria-label="Open Admin Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              {TABS.find(t => t.id === activeTab)?.name}
            </h1>
          </div>

          {/* User & Auth Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
            >
              <span className="hidden sm:inline">Storefront Preview</span>
              <span className="sm:hidden">Store</span>
              <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>

            {/* Custom Authentication Integration */}
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <Show when="signed-in">
                <UserButton />
                <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">Admin User</span>
              </Show>
              <Show when="signed-out">
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs font-bold text-[#c59b48] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </Show>
            </div>
          </div>
        </header>

        {/* Mobile Horizontal Fast Tab Swiper */}
        <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 overflow-x-auto flex gap-2 scrollbar-none shrink-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#fbf7ee] text-[#855e16] font-bold border border-[#caa04c]/50 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'overview' && <DashboardOverview onNavigateTo={(tab) => setActiveTab(tab as TabType)} />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'hero' && <HeroManager />}
          {activeTab === 'announcement' && <AnnouncementBarManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'reels' && <ReelsPressManager />}
          {activeTab === 'collections' && <CollectionsManager />}
          {activeTab === 'perfumers' && <PerfumersCelebritiesManager />}
          {activeTab === 'coupons' && <CouponsManager />}
          {activeTab === 'reviews' && <ReviewsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>

      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          
          {/* Slide-in Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white text-slate-700 shadow-2xl flex flex-col justify-between z-10 animate-slide-in-left border-r border-slate-200 h-full">
            <div>
              {/* Brand & Close Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#d6a750] border border-[#caa04c] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs shrink-0">
                    BB
                  </div>
                  <div className="leading-none">
                    <span className="font-bold text-sm tracking-wide text-slate-900 block">
                      BakhoorBliss
                    </span>
                    <span className="text-[8.5px] font-sans font-semibold tracking-[0.16em] text-slate-400 uppercase block mt-1">
                      Admin Console
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close Navigation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Tabs */}
              <nav className="p-4 space-y-1.5 max-h-[calc(100vh-160px)] overflow-y-auto">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as TabType);
                        setIsMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#fbf7ee] text-[#855e16] font-bold border border-[#caa04c]/50 shadow-2xs' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={isActive ? 'text-[#b88f3e]' : 'text-slate-400'}>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2.5">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onBackToStore();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Storefront</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Custom Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

    </div>
  );
};
