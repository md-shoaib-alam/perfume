'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, size?: string) => void;
  onRemoveItem: (productId: string, size?: string) => void;
  onClearCart?: () => void;
}

const FREE_GIFT_THRESHOLD = 5000;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const router = useRouter();
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
          
          {/* Header (Clean title & item badge - closed by Navbar cross directly above) */}
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
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">Your shopping bag is currently empty.</p>
                  <p className="text-xs text-slate-500">Discover our artisanal extrait de parfums & attars.</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-7 py-3 bg-[#caa04c] hover:bg-[#b88f3e] text-white text-xs uppercase font-bold tracking-widest rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemKey = `${item.product.id || item.product.name}__${item.selectedSize || 'default'}`;
                const itemId = item.product.id || item.product.name;

                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-3.5 bg-white border border-slate-200/80 rounded-xl relative group shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-24 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
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
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
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

                        <span className="font-bold text-slate-900 text-sm">
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

              <button
                onClick={() => {
                  onClose();
                  router.push('/checkout');
                }}
                className="w-full py-3.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-bold uppercase tracking-widest text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
