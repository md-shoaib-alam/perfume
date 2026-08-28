'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { useAccountData, type TabKey } from '../hooks/useAccountData';

interface AccountViewProps {
  onClose?: () => void;
  onAddToCart?: (product: Product, size: string) => void;
  onShopNow?: () => void;
  onLogoutCallback?: () => void;
}

import {
  COUNTRY_STATE_CITY_MAP,
  COUNTRIES,
  RELATIONSHIPS,
  normalizeLocationName
} from '../data/locationData';
import { AccountSidebar } from './account/AccountSidebar';
import { DashboardTab } from './account/DashboardTab';
import { OrdersTab } from './account/OrdersTab';
import { OrderTrackingModal } from './account/OrderTrackingModal';

export const AccountView: React.FC<AccountViewProps> = ({
  onClose,
  onAddToCart,
  onShopNow,
  onLogoutCallback
}) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Structured Address States matching screenshot
  const [contactName, setContactName] = useState('');
  const [saveAddressAs, setSaveAddressAs] = useState('Home');
  const [relationship, setRelationship] = useState('Self');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('Himachal Pradesh');

  // Dynamic States & Cities resolution with live API integration
  const [apiStates, setApiStates] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [apiCities, setApiCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);

  const localStates = Object.keys(COUNTRY_STATE_CITY_MAP[country] || {});
  const localCities = COUNTRY_STATE_CITY_MAP[country]?.[stateName] || [];

  // Available states for selected country
  const availableStates = useMemo(() => {
    const combined = Array.from(new Set([...localStates, ...apiStates])).filter(Boolean);
    if (combined.length === 0 && country === 'India') {
      return Object.keys(COUNTRY_STATE_CITY_MAP['India']);
    }
    return combined.sort((a, b) => a.localeCompare(b));
  }, [localStates, apiStates, country]);

  // Fetch states from API when selecting a country not in local map
  useEffect(() => {
    if (!country) return;
    const local = Object.keys(COUNTRY_STATE_CITY_MAP[country] || {});
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
          body: JSON.stringify({ country })
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data?.data?.states)) {
            const names = data.data.states
              .map((s: any) => normalizeLocationName(typeof s === 'string' ? s : s.name))
              .filter(Boolean);
            const uniqueNames = Array.from(new Set(names)).sort((a: any, b: any) => a.localeCompare(b));
            setApiStates(uniqueNames as string[]);
            if (uniqueNames.length > 0) {
              setStateName(uniqueNames[0] as string);
            }
          }
        }
      } catch (e) {
        // Fallback
      } finally {
        if (!isCancelled) setIsLoadingStates(false);
      }
    };
    fetchStates();
    return () => { isCancelled = true; };
  }, [country]);

  // Combine local offline cities with live API cities (normalized, deduplicated and sorted)
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

  // Fetch full city list for selected state & country from public API
  useEffect(() => {
    if (!country || !stateName) return;
    let isCancelled = false;

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country, state: stateName })
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data?.data) && data.data.length > 0) {
            setApiCities(data.data);
          }
        }
      } catch (err) {
        // Fall back gracefully to offline list
      } finally {
        if (!isCancelled) setIsLoadingCities(false);
      }
    };

    fetchCities();
    return () => { isCancelled = true; };
  }, [country, stateName]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setApiStates([]);
    setApiCities([]);
    const local = Object.keys(COUNTRY_STATE_CITY_MAP[newCountry] || {});
    if (local.length > 0) {
      const firstState = local[0];
      setStateName(firstState);
      const newCities = COUNTRY_STATE_CITY_MAP[newCountry]?.[firstState] || [];
      setCity(newCities[0] || '');
    } else {
      setStateName('');
      setCity('');
    }
  };

  const handleStateChange = (newState: string) => {
    setStateName(newState);
    setApiCities([]);
    const newCities = COUNTRY_STATE_CITY_MAP[country]?.[newState] || [];
    setCity(newCities[0] || '');
  };

  // Auto lookup city & state when user enters a 6-digit Indian PIN code
  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    const cleanPin = val.trim();
    if (country === 'India' && /^\d{6}$/.test(cleanPin)) {
      setIsLookingUpPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const fetchedState = po.State;
            const fetchedDistrict = po.District || po.Block || po.Name;

            if (fetchedState && availableStates.includes(fetchedState)) {
              setStateName(fetchedState);
            }
            if (fetchedDistrict) {
              setCity(fetchedDistrict);
              if (!apiCities.includes(fetchedDistrict)) {
                setApiCities(prev => [fetchedDistrict, ...prev]);
              }
            }
          }
        }
      } catch (e) {
        // Ignore network failure
      } finally {
        setIsLookingUpPincode(false);
      }
    }
  };

  const {
    user,
    activeTab,
    setActiveTab,
    isEditingProfile,
    setIsEditingProfile,
    saveSuccess,
    pwdMsg,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    address,
    setAddress,
    city,
    setCity,
    pincode,
    setPincode,
    wishlist,
    recentProducts,
    userOrders,
    email,
    displayName,
    handleSaveProfile,
    handleSendPasswordReset,
    handleLogout
  } = useAccountData(onLogoutCallback || onClose);

  const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Safely normalize items from an order
  const getOrderItems = (ord: any) => {
    if (!ord?.items) return [];
    let items = ord.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch { items = []; }
    }
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      name: item.product?.name || item.name || item.title || 'Extrait De Parfum',
      image: item.product?.image || item.image || item.imageUrl || '',
      size: item.selectedSize || item.size || item.volume || item.product?.volume || '100ml',
      quantity: Number(item.quantity) || 1,
      price: Number(item.unitPrice || item.price || item.product?.price || 0)
    }));
  };

  // Safely parse shipping address
  const getShippingAddress = (ord: any) => {
    if (!ord) return null;
    let addr = ord.shippingAddress;
    if (typeof addr === 'string') {
      try { addr = JSON.parse(addr); } catch { addr = { address: addr }; }
    }
    return addr || {};
  };

  // Calculate tracking step index (0: Placed, 1: Formulating, 2: Dispatched, 3: Delivered)
  const getTrackingStep = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped' || s === 'in_transit' || s === 'out_for_delivery') return 2;
    if (s === 'processing' || s === 'confirmed' || s === 'packed') return 1;
    return 0; // pending / placed
  };

  // SVGs for clean professional look (NO EMOJIS)
  const ICONS = {
    dashboard: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    orders: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    profile: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    wishlist: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    recently_viewed: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    points: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    memberships: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    password: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    logout: (
      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    )
  };

  const MENU_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { key: 'orders', label: 'My Orders', icon: ICONS.orders },
    { key: 'profile', label: 'My Profile', icon: ICONS.profile },
    { key: 'wishlist', label: 'My Wishlist', icon: ICONS.wishlist },
    { key: 'recently_viewed', label: 'Recently Viewed', icon: ICONS.recently_viewed },
    { key: 'password', label: 'Change Password', icon: ICONS.password },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR PROFILE CARD (Desktop Only: hidden md:flex)      */}
      {/* ------------------------------------------------------------- */}
      <AccountSidebar
        user={user}
        displayName={displayName}
        firstName={firstName}
        email={email}
        activeTab={activeTab}
        menuItems={MENU_ITEMS}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        logoutIcon={ICONS.logout}
      />

      {/* ------------------------------------------------------------- */}
      {/* RIGHT MAIN CONTENT VIEWPORT                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE HORIZONTAL PILLS NAVIGATION (Mobile Only: md:hidden) */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              const isWishlist = item.key === 'wishlist';
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#caa04c] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {isWishlist && wishlist.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white text-[#caa04c]' : 'bg-[#caa04c] text-white'
                    }`}>
                      +{wishlist.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Subtle gold active indicator bar */}
          <div className="w-full bg-slate-100 h-0.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#caa04c] h-full w-1/3 rounded-full transition-all" />
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-9 overflow-y-auto bg-slate-50/50">
          {/* ----------------------------------------------------------- */}
          {/* TAB 1: DASHBOARD OVERVIEW                                   */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              userOrders={userOrders}
              totalSpent={totalSpent}
              wishlist={wishlist}
              user={user}
              firstName={firstName}
              lastName={lastName}
              displayName={displayName}
              email={email}
              phone={phone}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setPhone={setPhone}
              handleSaveProfile={handleSaveProfile}
              saveSuccess={saveSuccess}
              onViewAllOrders={() => setActiveTab('orders')}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: MY ORDERS                                            */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={userOrders}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onShopNow={onShopNow}
            onClose={onClose}
          />
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 3: MY PROFILE                                           */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="space-y-6 w-full">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">
              My Profile
            </h2>

            {/* 1. Mobile-Only Top Card: Avatar, Email, Stats & Social Follow */}
            <div className="block md:hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs text-center flex-col items-center">
              {/* Large Avatar with Gold Ring & '+' Badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#d09e44] p-1 flex items-center justify-center bg-white shadow-xs mb-3">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={displayName}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-2xl sm:text-3xl font-serif text-slate-600 font-bold">
                    {firstName ? firstName[0].toUpperCase() : (displayName ? displayName[0].toUpperCase() : (email ? email[0].toUpperCase() : 'U'))}
                  </div>
                )}
                {/* '+' Badge */}
                <div
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#d09e44] text-white flex items-center justify-center shadow-md border-2 border-white"
                  title="Profile Photo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              {/* Email */}
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{email}</p>

              {/* 2-Column Stats (Orders & Wishlist) */}
              <div className="grid grid-cols-2 gap-8 my-6 text-center w-full max-w-xs border-y border-slate-100 py-4">
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-900">{userOrders.length}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Orders</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-900">{wishlist.length}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Wishlist</p>
                </div>
              </div>

              {/* Social Action Gold Buttons */}
              <div className="space-y-3 w-full max-w-md">
                <a
                  href="https://www.instagram.com/neeshperfumes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Follow us on Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/neeshperfumes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#caa04c] hover:bg-[#b88f3e] active:bg-[#a67d2e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/>
                  </svg>
                  <span>Like us on Facebook</span>
                </a>
              </div>
            </div>

            {/* 2. Contact Information Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Contact Information</h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-0.5">Email Address</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 break-all">{email}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-0.5">Phone Number</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">{phone || '--'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-0.5">Location</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {city ? `${city}${pincode ? `, ${pincode}` : ''}` : (address || '--')}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Personal Information Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Personal Information</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={email}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Changes
                </button>

                {saveSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">Profile details updated successfully!</p>
                )}
              </form>
            </div>

            {/* 4. Shipping Information Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isEditingAddress ? 'Add Address' : 'Shipping Information'}
                </h3>
                {address && !isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressLine1(address);
                      if (!contactName) setContactName(displayName);
                      setIsEditingAddress(true);
                    }}
                    className="text-xs font-bold text-[#d09e44] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Saved Address Preview when not editing */}
              {address && !isEditingAddress && (
                <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{contactName || displayName}</p>
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-200/60 text-[#b88f3e] text-[10px] font-bold rounded-md uppercase">
                        {saveAddressAs || 'Home'}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{address}</p>
                    <p className="text-slate-600 font-medium">
                      {city ? `${city}, ` : ''}{stateName ? `${stateName} ` : ''}{pincode ? `- ${pincode}` : ''}{country ? `, ${country}` : ''}
                    </p>
                    <p className="text-slate-500 pt-1">Phone: {phone || '--'}</p>
                  </div>
                </div>
              )}

              {/* Add Address Form matching screenshot */}
              {isEditingAddress ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fullAddr = addressLine2 ? `${addressLine1}, ${addressLine2}` : addressLine1;
                    setAddress(fullAddr);
                    handleSaveProfile(e);
                    setIsEditingAddress(false);
                  }}
                  className="space-y-4 pt-1"
                >
                  {/* Row 1: Contact Name * & Save Address As * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Save Address As <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={saveAddressAs}
                        onChange={(e) => setSaveAddressAs(e.target.value)}
                        placeholder="e.g. Home, Office, Residence"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Relationship * & Address Line 1 * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Relationship <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors text-slate-800"
                      >
                        <option value="" disabled>Select Relationship</option>
                        {RELATIONSHIPS.map((rel) => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House / Flat No., Building, Street Name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: Address Line 2 * & Country * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Address Line 2 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Apartment, Suite, Unit, Landmark"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors text-slate-800"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: State * & City * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>State <span className="text-red-500">*</span></span>
                        {isLoadingStates && (
                          <span className="text-[10px] text-slate-400 font-normal">Loading states...</span>
                        )}
                      </label>
                      <select
                        required
                        value={stateName}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors text-slate-800"
                      >
                        <option value="" disabled>
                          {isLoadingStates ? 'Loading states...' : 'Select State'}
                        </option>
                        {availableStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>City <span className="text-red-500">*</span></span>
                        {isLoadingCities && (
                          <span className="text-[10px] text-slate-400 font-normal">Loading cities...</span>
                        )}
                      </label>
                      <select
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors text-slate-800"
                      >
                        <option value="" disabled>
                          {isLoadingCities ? 'Loading cities...' : 'Select City'}
                        </option>
                        {availableCities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Zip Code * & Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>Zip Code <span className="text-red-500">*</span></span>
                        {isLookingUpPincode && (
                          <span className="text-[10px] text-amber-600 font-normal">Detecting city & state...</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="6-digit PIN / Zip Code"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44] focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddressLine1(address || '');
                    if (!contactName) setContactName(displayName);
                    setIsEditingAddress(true);
                  }}
                  className="w-full py-3 px-4 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>+ Add Address</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 4: MY WISHLIST                                          */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Saved Wishlist ({wishlist.length})</h3>
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center text-slate-400">
                <div className="w-10 h-10 mx-auto mb-3 text-slate-300">
                  <svg className="w-full h-full fill-none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 mb-4">Your wishlist is currently empty. Tap the heart icon on any perfume to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((prod) => (
                  <div key={prod.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-36 object-cover rounded-xl mb-3"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-900">{prod.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">Rs.{prod.price.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => onAddToCart && onAddToCart(prod, '100ml')}
                      className="w-full py-2 bg-[#d8a753] text-white font-bold text-xs rounded-lg hover:bg-[#c69542] cursor-pointer"
                    >
                      Add to Bag
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 5: RECENTLY VIEWED                                      */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'recently_viewed' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Recently Viewed Fragrances</h3>
            {recentProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center text-slate-400">
                <div className="w-10 h-10 mx-auto mb-3 text-slate-300">
                  <svg className="w-full h-full fill-none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500">Products you explore will automatically appear here for quick access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProducts.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-36 object-cover rounded-xl mb-3"
                    />
                    <h4 className="font-serif font-bold text-sm text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500">Rs.{p.price.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 6: CHANGE PASSWORD                                      */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Password</h3>
              <p className="text-xs text-slate-400">Update your credentials or trigger an instant password reset link.</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                Click the button below to send a secure password reset link to your verified email: <br />
                <strong className="text-slate-900">{email}</strong>
              </p>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                className="px-5 py-2.5 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Send Password Reset Link
              </button>

              {pwdMsg && (
                <p className="text-xs text-emerald-600 font-semibold mt-3">{pwdMsg}</p>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* ORDER DETAILS & LIVE SHIPMENT TRACKING MODAL               */}
        {/* ----------------------------------------------------------- */}
        {selectedOrder && (
          <OrderTrackingModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            displayName={displayName}
            defaultAddress={address}
            defaultCity={city}
            defaultPincode={pincode}
            defaultPhone={phone}
          />
        )}
      </main>
    </div>
  </div>
  );
};
