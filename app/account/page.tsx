'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { MenuDrawer } from '../components/MenuDrawer';
import { AuthModal } from '../auth/AuthModal';
import { AccountView } from '../components/AccountView';
import type { Product, CartItem } from '../types';

export default function AccountPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Cart & Menu state for layout
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

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
      const existing = prev.find((item) => item.product.id === product.id && item.selectedSize === resolvedSize);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === resolvedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: resolvedSize, unitPrice: resolvedPrice }];
    });
    setIsCartOpen(true);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center text-xs font-semibold text-slate-400">Loading your account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#d6a13d] selection:text-black">
      {/* 1. Gold Announcement Offer Bar */}
      <AnnouncementBar />

      {/* 2. Top Header / Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, cur) => acc + cur.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(!isMenuOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => {}}
        isMenuOpen={isMenuOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Main Dashboard Body (Container) */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-md shadow-md border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[640px]">
          <AccountView
            onAddToCart={handleAddToCart}
            onShopNow={() => router.push('/')}
            onLogoutCallback={() => router.push('/')}
          />
        </div>

        {/* Footer Attribution */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <span>Secured by</span>
          <span className="font-extrabold tracking-wider text-slate-800">AXENTRA</span>
        </div>
      </main>

      {/* 4. Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={(id, delta, size) => {
          setCartItems(prev =>
            prev
              .map(item =>
                item.product.id === id && (size === undefined || item.selectedSize === size)
                  ? { ...item, quantity: item.quantity + delta }
                  : item
              )
              .filter(Boolean) as CartItem[]
          );
        }}
        onRemoveItem={(id, size) => {
          setCartItems(prev =>
            prev.filter(item => !(item.product.id === id && (size === undefined || item.selectedSize === size)))
          );
        }}
      />

      {/* 5. Mobile Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => {}}
      />

      {/* 6. Auth Modal if needed */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
