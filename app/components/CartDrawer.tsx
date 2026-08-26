'use client';
import React, { useEffect } from 'react';
import type { CartItem } from '../types';
import { useConfirm } from './CustomConfirmModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
}

const FREE_GIFT_THRESHOLD = 5000;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const { showAlert } = useConfirm();
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
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const giftProgress = Math.min(100, (subtotal / FREE_GIFT_THRESHOLD) * 100);
  const remainingForGift = FREE_GIFT_THRESHOLD - subtotal;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-300 ${isOpen ? 'visible' : 'invisible delay-300'}`}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className={`fixed inset-y-0 right-0 max-w-full flex pl-10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-slate-900">Your Shopping Bag</span>
              <span className="bg-[#d6a750] text-black font-bold text-xs px-2.5 py-0.5 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-black p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Complimentary Sample Gift Progress Bar */}
          <div className="bg-[#fffdf7] border-b border-amber-200/80 p-4">
            <div className="flex items-center justify-between text-xs text-[#a07c3e] mb-2 font-semibold">
              <span>🎁 Complimentary 5ml Extrait Sample</span>
              <span>{giftProgress >= 100 ? 'UNLOCKED!' : `Add ₹${remainingForGift.toLocaleString('en-IN')} more`}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-amber-300/40">
              <div
                className="bg-[#d6a750] h-full transition-all duration-500 rounded-full"
                style={{ width: `${giftProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-4">
                <div className="text-4xl">🛍️</div>
                <p className="text-sm font-medium text-slate-600">Your shopping bag is currently empty.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#d6a750] text-white text-xs uppercase font-bold rounded-md hover:bg-[#c59843] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id + (item.selectedSize || '')}
                  className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl relative group shadow-sm"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-lg border border-slate-100 bg-slate-100"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{item.selectedSize || item.product.volume}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2.5 py-1 text-slate-600 hover:text-[#d6a750]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2.5 py-1 text-slate-600 hover:text-[#d6a750]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 text-sm">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => showAlert({
                  title: 'Express Checkout',
                  message: 'Proceeding to Gokwik Luxury One-Click Checkout with Instant Discounts & Free Shipping.',
                  variant: 'info'
                })}
                className="w-full py-3.5 bg-[#d6a750] hover:bg-[#c59843] text-white font-bold uppercase tracking-widest text-xs rounded-md shadow-md transition-colors cursor-pointer"
              >
                PROCEED TO CHECKOUT &rarr;
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
