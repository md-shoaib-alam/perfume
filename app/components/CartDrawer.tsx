'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import type { CartItem } from '../types';
import { getProductSlug } from '../utils/slug';
import { isProductSoldOut } from '@/lib/pricing';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, size?: string) => void;
  onRemoveItem: (productId: string, size?: string) => void;
  onClearCart?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

const FREE_GIFT_THRESHOLD = 5000;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenAuth
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  // Prevent background page scrolling when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen to window scroll to position cart drawer below Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
    0
  );

  const giftProgress = Math.min(100, (subtotal / FREE_GIFT_THRESHOLD) * 100);
  const remainingForGift = FREE_GIFT_THRESHOLD - subtotal;

  const topPositionClass = isScrolled ? 'top-[56px] sm:top-[64px]' : 'top-[88px] sm:top-[96px]';

  const hasSoldOutItems = cartItems.some((item) => isProductSoldOut(item.product, item.selectedSize));

  const handleCheckoutClick = () => {
    if (hasSoldOutItems) return;
    if (!user) {
      onClose();
      if (onOpenAuth) {
        onOpenAuth('signin');
      } else {
        router.push('/auth/sign-in?redirect_url=/checkout');
      }
      return;
    }
    onClose();
    router.push('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-40 overflow-hidden font-sans transition-all duration-300 pointer-events-none ${isOpen ? 'visible' : 'invisible delay-300'}`}>
      {/* Dimmed Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed ${topPositionClass} inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto cursor-pointer ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* Right Sliding Drawer Panel */}
      <div className={`fixed ${topPositionClass} bottom-0 right-0 max-w-full flex transition-transform duration-300 ease-in-out pointer-events-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-[82vw] sm:w-[380px] md:w-[420px] max-w-full bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Your Shopping Bag
              </h2>
              <span className="bg-[#caa04c] text-white font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Complimentary Sample Gift Progress Tier */}
          <div className="bg-[#faf7f2] border-b border-amber-200/60 px-4 sm:px-6 py-3 shrink-0">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#9a7329] mb-1.5 font-medium tracking-wide gap-2">
              <span className="flex items-center gap-1.5 truncate">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#caa04c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className="truncate">Complimentary Sample</span>
              </span>
              <span className="font-bold shrink-0">{giftProgress >= 100 ? 'UNLOCKED' : `Add Rs.${remainingForGift.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#caa04c] h-full transition-all duration-500 rounded-full"
                style={{ width: `${giftProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 bg-slate-50/40">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/50 text-[#caa04c] flex items-center justify-center shadow-xs">
                  <svg className="w-8 h-8 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Your bag is empty</p>
                </div>
                <Link
                  href="/collections/all"
                  onClick={onClose}
                  className="px-7 py-3 bg-[#caa04c] hover:bg-[#b88f3e] text-white text-xs uppercase font-bold tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm text-center inline-block"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemId = String(item.product.id || (item.product as any)?.$id || item.product.name || 'item');
                const itemKey = `${itemId}__${item.selectedSize || 'default'}`;
                const productSlug = getProductSlug(item.product);
                const isItemSoldOut = isProductSoldOut(item.product, item.selectedSize);

                return (
                  <div
                    key={itemKey}
                    className={`flex gap-4 p-3.5 bg-white rounded-xl relative group shadow-xs transition-colors border ${
                      isItemSoldOut ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <Link
                      href={`/products/${productSlug}`}
                      onClick={onClose}
                      className="w-20 h-24 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0 overflow-hidden block relative"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover ${isItemSoldOut ? 'opacity-60 grayscale-50' : ''}`}
                      />
                      {isItemSoldOut && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-extrabold text-white uppercase tracking-wider bg-rose-600 px-1.5 py-0.5 rounded">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/products/${productSlug}`}
                            onClick={onClose}
                            className="font-serif text-sm font-bold text-slate-900 truncate hover:text-[#caa04c] transition-colors block"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => onRemoveItem(itemId, item.selectedSize)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-slate-400 hover:text-rose-600 p-1 -mr-1 transition-colors cursor-pointer shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{item.selectedSize || item.product.volume || '100ml'}</p>

                        {isItemSoldOut && (
                          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md mt-1.5">
                            <svg className="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Out of Stock — Please remove</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <div className={`flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden ${isItemSoldOut ? 'opacity-40 pointer-events-none' : ''}`}>
                          <button
                            onClick={() => onUpdateQuantity(itemId, -1, item.selectedSize)}
                            className="px-2.5 py-1 text-slate-600 hover:text-[#caa04c] hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-slate-900 min-w-[24px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(itemId, 1, item.selectedSize)}
                            className="px-2.5 py-1 text-slate-600 hover:text-[#caa04c] hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className={`font-bold text-sm ${isItemSoldOut ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          Rs.{((item.unitPrice ?? item.product.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-200 bg-white space-y-3.5 shrink-0">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">Rs.{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">FREE</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-100">
                  <span className="font-serif">Total</span>
                  <span>Rs.{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {hasSoldOutItems && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold leading-tight">Your bag has out-of-stock items. Remove them to proceed.</span>
                </div>
              )}

              {!user && !hasSoldOutItems && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#916618] bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200/60">
                  <svg className="w-3.5 h-3.5 text-[#caa04c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Sign in required to checkout and pay</span>
                </div>
              )}

              <button
                onClick={handleCheckoutClick}
                disabled={hasSoldOutItems}
                className={`w-full py-3.5 font-bold uppercase tracking-widest text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 ${
                  hasSoldOutItems
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-[#caa04c] hover:bg-[#b88f3e] text-white cursor-pointer'
                }`}
              >
                <span>
                  {hasSoldOutItems
                    ? 'REMOVE SOLD OUT ITEMS TO CHECKOUT'
                    : user
                    ? 'PROCEED TO CHECKOUT'
                    : 'SIGN IN TO CHECKOUT'}
                </span>
                {!hasSoldOutItems && (
                  <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
