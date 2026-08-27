'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api } from '../services/api';
import { getProductSlug } from '../utils/slug';
import type { Product } from '../types';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
  onOpenAccount?: () => void;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  initialQuery?: string;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  cartCount = 0,
  onOpenCart,
  onOpenAuth,
  onOpenAccount: _onOpenAccount,
  onSearchChange,
  onSearchSubmit,
  initialQuery = ''
}) => {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();

  const [rawQuery, setRawQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manage smooth slide-down entry and slide-up exit animations
  useEffect(() => {
    let frame1: number;
    let frame2: number;
    let exitTimer: NodeJS.Timeout;

    if (isOpen) {
      setIsMounted(true);
      // Double rAF ensures the initial off-screen position (-translate-y-full) is painted before triggering the slide-down
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      exitTimer = setTimeout(() => {
        setIsMounted(false);
      }, 400);
    }

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      clearTimeout(exitTimer);
    };
  }, [isOpen]);

  // Sync initial query
  useEffect(() => {
    if (initialQuery !== rawQuery) {
      setRawQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounce input value changes (250ms)
  useEffect(() => {
    if (rawQuery !== debouncedQuery) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery);
      setIsSearching(false);
      // Only notify parent when query is at least 3 chars or completely cleared
      if (onSearchChange) {
        if (rawQuery.trim().length >= 3 || rawQuery.trim().length === 0) {
          onSearchChange(rawQuery);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [rawQuery, onSearchChange]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      // Auto-focus the input depending on viewport
      setTimeout(() => {
        if (window.innerWidth >= 768) {
          desktopInputRef.current?.focus();
        } else {
          mobileInputRef.current?.focus();
        }
      }, 80);

      // Lock mobile body scroll
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Pre-load catalog dynamically from Appwrite when search drawer is opened
  useEffect(() => {
    if (isOpen && catalog.length === 0 && !isCatalogLoading) {
      setIsCatalogLoading(true);
      api.getProducts()
        .then((items) => {
          if (items && items.length > 0) {
            setCatalog(items);
          }
        })
        .catch((err) => console.warn('Search catalog load failed:', err))
        .finally(() => setIsCatalogLoading(false));
    }
  }, [isOpen, catalog.length, isCatalogLoading]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamically compute suggestions from live Appwrite catalog (No hardcoding)
  const dynamicSuggestions = useMemo(() => {
    if (catalog.length === 0) return [];

    const bestsellers = catalog
      .filter((p) => p.isBestseller && p.name)
      .map((p) => p.name.trim());

    const liveCollections = Array.from(
      new Set(
        catalog
          .map((p) => p.collection || (p.category ? p.category.replace(/[-_]/g, ' ') : ''))
          .filter(Boolean)
          .map((c) => c.replace(/\b\w/g, (l) => l.toUpperCase()))
      )
    );

    const topProducts = catalog.slice(0, 6).map((p) => p.name.trim());
    const combined = Array.from(new Set([...bestsellers, ...liveCollections, ...topProducts]));
    return combined.slice(0, 8);
  }, [catalog]);

  // Autocomplete matching products (debounced search over live catalog - minimum 3 characters)
  const searchResults = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q || q.length < 3 || catalog.length === 0) return [];

    return catalog.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const subtitle = product.subtitle?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const collection = product.collection?.toLowerCase() || '';
      const notes = [
        ...(product.notes?.top || []),
        ...(product.notes?.heart || []),
        ...(product.notes?.base || [])
      ].join(' ').toLowerCase();

      return (
        name.includes(q) ||
        subtitle.includes(q) ||
        category.includes(q) ||
        collection.includes(q) ||
        description.includes(q) ||
        notes.includes(q)
      );
    }).slice(0, 6);
  }, [debouncedQuery, catalog]);

  // Reset highlight index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  // Perform search submit
  const handleSearchSubmit = useCallback((queryToSubmit?: string) => {
    const targetQuery = (queryToSubmit !== undefined ? queryToSubmit : rawQuery).trim();
    if (!targetQuery) return;

    onClose();

    if (onSearchSubmit) {
      onSearchSubmit(targetQuery);
    } else {
      router.push(`/collections/all?q=${encodeURIComponent(targetQuery)}`);
    }
  }, [rawQuery, onSearchSubmit, onClose, router]);

  // Keyboard navigation within search input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          e.preventDefault();
          const selectedProduct = searchResults[highlightedIndex];
          onClose();
          router.push(`/products/${getProductSlug(selectedProduct)}`);
        }
      }
    }
  };

  if (!isMounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* 1. Backdrop Overlay (Smooth fade in / fade out) */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. DESKTOP SEARCH NAVBAR (Smooth slide-down on open, slide-up on close) */}
      <div className={`hidden md:block relative z-50 bg-white border-b border-slate-200 shadow-xl shadow-slate-900/5 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform transform ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-[1740px] mx-auto w-full px-6 sm:px-10 lg:px-14 h-24 sm:h-28 flex items-center justify-between gap-6 sm:gap-8 lg:gap-10">
          
          {/* Left: Brand Logo (Large & Clear) */}
          <Link 
            href="/" 
            onClick={onClose}
            className="shrink-0 flex items-center cursor-pointer py-1"
          >
            <img 
              src="/assets/neesh_logo_130x40.avif" 
              alt="NEESH PERFUMES" 
              loading="lazy"
              decoding="async"
              className="h-10 sm:h-12 w-auto object-contain transition-transform" 
            />
          </Link>

          {/* Center: Clean Rectangular Search Box with Extra Wide Span */}
          <div className="flex-1 max-w-5xl lg:max-w-6xl mx-1 sm:mx-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="relative w-full flex items-center">
              <input
                ref={desktopInputRef}
                type="text"
                value={rawQuery}
                onChange={(e) => setRawQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search products"
                className="w-full bg-white text-slate-800 text-sm sm:text-base px-6 py-3.5 sm:py-4 pr-14 border border-slate-300 focus:outline-none focus:border-[#d6a750] transition-colors shadow-xs"
              />

              {/* Inside Right Search Icon or Spinner */}
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-4.5 text-slate-500 hover:text-[#d6a750] transition-colors cursor-pointer"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Right: Icons (Profile, Wishlist, Bag) with Refined Tighter Gapping */}
          <div className="flex items-center space-x-3 sm:space-x-4.5 text-slate-900 shrink-0">
            {/* Account Profile Icon */}
            {isLoaded && isSignedIn ? (
              <Link
                href="/account"
                onClick={onClose}
                className="p-1 transition-all cursor-pointer flex items-center justify-center group"
                title="My Account"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || 'Profile'}
                    className="w-8 h-8 rounded-full border border-[#d6a750] object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#d6a750]/10 border border-[#d6a750] flex items-center justify-center text-xs font-bold text-[#b69254]">
                    {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </Link>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="p-1.5 transition-colors cursor-pointer hover:text-[#d6a750]" 
                title="Sign In"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}

            {/* Wishlist Heart Icon */}
            <Link
              href="/account"
              onClick={onClose}
              className="p-1.5 transition-colors cursor-pointer hover:text-[#d6a750]"
              title="Wishlist"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Shopping Bag Icon with Badge */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCart) onOpenCart();
              }}
              className="relative p-1.5 transition-colors cursor-pointer hover:text-[#d6a750]"
              title="Shopping Bag"
            >
              <svg className="w-6.5 h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d6a750] text-slate-950 font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Desktop Live Search Results Dropdown Overlay (Only visible when user types >= 3 chars) */}
        {debouncedQuery.trim().length >= 3 && (
          <div className="max-w-[1740px] mx-auto w-full px-6 sm:px-10 lg:px-14 pb-5">
            <div className="max-w-5xl lg:max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden mt-1 animate-fade-in">
              <div className="px-5 py-3 bg-[#faf9f6] border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d6a750]" />
                  <span>Matching Fragrances ({searchResults.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="text-[#b69254] hover:text-[#977638] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View full catalog</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-h-[420px] overflow-y-auto">
                  {searchResults.map((product, idx) => {
                    const slug = getProductSlug(product);
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${slug}`}
                        onClick={onClose}
                        className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 group cursor-pointer ${
                          isHighlighted
                            ? 'bg-[#fffdf7] border-[#d6a750] shadow-xs'
                            : 'bg-white border-slate-200/70 hover:border-[#d6a750]/60 hover:bg-[#faf9f6] hover:shadow-xs'
                        }`}
                      >
                        {/* Crisp Bottle Image */}
                        <div className="w-16 h-16 rounded-lg bg-[#faf9f6] border border-slate-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-5 h-5 text-slate-300">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Information */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#b69254] tracking-wider uppercase block truncate">
                            {product.category?.replace(/[-_]/g, ' ') || 'Extrait De Parfum'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#b69254] transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {product.subtitle || `${product.volume || '100ml'} • Haute Perfumery`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-900">
                              ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-slate-400 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">No matching fragrances found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try searching by notes like "Oud", "Rose", "Bergamot", or "Attar"</p>
                </div>
              )}

              <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Showing {searchResults.length} fragrance recommendation{searchResults.length > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Search All Collections for "{debouncedQuery}"</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MOBILE SLIDE-DOWN SEARCH DRAWER (Smooth slide transition) */}
      <div className={`md:hidden fixed inset-x-0 top-0 bottom-0 z-50 bg-white flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform transform ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        {/* Mobile Header: "Search our store" and "✕" */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="font-serif text-lg text-slate-900 font-normal tracking-tight">
            Search our store
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search Input Line (Clean Rectangular Box) */}
        <div className="p-5 pb-3">
          <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="relative w-full flex items-center">
            <input
              ref={mobileInputRef}
              type="text"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="Search products"
              className="w-full bg-white text-slate-800 text-sm px-4 py-2.5 pr-10 border border-slate-300 focus:outline-none focus:border-[#d6a750] transition-colors"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 text-slate-600 hover:text-[#d6a750] transition-colors cursor-pointer"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Mobile Results / Dynamic Suggestions Body */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {debouncedQuery.trim().length >= 3 ? (
            <div>
              <div className="pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Fragrances ({searchResults.length})</span>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="text-[#b69254] font-bold lowercase tracking-normal"
                >
                  view all →
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((product) => {
                    const slug = getProductSlug(product);
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3.5 py-3 active:bg-amber-50/40 group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl bg-[#faf9f6] border border-slate-100 p-1 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-5 h-5 text-slate-300">
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-[#b69254] tracking-wider uppercase block truncate">
                            {product.category?.replace(/[-_]/g, ' ') || 'Extrait De Parfum'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#b69254] transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {product.subtitle || `${product.volume || '100ml'} • Haute Perfumery`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-900">
                              ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  <div className="pt-4 pb-2">
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-3 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Search All Collections for "{debouncedQuery}"</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-medium text-slate-700">No matching fragrances found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try searching with different fragrance notes or categories</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-slate-400 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {rawQuery.trim().length > 0 && rawQuery.trim().length < 3
                  ? 'Type at least 3 characters to search'
                  : 'Search by fragrance name, note, or collection'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                E.g. Oud, Mehr, Rose, Extrait De Parfum
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
