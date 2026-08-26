'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { MasterPerfumersSection } from './components/MasterPerfumersSection';
import { ReelShortsSection } from './components/ReelShortsSection';
import { GoldTrustBanner } from './components/GoldTrustBanner';
import { CelebritySection } from './components/CelebritySection';
import { CollectionsCirclesSection } from './components/CollectionsCirclesSection';
import { GenderCampaignBanners } from './components/GenderCampaignBanners';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MenuDrawer } from './components/MenuDrawer';
import { AuthModal } from './auth/AuthModal';
import { AccountDashboard } from './components/AccountDashboard';
import { api } from './services/api';
import { client as appwriteClient } from '../lib/appwrite';
import type { Product, CartItem } from './types';

export default function Page() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'For Him' | 'For Her' | 'Gift Sets'>('For Him');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  // Load products & ping Appwrite
  useEffect(() => {
    // Ping Appwrite backend server to verify connection setup
    if (typeof (appwriteClient as any).ping === 'function') {
      (appwriteClient as any).ping()
        .then((res: any) => console.log('Appwrite connected successfully:', res))
        .catch((err: any) => console.warn('Appwrite ping status:', err));
    }

    const load = async () => {
      try {
        const data = await api.getProducts();
        if (data) {
          setProductsList(data);
        }
      } catch (err) {
        console.warn('Failed to fetch live products:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const handleFocus = () => load();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

      // 2. Filter by search query
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.subtitle?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, productsList, activeTab]);

  // Cart operations
  const handleAddToCart = (product: Product, size?: string, unitPrice?: number) => {
    const resolvedSize =
      size ||
      (product.sizeOptions && product.sizeOptions.length > 0
        ? product.sizeOptions[0].size
        : product.volume || '100ml');

    const resolvedPrice =
      unitPrice ??
      (product.sizeOptions && product.sizeOptions.length > 0
        ? product.sizeOptions.find((opt) => opt.size === resolvedSize)?.price ?? product.price
        : product.price);

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === resolvedSize
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === resolvedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        { product, quantity: 1, selectedSize: resolvedSize, unitPrice: resolvedPrice }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number, size?: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && (size === undefined || item.selectedSize === size)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string, size?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && (size === undefined || item.selectedSize === size)))
    );
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#d6a13d] selection:text-black relative">
      
      {/* 1. Gold Announcement Offer Bar */}
      <AnnouncementBar />

      {/* 2. Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(!isMenuOpen)}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthModalOpen(true);
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
        isMenuOpen={isMenuOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        </div>

        {/* Product Cards Container */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-sans text-xs">
            <div className="inline-block w-6 h-6 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading luxury collection from Appwrite...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/80 rounded-2xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 mx-auto flex items-center justify-center text-[#caa04c]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h4 className="font-serif font-bold text-slate-800 text-base">No Perfumes Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No products are currently available in this category. Add new perfumes from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-6 pb-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0">
            {filteredProducts.map((product) => (
              <div key={product.id} className="w-[72vw] max-w-[260px] flex-shrink-0 snap-center sm:w-auto sm:max-w-none">
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={(p) => setSelectedProductModal(p)}
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

      {/* 9. Footer */}
      <Footer />

      {/* 10. Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
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
        onAddToCart={handleAddToCart}
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
                      selectedProductModal.sizeOptions && selectedProductModal.sizeOptions.length > 0
                        ? selectedProductModal.sizeOptions[0].price
                        : selectedProductModal.price
                    ).toLocaleString('en-IN')}.00
                  </span>
                </div>

                <button
                  onClick={() => {
                    const defaultOption =
                      selectedProductModal.sizeOptions && selectedProductModal.sizeOptions.length > 0
                        ? selectedProductModal.sizeOptions[0]
                        : null;
                    const defaultSize = defaultOption?.size || selectedProductModal.volume || '100ml';
                    const defaultPrice = defaultOption?.price ?? selectedProductModal.price;

                    handleAddToCart(selectedProductModal, defaultSize, defaultPrice);
                    setSelectedProductModal(null);
                  }}
                  className="w-full py-3 bg-[#d6a750] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#c49232] transition-colors cursor-pointer"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
