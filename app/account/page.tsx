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
import { useCart } from '../hooks/useCart';

export default function AccountPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'My Account – BakhoorBliss';
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/sign-in?redirect_url=/account');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <title>My Account – BakhoorBliss</title>
      <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#d6a13d] selection:text-black">
        {/* 1. Gold Announcement Offer Bar */}
      <AnnouncementBar />

      {/* 2. Top Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(!isMenuOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => {}}
        isMenuOpen={isMenuOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => {
          if (q.trim()) router.replace(`/collections/all?q=${encodeURIComponent(q.trim())}`);
        }}
      />

      {/* 3. Main Dashboard Body (Container) */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-md shadow-md border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[640px]">
          <AccountView
            onAddToCart={addToCart}
            onShopNow={() => router.push('/collections/all')}
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
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />

      {/* 5. Mobile Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartCount={totalCartCount}
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
    </>
  );
}
