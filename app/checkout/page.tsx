'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useCart } from '../hooks/useCart';
import { api } from '../services/api';
import {
  COUNTRY_STATE_CITY_MAP,
  COUNTRIES,
  normalizeLocationName
} from '../data/locationData';

const AuthModal = dynamic(() => import('../auth/AuthModal').then((m) => m.AuthModal), { ssr: false });

interface SavedAddressItem {
  id: string;
  label: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault?: boolean;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
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

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { cartItems, subtotal, clearCart, isLoaded } = useCart();
  const addressFormRef = useRef<HTMLDivElement | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Multi-Step State: 1 = Address & Delivery, 2 = Payment & Review
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saveThisAddress, setSaveThisAddress] = useState(true);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'India',
    state: 'Bihar',
    city: 'Jehanabad',
    pincode: '804422'
  });

  // Dynamic Location States & APIs
  const [apiStates, setApiStates] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [apiCities, setApiCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [pincodeSuccessMsg, setPincodeSuccessMsg] = useState<string | null>(null);

  // Payment & Coupon State
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Mobile Bottom Sheet Breakdown State
  const [showMobileBreakdown, setShowMobileBreakdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Available states for chosen country
  const localStates = useMemo(() => {
    return Object.keys(COUNTRY_STATE_CITY_MAP[formData.country] || {});
  }, [formData.country]);

  const availableStates = useMemo(() => {
    const combined = Array.from(new Set([...localStates, ...apiStates])).filter(Boolean);
    if (combined.length === 0 && formData.country === 'India') {
      return Object.keys(COUNTRY_STATE_CITY_MAP['India'] || {});
    }
    return combined.sort((a, b) => a.localeCompare(b));
  }, [localStates, apiStates, formData.country]);

  // Available cities for chosen state
  const localCities = useMemo(() => {
    return COUNTRY_STATE_CITY_MAP[formData.country]?.[formData.state] || [];
  }, [formData.country, formData.state]);

  const availableCities = useMemo(() => {
    const cityMap = new Map<string, string>();
    [...localCities, ...apiCities].forEach((raw) => {
      if (!raw) return;
      const clean = normalizeLocationName(raw);
      if (clean && !cityMap.has(clean.toLowerCase())) {
        cityMap.set(clean.toLowerCase(), clean);
      }
    });
    return Array.from(cityMap.values()).sort((a, b) => a.localeCompare(b));
  }, [localCities, apiCities]);

  // Fetch states from API when selecting a foreign country not in local map
  useEffect(() => {
    if (!formData.country) return;
    const local = Object.keys(COUNTRY_STATE_CITY_MAP[formData.country] || {});
    if (local.length > 0) {
      setApiStates([]);
      return;
    }
    let isCancelled = false;
    const fetchStates = async () => {
      setIsLoadingStates(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: formData.country })
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data?.data?.states)) {
            const names = data.data.states
              .map((s: any) => normalizeLocationName(typeof s === 'string' ? s : s.name))
              .filter(Boolean);
            const uniqueNames = Array.from(new Set(names)).sort((a: any, b: any) => a.localeCompare(b));
            setApiStates(uniqueNames as string[]);
            if (uniqueNames.length > 0 && !uniqueNames.includes(formData.state)) {
              setFormData((prev) => ({ ...prev, state: uniqueNames[0] as string }));
            }
          }
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        if (!isCancelled) setIsLoadingStates(false);
      }
    };
    fetchStates();
    return () => { isCancelled = true; };
  }, [formData.country]);

  // Fetch cities from API for current state & country
  useEffect(() => {
    if (!formData.country || !formData.state) return;
    let isCancelled = false;

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: formData.country, state: formData.state })
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data?.data) && data.data.length > 0) {
            setApiCities(data.data.map((c: string) => normalizeLocationName(c)).filter(Boolean));
          }
        }
      } catch (err) {
        // Fall back gracefully
      } finally {
        if (!isCancelled) setIsLoadingCities(false);
      }
    };

    fetchCities();
    return () => { isCancelled = true; };
  }, [formData.country, formData.state]);

  // Initial Load: Saved addresses from localStorage and Appwrite Profile
  useEffect(() => {
    const list: SavedAddressItem[] = [];

    // 1. Load multi-address list from localStorage
    try {
      const storedList = localStorage.getItem('neesh_saved_addresses_list');
      if (storedList) {
        const parsed = JSON.parse(storedList);
        if (Array.isArray(parsed)) {
          list.push(...parsed);
        }
      }
    } catch (e) {}

    // 2. Load cached default address from localStorage
    try {
      const single = localStorage.getItem('neesh_saved_address');
      if (single) {
        const parsed = JSON.parse(single);
        if (parsed && typeof parsed === 'object' && parsed.address) {
          const exists = list.some((item) => item.address === parsed.address && item.pincode === parsed.pincode);
          if (!exists) {
            list.unshift({
              id: 'default_local',
              label: 'Default Address',
              name: parsed.name || '',
              email: parsed.email || '',
              phone: parsed.phone || '',
              address: parsed.address || '',
              country: parsed.country || 'India',
              state: parsed.state || 'Bihar',
              city: parsed.city || 'Jehanabad',
              pincode: parsed.pincode || '804422',
              isDefault: true
            });
          }
        }
      }
    } catch (e) {}

    // 3. Load from Clerk / Appwrite Profile if authenticated
    if (user) {
      const clerkName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const clerkEmail = user.primaryEmailAddress?.emailAddress || '';
      const clerkPhone = user.primaryPhoneNumber?.phoneNumber || '';

      api.getUserProfile(user.id)
        .then((profile) => {
          if (profile && profile.address) {
            const profileAddr: SavedAddressItem = {
              id: 'profile_default',
              label: 'Profile Address',
              name: profile.name || clerkName,
              email: profile.email || clerkEmail,
              phone: profile.phone || clerkPhone,
              address: profile.address,
              country: profile.country || 'India',
              state: profile.state || 'Bihar',
              city: profile.city || 'Jehanabad',
              pincode: profile.pincode || '804422',
              isDefault: true
            };

            setSavedAddresses((prev) => {
              const filtered = prev.filter((p) => p.id !== 'profile_default');
              return [profileAddr, ...filtered];
            });

            // Auto-select profile address
            setFormData({
              name: profileAddr.name,
              email: profileAddr.email,
              phone: profileAddr.phone,
              address: profileAddr.address,
              country: profileAddr.country,
              state: profileAddr.state,
              city: profileAddr.city,
              pincode: profileAddr.pincode
            });
            setSelectedAddressId('profile_default');
          } else {
            setFormData((prev) => ({
              ...prev,
              name: prev.name || clerkName,
              email: prev.email || clerkEmail,
              phone: prev.phone || clerkPhone
            }));
          }
        })
        .catch(() => {});
    }

    if (list.length > 0) {
      setSavedAddresses(list);
      const defaultItem = list.find((a) => a.isDefault) || list[0];
      if (defaultItem && (!user || selectedAddressId === 'new')) {
        setSelectedAddressId(defaultItem.id);
        setFormData({
          name: defaultItem.name,
          email: defaultItem.email,
          phone: defaultItem.phone,
          address: defaultItem.address,
          country: defaultItem.country || 'India',
          state: defaultItem.state || 'Bihar',
          city: defaultItem.city || 'Jehanabad',
          pincode: defaultItem.pincode || '804422'
        });
      }
    }
  }, [user]);

  // Handle Select Saved Address
  const handleSelectSavedAddress = (item: SavedAddressItem) => {
    setSelectedAddressId(item.id);
    setEditingAddressId(null);
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      country: item.country || 'India',
      state: item.state || 'Bihar',
      city: item.city || 'Jehanabad',
      pincode: item.pincode || '804422'
    });
    setPincodeSuccessMsg(null);
  };

  // Handle Edit Saved Address
  const handleEditSavedAddress = (e: React.MouseEvent, item: SavedAddressItem) => {
    e.stopPropagation();
    setSelectedAddressId(item.id);
    setEditingAddressId(item.id);
    setAddressLabel(item.label || 'Home');
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      country: item.country || 'India',
      state: item.state || 'Bihar',
      city: item.city || 'Jehanabad',
      pincode: item.pincode || '804422'
    });
    setPincodeSuccessMsg(null);

    // Smooth scroll down to the form
    setTimeout(() => {
      addressFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Quick Deliver to Saved Address
  const handleQuickDeliverToAddress = (e: React.MouseEvent, item: SavedAddressItem) => {
    e.stopPropagation();
    handleSelectSavedAddress(item);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setEditingAddressId(null);
    const clerkName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const clerkEmail = user?.primaryEmailAddress?.emailAddress || '';
    const clerkPhone = user?.primaryPhoneNumber?.phoneNumber || '';

    setFormData({
      name: clerkName || '',
      email: clerkEmail || '',
      phone: clerkPhone || '',
      address: '',
      country: 'India',
      state: 'Bihar',
      city: 'Jehanabad',
      pincode: ''
    });
    setPincodeSuccessMsg(null);

    setTimeout(() => {
      addressFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Indian Postal PIN Code Auto-Lookup
  const lookupPostalPincode = useCallback(async (pin: string, country: string) => {
    const cleanPin = pin.trim();
    if (country === 'India' && /^\d{6}$/.test(cleanPin)) {
      setIsLookingUpPincode(true);
      setPincodeSuccessMsg(null);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const fetchedState = po.State;
            const fetchedDistrict = po.District || po.Block || po.Name;

            if (fetchedState) {
              setFormData((prev) => ({
                ...prev,
                state: fetchedState,
                city: fetchedDistrict || prev.city
              }));
              setPincodeSuccessMsg(`Resolved: ${fetchedDistrict ? `${fetchedDistrict}, ` : ''}${fetchedState}`);
            }
          }
        }
      } catch (e) {
        // Ignore network failure
      } finally {
        setIsLookingUpPincode(false);
      }
    }
  }, []);

  const handleCountryChange = (newCountry: string) => {
    const local = Object.keys(COUNTRY_STATE_CITY_MAP[newCountry] || {});
    const firstState = local.length > 0 ? local[0] : '';
    const newCities = COUNTRY_STATE_CITY_MAP[newCountry]?.[firstState] || [];

    setFormData((prev) => ({
      ...prev,
      country: newCountry,
      state: firstState,
      city: newCities[0] || ''
    }));
    setPincodeSuccessMsg(null);
  };

  const handleStateChange = (newState: string) => {
    const newCities = COUNTRY_STATE_CITY_MAP[formData.country]?.[newState] || [];
    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: newCities[0] || prev.city
    }));
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, pincode: val }));
    lookupPostalPincode(val, formData.country);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate Step 1 and proceed to Step 2 (Payment)
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name');
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
      setErrorMsg('Please enter your delivery street address');
      return;
    }
    if (!formData.country.trim()) {
      setErrorMsg('Please select your country');
      return;
    }
    if (!formData.state.trim()) {
      setErrorMsg('Please select or enter your state');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.length < 4) {
      setErrorMsg('Please enter a valid postal PIN code');
      return;
    }

    // Save address locally / update edited address
    try {
      localStorage.setItem('neesh_saved_address', JSON.stringify(formData));

      if (editingAddressId) {
        // Update existing address
        const updatedList = savedAddresses.map((addr) => {
          if (addr.id === editingAddressId) {
            return {
              ...addr,
              label: addressLabel || addr.label || 'Home',
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              country: formData.country,
              state: formData.state,
              city: formData.city,
              pincode: formData.pincode
            };
          }
          return addr;
        });
        setSavedAddresses(updatedList);
        localStorage.setItem('neesh_saved_addresses_list', JSON.stringify(updatedList));
      } else if (saveThisAddress || selectedAddressId === 'new') {
        const newEntry: SavedAddressItem = {
          id: `addr_${Date.now()}`,
          label: addressLabel || 'Home',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,
          isDefault: setAsDefault
        };

        const existingList = savedAddresses.filter((a) => a.address !== formData.address);
        const updatedList = [newEntry, ...existingList];
        setSavedAddresses(updatedList);
        localStorage.setItem('neesh_saved_addresses_list', JSON.stringify(updatedList));
      }
    } catch (e) {}

    // Advance to Step 2 smoothly
    setCurrentStep(2);
    setEditingAddressId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Coupon Handlers
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

  // Auto re-validate / adjust applied coupon when subtotal changes
  useEffect(() => {
    if (!appliedCoupon) return;
    if (subtotal <= 0) {
      handleRemoveCoupon();
      return;
    }
    api.validateCoupon(appliedCoupon, subtotal).then((res) => {
      if (res.valid) {
        setDiscountAmount(res.discount);
      } else {
        // Minimum order threshold no longer met
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(res.message || 'Coupon requirement no longer met with updated bag total');
        setCouponSuccess(null);
      }
    }).catch(() => {});
  }, [subtotal, appliedCoupon]);

  // Submit Final Checkout (Step 2)
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'razorpay') {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        const orderRes = await api.createRazorpayOrder({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize || item.product.volume || '100ml',
            unitPrice: item.unitPrice ?? item.product.price
          })),
          customer: formData,
          couponCode: appliedCoupon || undefined
        });

        if (!orderRes || !orderRes.orderId) {
          throw new Error(orderRes?.error || 'Unable to generate checkout order');
        }

        const rzpKey = orderRes.keyId;
        if (!rzpKey) {
          throw new Error('Razorpay is not configured. Please contact support.');
        }

        const options = {
          key: rzpKey,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'Bakhoor Bliss',
          description: `Order ${orderRes.orderNumber}`,
          image: '/assets/bakhoorblissnav.avif',
          order_id: orderRes.razorpayOrderId.startsWith('order_sim_') || orderRes.razorpayOrderId.startsWith('order_test_')
            ? undefined
            : orderRes.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#caa04c'
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            }
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || orderRes.razorpayOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderRes.orderId
              });

              clearCart();
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

        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.on('payment.failed', (failResp: any) => {
            setErrorMsg(failResp?.error?.description || 'Payment transaction failed');
            setIsSubmitting(false);
          });
          rzpInstance.open();
        } else {
          // Sandbox Fallback
          setTimeout(async () => {
            await api.verifyRazorpayPayment({
              razorpay_order_id: orderRes.razorpayOrderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              orderId: orderRes.orderId
            });
            clearCart();
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
        // Cash on Delivery Flow
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

        clearCart();
        setConfirmedOrder({
          orderNumber: codOrder.orderNumber || `NSH-${(codOrder._id || codOrder.id || '').slice(-5).toUpperCase()}`,
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

  // 1. Order Confirmation Receipt View
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans py-10 px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 shadow-xs">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <span className="text-[11px] font-semibold tracking-widest text-[#caa04c] uppercase font-sans">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Thank you for your order, {confirmedOrder.customer?.name?.split(' ')[0] || 'Valued Client'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
                We have received your order and are preparing your fragrances for dispatch.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800">
              <span>Order Number:</span>
              <span className="text-[#916618]">{confirmedOrder.orderNumber}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Delivery Address
                </span>
                <p className="text-xs font-bold text-slate-900">{confirmedOrder.customer?.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{confirmedOrder.customer?.address}</p>
                <p className="text-xs text-slate-600">
                  {confirmedOrder.customer?.city}, {confirmedOrder.customer?.state} - {confirmedOrder.customer?.pincode}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{confirmedOrder.customer?.country || 'India'}</p>
                <p className="text-xs text-slate-600 mt-1">Phone: {confirmedOrder.customer?.phone}</p>
                <p className="text-xs text-slate-600">Email: {confirmedOrder.customer?.email}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Details
                </span>
                <p className="text-xs font-bold text-slate-900">{confirmedOrder.paymentMethod}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{confirmedOrder.paymentId}</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Amount Paid
                  </span>
                  <p className="text-lg font-bold text-slate-900 font-sans">
                    ₹{confirmedOrder.total?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Purchased Fragrances
              </span>
              <div className="space-y-3">
                {confirmedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      {item.product?.image && (
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.product?.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {item.selectedSize || item.product?.volume || '100ml'} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-sans">
                      ₹{((item.unitPrice ?? item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/collections/all"
                className="w-full sm:flex-1 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs text-center"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account?tab=orders"
                className="w-full sm:flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Track & View My Orders</span>
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Bag State
  if (isLoaded && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans flex flex-col justify-between">
        <header className="bg-white border-b border-slate-200 py-3.5 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img 
                src="/assets/bakhoorblissnav.avif" 
                alt="Bakhoor Bliss" 
                className="h-8 sm:h-10 w-auto object-contain" 
              />
            </Link>
            <span className="text-xs text-slate-500 font-medium">Express Checkout</span>
          </div>
        </header>

        <div className="max-w-md mx-auto text-center py-20 px-4 space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center text-[#caa04c]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Fragrance Bag is Empty</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add extraits de parfum or attar creations from our boutique to proceed with checkout.
            </p>
          </div>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>Explore Fragrance Catalog</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200">
          © {new Date().getFullYear()} BakhoorBliss Perfumery. All rights reserved.
        </footer>
      </div>
    );
  }

  // 3. Authentication Required State
  if (isLoaded && isUserLoaded && !user && !confirmedOrder) {
    const totalBagItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
      <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans flex flex-col justify-between">
        <header className="bg-white border-b border-slate-200 py-3.5 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img 
                src="/assets/bakhoorblissnav.avif" 
                alt="Bakhoor Bliss" 
                className="h-8 sm:h-10 w-auto object-contain" 
              />
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto py-12 px-4 sm:px-6 w-full">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/80 mx-auto flex items-center justify-center text-[#caa04c] shadow-xs">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-[#caa04c] uppercase font-sans">
                Authentication Required
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sign In to Proceed to Checkout
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Please sign in or create an account to securely save your delivery address, track orders in real-time, and complete payment.
              </p>
            </div>

            {/* Benefits box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#caa04c] shrink-0" />
                <span>Live dispatch tracking & doorstep delivery SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#caa04c] shrink-0" />
                <span>Saved address book for faster 1-click checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#caa04c] shrink-0" />
                <span>Complimentary luxury perfume samples on qualifying orders</span>
              </div>
            </div>

            {/* Bag summary */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Shopping Bag ({totalBagItems} {totalBagItems === 1 ? 'item' : 'items'}):</span>
              <span className="text-base font-bold text-slate-900 font-sans">Rs.{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign In / Create Account →</span>
              </button>

              <Link
                href="/collections/all"
                className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center"
              >
                Return to Boutique
              </Link>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200">
          © {new Date().getFullYear()} BakhoorBliss Perfumery. All rights reserved.
        </footer>

        {/* Dynamic Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  // 4. Multi-Step Checkout Page View
  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans pb-32 sm:pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs py-3 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back to Store</span>
            <span className="sm:hidden">Store</span>
          </Link>

          {/* Golden Center Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <img 
              src="/assets/bakhoorblissnav.avif" 
              alt="Bakhoor Bliss" 
              className="h-8 sm:h-10 w-auto object-contain transition-opacity group-hover:opacity-90" 
            />
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
            <span className="sm:hidden">SSL</span>
          </div>
        </div>
      </header>

      {/* Main Multi-Step Checkout Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        
        {/* Step Progression Breadcrumb - Clean Sans Font */}
        <div className="max-w-md mx-auto mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 text-xs cursor-pointer group"
            >
              <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-emerald-600 text-white'
              }`}>
                {currentStep > 1 ? (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : '1'}
              </span>
              <span className={`text-xs sm:text-sm font-medium ${currentStep === 1 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                1. Delivery Address
              </span>
            </button>

            {/* Connecting Bar */}
            <div className={`flex-1 mx-3 sm:mx-4 h-[2px] rounded-full transition-all ${
              currentStep === 2 ? 'bg-[#caa04c]' : 'bg-slate-200'
            }`} />

            {/* Step 2 Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                2
              </span>
              <span className={`text-xs sm:text-sm font-medium ${currentStep === 2 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                2. Payment & Review
              </span>
            </div>
          </div>
        </div>

        {/* Clean, Simple Header Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {currentStep === 1 ? 'Delivery Address' : 'Payment & Review'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentStep === 1 ? 'Select a saved address or enter your shipping destination details.' : 'Select your payment method and review your order.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: DELIVERY ADDRESS SELECTION & FORM                                  */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* 1. Saved Addresses Selection Card */}
            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                    <span>Saved Delivery Addresses</span>
                  </h2>
                  <button
                    type="button"
                    onClick={handleSelectNewAddress}
                    className={`text-xs font-semibold transition-colors cursor-pointer ${
                      selectedAddressId === 'new'
                        ? 'text-[#caa04c] underline'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    + Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#caa04c] bg-amber-50/40 shadow-xs ring-1 ring-[#caa04c]/30'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* Top Tag & Edit Button */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-semibold uppercase tracking-wider rounded font-mono">
                                {addr.label || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-amber-100 text-[#916618] text-[9.5px] font-semibold uppercase rounded">
                                  Default
                                </span>
                              )}
                            </div>

                            {/* Edit Address Button */}
                            <button
                              type="button"
                              onClick={(e) => handleEditSavedAddress(e, addr)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-0.5 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                              title="Edit address details"
                            >
                              <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                          </div>

                          <p className="text-xs font-semibold text-slate-900">{addr.name}</p>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{addr.address}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">{addr.phone}</p>
                        </div>

                        {/* Deliver to this address quick action */}
                        {isSelected && (
                          <div className="pt-3 mt-3 border-t border-amber-200/60">
                            <button
                              type="button"
                              onClick={(e) => handleQuickDeliverToAddress(e, addr)}
                              className="w-full py-1.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white text-[11px] font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <span>Deliver to this Address →</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Address Input / Edit Form */}
            <div ref={addressFormRef}>
              <form onSubmit={handleProceedToPayment} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                    <span>
                      {editingAddressId
                        ? `Edit Address (${addressLabel})`
                        : selectedAddressId === 'new'
                        ? 'Enter Delivery Details'
                        : 'Confirm Recipient & Address'}
                    </span>
                  </h2>
                  {editingAddressId ? (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Editing Mode
                    </span>
                  ) : selectedAddressId !== 'new' ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Saved Address Active
                    </span>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Shoaib Alam"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="client@domain.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Contact Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Delivery Street Address, Villa / Apartment <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 402, Highline Residency, Bandra West"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Arranged in exact requested order: 1. Country -> 2. State -> 3. City -> 4. PIN Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Country Selector */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Country <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. State / Province Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-slate-700">
                          State / Province <span className="text-rose-500">*</span>
                        </label>
                        {isLoadingStates && (
                          <span className="text-[10px] text-slate-400">Loading states...</span>
                        )}
                      </div>
                      {availableStates.length > 0 ? (
                        <select
                          name="state"
                          value={formData.state}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="">Select State</option>
                          {availableStates.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Bihar or Maharashtra"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                        />
                      )}
                    </div>

                    {/* 3. City / District */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-slate-700">
                          City / District <span className="text-rose-500">*</span>
                        </label>
                        {isLoadingCities && (
                          <span className="text-[10px] text-slate-400">Loading cities...</span>
                        )}
                      </div>
                      {availableCities.length > 0 ? (
                        <div className="relative">
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            list="simple-step-city-datalist"
                            required
                            placeholder="e.g. Jehanabad or Mumbai"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                          />
                          <datalist id="simple-step-city-datalist">
                            {availableCities.map((ct) => (
                              <option key={ct} value={ct} />
                            ))}
                          </datalist>
                        </div>
                      ) : (
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Jehanabad or Mumbai"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                        />
                      )}
                    </div>

                    {/* 4. Postal PIN Code */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-slate-700">
                          Postal PIN Code <span className="text-rose-500">*</span>
                        </label>
                        {isLookingUpPincode && (
                          <span className="text-[10px] text-[#caa04c] flex items-center gap-1 font-medium">
                            <div className="w-2.5 h-2.5 border-2 border-[#caa04c] border-t-transparent rounded-full animate-spin" />
                            Resolving...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        required
                        placeholder="e.g. 804422 or 400050"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-mono font-semibold"
                      />
                      {pincodeSuccessMsg && (
                        <p className="text-[10.5px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{pincodeSuccessMsg}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clean Address Label & Save Options Layout */}
                  {(selectedAddressId === 'new' || editingAddressId) && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveThisAddress}
                          onChange={(e) => setSaveThisAddress(e.target.checked)}
                          className="rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {editingAddressId ? 'Save address changes' : 'Save address to My Addresses'}
                        </span>
                      </label>

                      {saveThisAddress && (
                        <div className="pl-6 flex items-center gap-2.5 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-medium">Address Label:</span>
                          <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
                            {['Home', 'Work', 'Other'].map((lbl) => (
                              <button
                                key={lbl}
                                type="button"
                                onClick={() => setAddressLabel(lbl)}
                                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                                  addressLabel === lbl
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {saveThisAddress && !editingAddressId && (
                        <label className="flex items-center gap-2 pl-6 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={setAsDefault}
                            onChange={(e) => setSetAsDefault(e.target.checked)}
                            className="rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] w-4 h-4 cursor-pointer"
                          />
                          <span className="text-[11px] text-slate-600 font-normal">Set as primary default address for future checkouts</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 1 CTA Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{editingAddressId ? 'SAVE & CONTINUE TO PAYMENT →' : 'CONTINUE TO PAYMENT →'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PAYMENT METHOD & FINAL ORDER REVIEW                               */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-in fade-in duration-200">
            {/* Left Column: Delivery Address Review & Payment Modes */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Selected Shipping Summary Box */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <h2 className="font-semibold text-slate-900 text-sm">Delivery Details</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-[#caa04c] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Change Address</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <div className="text-xs space-y-1 text-slate-700">
                  <p className="font-semibold text-slate-900">{formData.name}</p>
                  <p className="text-slate-600">{formData.address}</p>
                  <p className="font-medium text-slate-800">
                    {formData.city}, {formData.state} - {formData.pincode}
                  </p>
                  <p className="text-slate-500">{formData.country}</p>
                  <p className="pt-1 text-slate-500 font-mono">
                    Phone: {formData.phone} • Email: {formData.email}
                  </p>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <form id="payment-step-form" onSubmit={handleSubmitCheckout}>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                      <span>Select Payment Mode</span>
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* Razorpay Option */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#d6a750] bg-amber-50/40 shadow-xs ring-1 ring-[#d6a750]/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 text-[#d6a750] focus:ring-[#d6a750]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900">Razorpay Instant Online Payment</span>
                          <span className="px-2 py-0.5 bg-[#caa04c]/15 text-[#916618] text-[9.5px] font-semibold font-mono rounded">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Instant checkout via UPI (Google Pay, PhonePe, Paytm), Cards & NetBanking.
                        </p>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 font-medium mt-2">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>100% Encrypted & RBI Authorized Gateway</span>
                        </div>
                      </div>
                    </label>

                    {/* Cash on Delivery Option */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        paymentMethod === 'cod'
                          ? 'border-[#d6a750] bg-amber-50/40 shadow-xs ring-1 ring-[#d6a750]/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 text-[#d6a750] focus:ring-[#d6a750]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900">Cash on Delivery (COD)</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9.5px] font-semibold font-mono rounded">
                            DOORSTEP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Pay securely in cash or scan UPI QR directly upon doorstep delivery.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary & Pay CTA */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">Order Summary</h3>
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {cartItems.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product.image && (
                          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{item.product.name}</h4>
                          <p className="text-[10.5px] text-slate-500">
                            {item.selectedSize || item.product.volume || '100ml'} • Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 shrink-0 font-sans">
                        ₹{((item.unitPrice ?? item.product.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Complimentary 5ml sample notice */}
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-[#916618]">
                  <svg className="w-4 h-4 text-[#caa04c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="font-medium text-[11px]">Complimentary 5ml Extrait Sample Included</span>
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Promotional Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. LUXE15"
                      disabled={Boolean(appliedCoupon)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold font-mono uppercase text-slate-900 focus:outline-none focus:border-[#d6a750]"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isValidatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>

                  {couponSuccess && (
                    <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{couponSuccess}</span>
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 font-sans">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Express Luxury Shipping</span>
                    <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">FREE</span>
                  </div>

                  <div className="flex justify-between text-slate-900 font-bold text-base pt-3 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="font-sans text-lg text-slate-900">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Final Submit CTA Button */}
                <button
                  type="submit"
                  form="payment-step-form"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <svg className="w-4 h-4 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>PAY ₹{finalTotal.toLocaleString('en-IN')} VIA RAZORPAY →</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>PLACE CASH ON DELIVERY ORDER →</span>
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium pt-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>100% Authentic</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Express Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM BAR WITH EXPANDABLE PRICE BREAKDOWN                 */}
      {/* ========================================================================= */}
      <aside aria-label="Checkout action bar" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        {/* Left Side: Clickable Grand Total & Toggle Chevron */}
        <div
          onClick={() => setShowMobileBreakdown(!showMobileBreakdown)}
          className="flex flex-col min-w-0 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium">
            <span>Grand Total</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#caa04c] bg-amber-50/90 px-2 py-0.5 rounded-full border border-amber-200/80">
              <span>{showMobileBreakdown ? 'Hide' : 'Details'}</span>
              <svg
                className={`w-2.5 h-2.5 text-[#caa04c] transition-transform duration-200 ${showMobileBreakdown ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900 font-sans">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
            {discountAmount > 0 && (
              <span className="text-[10.5px] font-semibold text-emerald-700 font-mono">
                (-₹{discountAmount})
              </span>
            )}
          </div>
        </div>

        {/* Right Side Action Button */}
        {currentStep === 1 ? (
          <button
            type="button"
            onClick={(e) => handleProceedToPayment(e)}
            className="px-5 py-2.5 bg-slate-900 active:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>CONTINUE →</span>
          </button>
        ) : (
          <button
            type="submit"
            form="payment-step-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-slate-900 active:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : paymentMethod === 'razorpay' ? (
              <span>PAY NOW →</span>
            ) : (
              <span>PLACE ORDER →</span>
            )}
          </button>
        )}
      </aside>

      {/* Mobile Price Breakdown Modal Drawer */}
      {showMobileBreakdown && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setShowMobileBreakdown(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Order Price Breakdown</h3>
              <button
                type="button"
                onClick={() => setShowMobileBreakdown(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Items Mini List */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 truncate max-w-[200px]">
                    {item.product.name} ({item.selectedSize || '100ml'}) × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900 font-mono shrink-0">
                    ₹{((item.unitPrice ?? item.product.price) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation Lines */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900 font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">FREE</span>
              </div>

              <div className="flex justify-between text-slate-900 font-bold text-sm pt-3 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="font-sans text-base text-slate-900">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileBreakdown(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
