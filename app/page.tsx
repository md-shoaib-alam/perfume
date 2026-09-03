'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { LoadingScreen } from './components/LoadingScreen';
import { MasterPerfumersSection } from './components/MasterPerfumersSection';
import { ReelShortsSection } from './components/ReelShortsSection';
import { GoldTrustBanner } from './components/GoldTrustBanner';
import { CelebritySection } from './components/CelebritySection';
import { CollectionsCirclesSection } from './components/CollectionsCirclesSection';
import { GenderCampaignBanners } from './components/GenderCampaignBanners';
import { InstagramShowcaseSection } from './components/InstagramShowcaseSection';
import { Footer } from './components/Footer';

const CartDrawer = dynamic(() => import('./components/CartDrawer').then((m) => m.CartDrawer), { ssr: false });
const MenuDrawer = dynamic(() => import('./components/MenuDrawer').then((m) => m.MenuDrawer), { ssr: false });
const AuthModal = dynamic(() => import('./auth/AuthModal').then((m) => m.AuthModal), { ssr: false });
const AccountDashboard = dynamic(() => import('./components/AccountDashboard').then((m) => m.AccountDashboard), { ssr: false });

import { api } from './services/api';
import { useCart } from './hooks/useCart';
import { getProductSlug } from './utils/slug';
import type { Product } from './types';
import { resolveProductSizeOptions, resolveProductUnitPrice } from '@/lib/pricing';
import { useProductsQuery } from './hooks/useQueries';

export default function Page() {
  const router = useRouter();
  const { data: queryProducts = [], isLoading: isQueryLoading } = useProductsQuery();
  const [activeTab, setActiveTab] = useState<'For Him' | 'For Her' | 'Gift Sets'>('For Him');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const productsList = queryProducts;
  const loading = isQueryLoading && productsList.length === 0;
  // Only show loading screen if cold cache and data is actively fetching for the very first time
  const showLoadingScreen = isQueryLoading && queryProducts.length === 0;

  const {
    cartItems,
    totalCartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  // Set Home page title & scroll to top
  useEffect(() => {
    document.title = 'BakhoorBliss | Luxury Extrait De Parfum & Attars';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Filter products by activeTab gender & search query
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // 1. Filter by Active Tab (For Him / For Her / Gift Sets)
      if (activeTab === 'For Him') {
        if (product.gender && product.gender !== 'For Him' && product.gender !== 'Unisex') {
          return false;
        }
      } else if (activeTab === 'For Her') {
        if (product.gender && product.gender !== 'For Her' && product.gender !== 'Unisex') {
          return false;
        }
      } else if (activeTab === 'Gift Sets') {
        if (product.gender !== 'Gift Sets' && product.category !== 'gift-set' && product.category !== 'discovery-set') {
          return false;
        }
      }

      // 2. Filter by search query (Minimum 3 characters)
      const query = searchQuery.trim().toLowerCase();
      if (!query || query.length < 3) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.subtitle?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, productsList, activeTab]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#d6a13d] selection:text-black relative">
      <LoadingScreen isLoading={showLoadingScreen} />
      
      {/* 1. Gold Announcement Offer Bar */}
      <AnnouncementBar />

      {/* 2. Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(!isCartOpen)}
        onOpenMenu={() => setIsMenuOpen(!isMenuOpen)}
        isCartOpen={isCartOpen}
        isMenuOpen={isMenuOpen}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthModalOpen(true);
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => {
          if (q.trim()) router.replace(`/collections/all?q=${encodeURIComponent(q.trim())}`);
        }}
      />

      {/* 3. Tsunara Hero Banner */}
      <HeroSection
        onShopNow={() => {
          document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. Our Bestsellers Section */}
      <section id="bestsellers" className="py-16 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="text-center mb-10 font-serif">
          <h2 className="text-3xl sm:text-4xl font-normal text-slate-800 tracking-wide mb-6">
            Our Bestsellers
          </h2>

          {/* Sub-tabs: For Him / For Her / Gift Sets */}
          <div className="flex justify-center items-center gap-8 text-xs font-sans tracking-widest font-medium border-b border-slate-200/80 pb-2 max-w-xs mx-auto">
            {(['For Him', 'For Her', 'Gift Sets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === tab
                    ? 'border-[#353534] text-slate-900 font-bold border-b-2'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {searchQuery && searchQuery.trim().length >= 3 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-sans text-slate-600 bg-amber-50/60 border border-amber-200/50 py-1.5 px-4 rounded-full max-w-fit mx-auto">
              <span>Showing search results for <strong className="text-slate-900 font-semibold">"{searchQuery}"</strong></span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#b69254] hover:text-[#977638] font-bold ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Product Cards Container (4 per row on Tablets and Desktops) */}
        {loading ? (
          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 md:gap-4 lg:gap-6 pb-4 no-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="w-[72vw] max-w-[260px] shrink-0 snap-center sm:w-auto sm:max-w-none bg-white p-1 sm:p-2 rounded-xl flex flex-col justify-between"
              >
                <div className="w-full flex flex-col items-center">
                  {/* Square Image Skeleton */}
                  <div className="w-full aspect-square bg-slate-100 rounded-lg animate-pulse mb-3 sm:mb-4" />
                  {/* Title Skeleton */}
                  <div className="h-6 w-3/4 bg-slate-100 rounded-md animate-pulse mb-2" />
                  {/* Subtitle Skeleton */}
                  <div className="h-3.5 w-1/2 bg-slate-100 rounded-md animate-pulse mb-2" />
                  {/* Note/Description Lines Skeleton */}
                  <div className="h-2.5 w-5/6 bg-slate-100 rounded-md animate-pulse mb-1.5" />
                  <div className="h-2.5 w-4/6 bg-slate-100 rounded-md animate-pulse mb-3" />
                  {/* Price Skeleton */}
                  <div className="h-4 w-1/3 bg-slate-100 rounded-md animate-pulse mb-3 sm:mb-4" />
                  {/* Size Options Pills Skeleton */}
                  <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <div className="h-6 w-12 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-6 w-12 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-6 w-12 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
                {/* Add to Bag Button Skeleton */}
                <div className="w-full h-11 bg-slate-100 rounded-lg animate-pulse mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="pt-2 pb-10 sm:pt-4 sm:pb-14 px-6 text-center max-w-lg mx-auto space-y-3">
            <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 mx-auto flex items-center justify-center">
              <img
                src="/assets/empty-fragrance.avif"
                alt="No fragrance found"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain mix-blend-multiply opacity-95"
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                {searchQuery ? `No Fragrances Matching "${searchQuery}"` : 'No Fragrances Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try searching with different keywords or clear your search.'
                  : 'No products available in this selection.'}
              </p>
            </div>

            {searchQuery && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 md:gap-4 lg:gap-6 pb-4 no-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0">
            {filteredProducts.map((product) => (
              <div key={product.id} className="w-[72vw] max-w-[260px] shrink-0 snap-center sm:w-auto sm:max-w-none">
                <ProductCard
                  product={product}
                  onAddToCart={addToCart}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Master Perfumers Section */}
      <MasterPerfumersSection />

      {/* 6. Reel Shorts & Featured In Press Logos */}
      <ReelShortsSection />

      {/* 7. Gold Trust Banner */}
      <GoldTrustBanner />

      {/* 8. Celebrity Showcase */}
      <CelebritySection />

      {/* 8.5 Collections Category Circles */}
      <CollectionsCirclesSection />

      {/* 8.6 Gender Campaign Banners */}
      <GenderCampaignBanners onSelectGender={setActiveTab} />

      {/* 8.7 Instagram "Get Inspired" Showcase */}
      <InstagramShowcaseSection />

      {/* 9. Footer */}
      <Footer />

      {/* 10. Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onOpenAuth={(selectedMode) => {
          setAuthMode(selectedMode || 'signin');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 10.5 Sliding Hamburger Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(selectedMode) => {
          setAuthMode(selectedMode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* 11. Screenshot-matched Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* 12. Full My Account Dashboard (Screenshot-matched) */}
      <AccountDashboard
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onAddToCart={addToCart}
      />

      {/* Quick View Product Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl border border-slate-200">
            <button
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-black p-2 cursor-pointer"
              aria-label="Close quick view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <img
                src={selectedProductModal.image}
                alt={selectedProductModal.name}
                loading="lazy"
                decoding="async"
                className="w-full h-64 object-cover rounded-xl"
              />

              <div className="space-y-3 font-serif">
                <span className="text-xs font-sans uppercase tracking-widest text-[#b69254] font-semibold">{selectedProductModal.volume}</span>
                <h3 className="text-2xl font-bold text-slate-900">{selectedProductModal.name}</h3>
                <p className="text-xs font-sans text-slate-500">{selectedProductModal.subtitle}</p>

                <div className="pt-2">
                  <span className="text-xl font-bold text-slate-900">
                    Rs.{(
                      resolveProductUnitPrice(
                        selectedProductModal,
                        resolveProductSizeOptions(selectedProductModal)[0]?.size
                      )
                    ).toLocaleString('en-IN')}.00
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const sizeOpts = resolveProductSizeOptions(selectedProductModal);
                      const defaultOption = sizeOpts.length > 0 ? sizeOpts[0] : null;
                      const defaultSize = defaultOption?.size || selectedProductModal.volume || '100ml';
                      const defaultPrice = defaultOption?.price ?? resolveProductUnitPrice(selectedProductModal, defaultSize);

                      addToCart(selectedProductModal, defaultSize, defaultPrice);
                      setSelectedProductModal(null);
                    }}
                    className="flex-1 py-3 bg-[#d6a750] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#c49232] transition-colors cursor-pointer"
                  >
                    ADD TO BAG
                  </button>

                  <Link
                    href={`/products/${getProductSlug(selectedProductModal)}`}
                    onClick={() => setSelectedProductModal(null)}
                    className="px-4 py-3 bg-slate-900 hover:bg-black text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
