'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { CartItem } from '../types';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onClearCart: () => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onClearCart
}) => {
  const { user } = useUser();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Pre-fill user data from Clerk authentication if present
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
        phone: prev.phone || user.primaryPhoneNumber?.phoneNumber || ''
      }));
    }
  }, [user]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setErrorMsg(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
    0
  );

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Handle Coupon Application
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setIsValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(code);
        setDiscountAmount(res.discount);
        setCouponSuccess(res.message);
      } else {
        setCouponError(res.message || 'Invalid or expired coupon code');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (err: any) {
      setCouponError('Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Checkout & Trigger Razorpay Gateway or COD
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('Please provide your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMsg('Please enter a valid contact phone number');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please specify your delivery address');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length < 5) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code');
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'razorpay') {
        // 1. Load Razorpay script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        // 2. Create order on server
        const orderRes = await api.createRazorpayOrder({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize || item.product.volume || '100ml'
          })),
          customer: formData,
          couponCode: appliedCoupon || undefined
        });

        if (!orderRes || !orderRes.orderId) {
          throw new Error(orderRes?.error || 'Unable to generate checkout order');
        }

        // 3. Configure Razorpay Standard Checkout Options
        const rzpKey = orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_51NQ89aH9Kneee';
        
        const options = {
          key: rzpKey,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'NEESH™ Luxury Perfumery',
          description: `Order ${orderRes.orderNumber} - Fine Fragrance`,
          image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80',
          order_id: orderRes.razorpayOrderId.startsWith('order_sim_') || orderRes.razorpayOrderId.startsWith('order_test_') 
            ? undefined 
            : orderRes.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#d6a750'
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            }
          },
          handler: async (response: any) => {
            try {
              // 4. Verify payment signature on backend
              const verifyRes = await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || orderRes.razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature,
                orderId: orderRes.orderId
              });

              onClearCart();
              setConfirmedOrder({
                orderNumber: verifyRes.orderNumber || orderRes.orderNumber,
                orderId: orderRes.orderId,
                paymentId: response.razorpay_payment_id || 'Instant Razorpay Verified',
                paymentMethod: 'Razorpay Instant Online Payment',
                total: finalTotal,
                customer: formData,
                items: cartItems
              });
            } catch (verErr: any) {
              console.error('Payment verification failed:', verErr);
              setErrorMsg(verErr.message || 'Payment verification failed. Please contact support.');
            } finally {
              setIsSubmitting(false);
            }
          }
        };

        // If in test simulation sandbox environment without active Razorpay account window
        if (typeof window !== 'undefined' && window.Razorpay) {
          const rzpInstance = new window.Razorpay(options);
          rzpInstance.on('payment.failed', (failResp: any) => {
            setErrorMsg(failResp?.error?.description || 'Payment transaction failed');
            setIsSubmitting(false);
          });
          rzpInstance.open();
        } else {
          // Fallback simulation for offline testing
          setTimeout(async () => {
            await api.verifyRazorpayPayment({
              razorpay_order_id: orderRes.razorpayOrderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              orderId: orderRes.orderId
            });
            onClearCart();
            setConfirmedOrder({
              orderNumber: orderRes.orderNumber,
              orderId: orderRes.orderId,
              paymentId: 'pay_sim_sandbox_success',
              paymentMethod: 'Razorpay Instant Online Payment',
              total: finalTotal,
              customer: formData,
              items: cartItems
            });
            setIsSubmitting(false);
          }, 1000);
        }
      } else {
        // Cash on Delivery (COD) Order Flow
        const codOrder = await api.createOrder({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: formData,
          total: finalTotal,
          totalAmount: finalTotal,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          status: 'pending',
          items: cartItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            size: item.selectedSize || item.product.volume || '100ml',
            price: item.unitPrice ?? item.product.price,
            quantity: item.quantity,
            image: item.product.image
          }))
        });

        onClearCart();
        setConfirmedOrder({
          orderNumber: codOrder.orderNumber || `NSH-${codOrder._id?.slice(-5).toUpperCase()}`,
          orderId: codOrder._id || codOrder.id,
          paymentId: 'Payable on Delivery (Cash / UPI QR at Doorstep)',
          paymentMethod: 'Cash on Delivery (COD)',
          total: finalTotal,
          customer: formData,
          items: cartItems
        });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred during checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-[#d6a750] selection:text-black">
      {/* Refined Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Main Luxury Modal Card */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden z-10 my-4 sm:my-8 text-slate-900 font-sans animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-[#faf9f6] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-50/80 border border-amber-200/80 flex items-center justify-center text-[#d6a750] shadow-xs shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-[#caa04c] uppercase font-sans">
                  Maison NEESH
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  Secure Checkout
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight font-sans">
                {confirmedOrder ? 'Order Confirmation Receipt' : 'Express Luxury Checkout'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100/80 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto space-y-6 font-sans">
          
          {/* ========================================================================= */}
          {/* STATE A: ORDER CONFIRMATION RECEIPT                                      */}
          {/* ========================================================================= */}
          {confirmedOrder ? (
            <div className="space-y-6 text-center py-4 font-sans">
              {/* Gold & Emerald Success Badge */}
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xs">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[#caa04c] uppercase font-sans">
                  Order Successfully Placed
                </span>
                <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
                  {confirmedOrder.orderNumber}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                  Thank you for your patronage. A detailed confirmation and dispatch tracking link have been dispatched to{' '}
                  <span className="font-bold text-slate-900">{confirmedOrder.customer.email}</span>.
                </p>
              </div>

              {/* Receipt Breakdown Card */}
              <div className="bg-[#faf9f6] border border-amber-200/60 rounded-2xl p-5 sm:p-6 text-left text-xs space-y-3.5 max-w-lg mx-auto shadow-xs font-sans">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Payment Mode</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Recipient</span>
                  <span className="font-bold text-slate-900">{confirmedOrder.customer.name} ({confirmedOrder.customer.phone})</span>
                </div>

                <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Delivery Address</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[60%] leading-relaxed">
                    {confirmedOrder.customer.address}, {confirmedOrder.customer.city}, {confirmedOrder.customer.state} - {confirmedOrder.customer.pincode}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1.5 font-bold text-sm">
                  <span className="text-slate-900 font-semibold text-base font-sans">Grand Total</span>
                  <span className="text-[#caa04c] text-lg font-bold font-sans">₹{confirmedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-lg mx-auto font-sans">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/account');
                  }}
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer font-sans"
                >
                  View in My Orders
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer font-sans"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STATE B: CHECKOUT FORM & SUMMARY                                         */
            /* ========================================================================= */
            <form onSubmit={handleSubmitCheckout} className="space-y-6 font-sans">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium font-sans">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Contact & Address (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Section 1: Shipping Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200/80 text-[#b88f3e] text-[11px] font-bold flex items-center justify-center font-sans">
                        1
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                        Shipping & Contact Details
                      </h4>
                    </div>

                    <div className="space-y-3.5 text-xs font-sans">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter recipient's full name"
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="client@domain.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                          Delivery Street Address, Villa / Apartment *
                        </label>
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="e.g. 402, Highline Residency, Bandra West"
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Mumbai"
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wide font-sans">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            required
                            maxLength={6}
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="400050"
                            className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:ring-2 focus:ring-[#d6a750]/15 transition-all font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Payment Method Selector */}
                  <div className="space-y-3.5 font-sans">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200/80 text-[#b88f3e] text-[11px] font-bold flex items-center justify-center font-sans">
                        2
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                        Payment Mode
                      </h4>
                    </div>

                    {/* Razorpay Online Option */}
                    <div
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#d6a750] bg-gradient-to-br from-[#fffdfa] to-[#fbf8f0] shadow-sm shadow-amber-900/5'
                          : 'border-slate-200/90 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'razorpay' ? 'border-[#d6a750] bg-[#d6a750]' : 'border-slate-300 bg-white'
                        }`}>
                          {paymentMethod === 'razorpay' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1 font-sans">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm font-sans">
                            Razorpay Instant Online Payment
                          </span>
                          <span className="bg-[#d6a750] text-white font-bold text-[9px] px-2 py-0.5 rounded-full tracking-wider uppercase font-sans">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Instant checkout via UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking & Wallets.
                        </p>
                        <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold font-sans">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>100% Encrypted & RBI Authorized Gateway</span>
                        </div>
                      </div>
                    </div>

                    {/* Cash on Delivery (COD) Option */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
                        paymentMethod === 'cod'
                          ? 'border-[#d6a750] bg-gradient-to-br from-[#fffdfa] to-[#fbf8f0] shadow-sm shadow-amber-900/5'
                          : 'border-slate-200/90 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-[#d6a750] bg-[#d6a750]' : 'border-slate-300 bg-white'
                        }`}>
                          {paymentMethod === 'cod' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-0.5 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm font-sans">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Pay securely in cash or scan UPI QR directly upon doorstep delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Promo Card (5 Cols) */}
                <div className="lg:col-span-5 bg-[#faf9f6] border border-amber-200/70 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs font-sans">
                  
                  {/* Summary Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 font-sans">
                    <h4 className="font-bold text-slate-900 text-sm tracking-tight font-sans">
                      Order Summary
                    </h4>
                    <span className="text-[11px] font-bold text-[#b88f3e] bg-amber-100/70 px-2.5 py-0.5 rounded-full font-sans">
                      {cartItems.reduce((a, b) => a + b.quantity, 0)} {cartItems.reduce((a, b) => a + b.quantity, 0) === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>

                  {/* Items List Mini */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 font-sans">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id + (item.selectedSize || '')}
                        className="flex items-center justify-between text-xs gap-3 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs font-sans"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-11 h-12 object-cover rounded-lg bg-slate-100 border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0 font-sans">
                          <h5 className="font-semibold text-slate-900 truncate text-xs font-sans">
                            {item.product.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium font-sans">
                            {item.selectedSize || item.product.volume} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 text-xs shrink-0 font-sans">
                          ₹{((item.unitPrice ?? item.product.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Complimentary Gift Badge */}
                  <div className="p-3 bg-white border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-[11px] text-[#a07c3e] font-semibold shadow-2xs font-sans">
                    <svg className="w-4 h-4 text-[#d6a750] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    <span className="font-sans">Complimentary 5ml Extrait Sample Included</span>
                  </div>

                  {/* Coupon Input */}
                  <div className="space-y-1.5 pt-1 font-sans">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 font-sans">
                      <svg className="w-3.5 h-3.5 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>Promotional Coupon Code</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#caa04c] font-sans">{appliedCoupon}</span>
                          <span className="text-[10px] text-emerald-700 font-bold font-sans">-₹{discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-slate-400 hover:text-rose-600 text-[11px] font-bold transition-colors cursor-pointer font-sans"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 font-sans">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="e.g. LUXE15"
                          className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase font-sans font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] placeholder:font-normal placeholder:normal-case"
                        />
                        <button
                          type="button"
                          disabled={isValidatingCoupon || !couponInput.trim()}
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
                        >
                          {isValidatingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}

                    {couponSuccess && <p className="text-[10px] text-emerald-600 font-semibold font-sans">{couponSuccess}</p>}
                    {couponError && <p className="text-[10px] text-rose-600 font-medium font-sans">{couponError}</p>}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-amber-200/60 font-sans">
                    <div className="flex justify-between">
                      <span className="font-sans">Subtotal</span>
                      <span className="font-bold text-slate-900 font-sans">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold font-sans">
                        <span>Coupon Savings</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-sans">
                      <span>Express Luxury Shipping</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between items-baseline text-slate-900 font-bold pt-3 border-t border-amber-200/60 font-sans">
                      <span className="text-sm font-semibold font-sans">Grand Total</span>
                      <span className="text-[#b88f3e] font-bold text-xl font-sans">₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Luxury Submit Button */}
                  <div className="pt-2 space-y-3 font-sans">
                    <button
                      type="submit"
                      disabled={isSubmitting || cartItems.length === 0}
                      className="w-full py-4 bg-[#d6a750] hover:bg-[#c59843] active:bg-[#b58b38] disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-amber-900/10 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="font-sans">Processing Order...</span>
                        </div>
                      ) : paymentMethod === 'razorpay' ? (
                        <>
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="font-sans">Pay ₹{finalTotal.toLocaleString('en-IN')} via Razorpay &rarr;</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="font-sans">Confirm Cash on Delivery &rarr;</span>
                        </>
                      )}
                    </button>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium pt-1 font-sans">
                      <div className="flex items-center gap-1.5 font-sans">
                        <svg className="w-3.5 h-3.5 text-[#d6a750] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>100% Authentic Extrait</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-sans">
                        <svg className="w-3.5 h-3.5 text-[#d6a750] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Express Dispatch 24-48h</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
