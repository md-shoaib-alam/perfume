'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Show, UserButton } from '@clerk/nextjs';
import { client as appwriteClient } from '@/lib/appwrite';

interface AdminShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    path: '/admin',
    name: 'Dashboard',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    path: '/admin/products',
    name: 'Products & Stock',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    path: '/admin/collections',
    name: 'Collections & Banners',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    path: '/admin/orders',
    name: 'Orders & Sales',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    path: '/admin/coupons',
    name: 'Coupons & Discounts',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  },
  {
    path: '/admin/reviews',
    name: 'Reviews Moderation',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  {
    path: '/admin/hero',
    name: 'Hero Carousel',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    path: '/admin/reels-press',
    name: 'Reels & Press',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    )
  },
  {
    path: '/admin/perfumers',
    name: 'Master Perfumers',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    path: '/admin/settings',
    name: 'Store Settings & Trust',
    icon: (
      <svg className="w-4.5 h-4.5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [pingStatus, setPingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pingMessage, setPingMessage] = useState<string>('');

  const handlePingAppwrite = async () => {
    setPingStatus('loading');
    setPingMessage('Pinging...');
    const startTime = Date.now();
    try {
      if (typeof (appwriteClient as any).ping === 'function') {
        await (appwriteClient as any).ping();
      } else {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
        if (!endpoint || !projectId) throw new Error('Appwrite environment variables missing');
        await fetch(`${endpoint}/health`, {
          headers: { 'X-Appwrite-Project': projectId }
        });
      }
      const duration = Date.now() - startTime;
      setPingStatus('success');
      setPingMessage(`OK (${duration}ms)`);
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

  return (
    <div className="flex h-screen bg-[#faf9f6] text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar Desktop - Refined Light Luxury Theme */}
      <aside className="w-68 bg-white border-r border-slate-200/90 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs">
        <div>
          {/* Logo & Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <img 
                src="/assets/bakhoorbliss.avif" 
                alt="Bakhoor Bliss" 
                loading="lazy"
                decoding="async"
                className="h-10 w-auto object-contain" 
              />
            </Link>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/80 rounded-md text-[9.5px] font-bold font-mono tracking-wider shadow-2xs">
              v2.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none">
            {NAV_ITEMS.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#d6a750] text-white font-bold shadow-md shadow-[#d6a750]/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>
                    {tab.icon}
                  </span>
                  <span className={isActive ? 'text-white font-bold' : 'text-slate-700 font-medium'}>
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Store Return */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Storefront</span>
          </Link>

          <div className="flex items-center justify-between gap-2 px-1 pt-1 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0 flex items-center justify-center">
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
              <div className="leading-tight min-w-0">
                <span className="text-[11px] font-bold text-slate-900 block truncate">Administrator</span>
                <span className="text-[9.5px] text-slate-400 font-mono block truncate">Appwrite Cloud</span>
              </div>
            </div>

            {/* Ping Health Button */}
            <button
              onClick={handlePingAppwrite}
              title="Ping Appwrite Cloud Health"
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 border ${
                pingStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : pingStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : pingStatus === 'loading'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${pingStatus === 'success' ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{pingMessage || 'Live'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="font-serif font-bold text-base sm:text-lg text-slate-900 capitalize">
              {NAV_ITEMS.find((item) => item.path === pathname)?.name || 'Admin Console'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <span>View Storefront</span>
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex md:hidden">
            <div className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-fade-in-up border-r border-slate-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <Link href="/admin" className="flex items-center gap-2">
                    <img 
                      src="/assets/bakhoorbliss.avif" 
                      alt="Bakhoor Bliss" 
                      loading="lazy"
                      decoding="async"
                      className="h-9 w-auto object-contain" 
                    />
                  </Link>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {NAV_ITEMS.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                      <Link
                        key={tab.path}
                        href={tab.path}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#d6a750] text-white font-bold shadow-md shadow-[#d6a750]/25'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-slate-500'}>{tab.icon}</span>
                        <span className={isActive ? 'text-white font-bold' : 'text-slate-700 font-medium'}>{tab.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <Link
                  href="/"
                  className="w-full block text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                >
                  Back to Storefront
                </Link>
                <div className="flex items-center gap-2.5 px-1">
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                  <div>
                    <span className="text-xs text-slate-800 font-bold block">Administrator</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Appwrite Cloud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Subroute Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
