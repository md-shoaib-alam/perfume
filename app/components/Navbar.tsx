'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { SearchDrawer } from './SearchDrawer';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onOpenAuth?: () => void;
  onOpenAccount?: () => void;
  isMenuOpen?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenMenu,
  onOpenAuth,
  onOpenAccount,
  isMenuOpen = false,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle header background on scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 w-full bg-white text-slate-900 py-1 transition-all duration-300 ease-in-out transform-gpu ${
        isScrolled ? 'shadow-xs border-b border-slate-100' : ''
      }`}>
        <div className="max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16 relative">
          
          {/* Left: Hamburger Menu */}
          <div className="flex items-center z-10">
            <button 
              onClick={onOpenMenu}
              className="p-1.5 transition-colors duration-200 cursor-pointer text-slate-900 hover:text-[#d6a750]"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Center: Absolute Centered Golden Logo (Matches Image 1 & Image 3) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex justify-center items-center">
            <Link href="/" className="flex items-center group cursor-pointer">
              <img 
                src="/assets/bakhoorbliss.avif" 
                alt="Bakhoor Bliss" 
                loading="lazy"
                decoding="async"
                className="h-10 sm:h-12 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90" 
              />
            </Link>
          </div>

          {/* Right: Icons (Search, Profile/User, Shopping Bag) */}
          <div className="flex items-center space-x-3 sm:space-x-5 z-10">
            
            {/* 1. Search Toggle Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 transition-colors duration-200 cursor-pointer text-slate-900 hover:text-[#d6a750]"
              title="Search Fragrances"
              aria-label="Search"
            >
              <svg className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 2. User Profile Account Icon (Desktop Only - Hidden on Mobile) */}
            <div className="hidden sm:flex items-center justify-center">
              {isLoaded && isSignedIn ? (
                <Link
                  href="/account"
                  className="p-1 transition-all duration-200 cursor-pointer flex items-center justify-center group"
                  title="My Account Dashboard"
                  aria-label="My Account Dashboard"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.firstName || 'Profile'}
                      loading="lazy"
                      decoding="async"
                      className="w-7 h-7 rounded-full border border-[#d6a750] object-cover group-hover:ring-2 group-hover:ring-[#d6a750]/40 transition-all"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#d6a750]/10 border border-[#d6a750] flex items-center justify-center text-[11px] font-bold text-[#b69254]">
                      {user?.firstName ? (
                        user.firstName[0].toUpperCase()
                      ) : (
                        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  )}
                </Link>
              ) : (
                <button 
                  type="button"
                  onClick={onOpenAuth}
                  className="p-1.5 transition-colors duration-200 cursor-pointer text-slate-900 hover:text-[#d6a750] flex items-center justify-center" 
                  title="Account / Sign In"
                  aria-label="Account"
                >
                  <svg className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>

            {/* 3. Shopping Bag with Gold Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-1.5 transition-colors duration-200 cursor-pointer text-slate-900 hover:text-[#d6a750]"
              title="Bag"
              aria-label="Bag"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d6a750] text-slate-950 font-sans font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Modular Search Overlay / Drawer (Desktop Navbar Transformation + Mobile Slide Drawer) */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
        onOpenAccount={onOpenAccount}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        initialQuery={searchQuery}
      />
    </>
  );
};
