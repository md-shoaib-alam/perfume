'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductCardSkeleton } from './components/ProductCardSkeleton';
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
import { resolveProductSizeOptions, resolveProductUnitPrice, isProductSoldOut } from '@/lib/pricing';
import { useProductsQuery } from './hooks/useQueries';
import { useProductImagePrefetch } from './hooks/useProductImagePrefetch';

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
  // Captured once: only a cold visit shows the splash, cached revisits must not flash it.
  const [coldLoad] = useState(isQueryLoading && queryProducts.length === 0);
  const [firstScreenReady, setFirstScreenReady] = useState(false);
  const showLoadingScreen = coldLoad && !firstScreenReady;

  // Hero first, everything else after: the splash waits for the first hero
  // image and the product data, but never outlives 2s from the page's own
  // start. Cards and lower sections then load on their own in the background.
  useEffect(() => {
    if (!coldLoad || firstScreenReady) return;

    const remaining = Math.max(0, 2000 - performance.now());
    const deadline = Date.now() + remaining;

    const heroReady = () => {
      const heroImages = Array.from(
        document.querySelectorAll<HTMLImageElement>('[data-hero-slide="0"] img')
      ).filter((img) => img.getClientRects().length > 0);
      return (
        heroImages.length > 0 &&
        heroImages.every((img) => img.complete && img.naturalWidth > 0)
      );
    };

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setFirstScreenReady(true);
    };

    const timer = setInterval(() => {
      if ((heroReady() && !loading) || Date.now() >= deadline) finish();
    }, 50);
    const backstop = setTimeout(finish, remaining);

    return () => {
      clearInterval(timer);
      clearTimeout(backstop);
    };
  }, [coldLoad, loading, firstScreenReady]);

  // Once the splash is gone, warm the first two gallery images of every
  // product so opening any product shows its photo instead of the blur.
  useProductImagePrefetch(queryProducts, !showLoadingScreen);

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

  // Keep the homepage section to a curated preview; the full tab catalogue lives on its collection page
  const HOME_PREVIEW_LIMIT = 8;
  const displayedProducts = filteredProducts.slice(0, HOME_PREVIEW_LIMIT);
  const isSearchActive = searchQuery.trim().length >= 3;
  const TAB_VIEW_ALL: Record<typeof activeTab, string> = {
    'For Him': '/collections/for-him',
    'For Her': '/collections/for-her',
    'Gift Sets': '/collections/gift-set'
  };

  return (
    <>
      <title>BakhoorBliss | Luxury Parfum & Attars</title>
      <meta name="description" content="Experience artisanal extrait de parfums, pure concentrated attars, and luxury Middle Eastern fragrance oils crafted with master perfumers." />
      <link rel="canonical" href="https://bakhoorbliss.in/" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
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
          <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 sm:overflow-x-visible sm:pb-0">
            <div className="flex w-max min-w-full flex-nowrap justify-center gap-3 sm:grid sm:w-auto sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 sm:gap-4 md:gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="w-[72vw] max-w-[260px] shrink-0 snap-center sm:w-auto sm:max-w-none">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
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
          <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 sm:overflow-x-visible sm:pb-0">
            <div className="flex w-max min-w-full flex-nowrap justify-center gap-3 sm:grid sm:w-auto sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 sm:gap-4 md:gap-4 lg:gap-6">
              {displayedProducts.map((product) => (
                <div key={product.id} className="w-[72vw] max-w-[260px] shrink-0 snap-center sm:w-auto sm:max-w-none">
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !isSearchActive && filteredProducts.length > displayedProducts.length && (
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              href={TAB_VIEW_ALL[activeTab]}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-sans font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              <span>View All {activeTab}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
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

      {/* 8.5 Collections Circles Section */}
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
              <Image
                src={selectedProductModal.image}
                alt={selectedProductModal.name}
                width={800}
                height={640}
                sizes="(max-width: 640px) 100vw, 50vw"
                loading="lazy"
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

                {(() => {
                  const sizeOpts = resolveProductSizeOptions(selectedProductModal);
                  const defaultOption = sizeOpts.length > 0 ? sizeOpts[0] : null;
                  const defaultSize = defaultOption?.size || selectedProductModal.volume || '100ml';
                  const defaultPrice = defaultOption?.price ?? resolveProductUnitPrice(selectedProductModal, defaultSize);
                  const isSoldOut = isProductSoldOut(selectedProductModal, defaultSize);

                  const isComingSoon = Boolean(selectedProductModal.isComingSoon);

                  return (
                    <div className="flex gap-2">
                      {isComingSoon ? (
                        <Link
                          href={`/products/${getProductSlug(selectedProductModal)}`}
                          onClick={() => setSelectedProductModal(null)}
                          className="flex-1 py-3 font-sans font-bold text-xs uppercase tracking-widest rounded-md transition-colors bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white text-center flex items-center justify-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span>COMING SOON • NOTIFY ME</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (isSoldOut) return;
                            addToCart(selectedProductModal, defaultSize, defaultPrice);
                            setSelectedProductModal(null);
                          }}
                          disabled={isSoldOut}
                          className={`flex-1 py-3 font-sans font-bold text-xs uppercase tracking-widest rounded-md transition-colors ${
                            isSoldOut
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                              : 'bg-[#d6a750] text-white hover:bg-[#c49232] cursor-pointer'
                          }`}
                        >
                          {isSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
                        </button>
                      )}

                      <Link
                        href={`/products/${getProductSlug(selectedProductModal)}`}
                        onClick={() => setSelectedProductModal(null)}
                        className="px-4 py-3 bg-slate-900 hover:bg-black text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md transition-colors text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
