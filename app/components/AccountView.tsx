'use client';

import React from 'react';
import type { Product } from '../types';
import { useAccountData, type TabKey } from '../hooks/useAccountData';

interface AccountViewProps {
  onClose?: () => void;
  onAddToCart?: (product: Product, size: string) => void;
  onShopNow?: () => void;
  onLogoutCallback?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onClose,
  onAddToCart,
  onShopNow,
  onLogoutCallback
}) => {
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
    { key: 'points', label: 'NEESH Points', icon: ICONS.points },
    { key: 'memberships', label: 'Memberships', icon: ICONS.memberships },
    { key: 'password', label: 'Change Password', icon: ICONS.password },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR PROFILE CARD                                     */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col shrink-0">
        {/* User Avatar Circle with Gold Ring */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
          <div className="relative w-22 h-22 rounded-full border-2 border-[#d09e44] p-1 flex items-center justify-center bg-white shadow-xs mb-3">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                loading="lazy"
                decoding="async"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-2xl font-serif text-slate-600">
                {firstName ? firstName[0].toUpperCase() : (displayName ? displayName[0].toUpperCase() : '?')}
              </div>
            )}
          </div>

          <h3 className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">
            {displayName}
          </h3>
          <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
            {email}
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 mt-3 text-slate-400 text-xs">
            <a href="#" className="hover:text-[#d09e44] transition-colors" title="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-[#d09e44] transition-colors" title="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation Tab Links */}
        <nav className="mt-4 space-y-1 flex-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#DFAB40] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-[#DFAB40] hover:text-white'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <span>{ICONS.logout}</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT MAIN CONTENT VIEWPORT                                   */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 p-6 sm:p-9 overflow-y-auto bg-slate-50/50">
        {/* ----------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD OVERVIEW                                   */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-slate-800 mb-4">
                MY ACCOUNT DASHBOARD
              </h2>

              {/* 4 Top Metric Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Orders */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Total Orders</p>
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-900">{userOrders.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>

                {/* 2. Total Spent */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Total Spent</p>
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-900">Rs.{totalSpent.toLocaleString('en-IN')}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                    ₹
                  </div>
                </div>

                {/* 3. Wishlist Items */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Wishlist Items</p>
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-900">{wishlist.length}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                    <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>

                {/* 4. Available Points */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Available Points</p>
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-900">50</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-[#d8a753] flex items-center justify-center">
                    <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* "Your Profile" Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide">
                  Your Profile
                </h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-semibold text-[#d09e44] hover:underline cursor-pointer"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#d09e44]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#d09e44]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#d09e44]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-[#d09e44] p-1 flex items-center justify-center bg-white shadow-2xs">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-serif text-slate-500">
                          {firstName ? firstName[0].toUpperCase() : (displayName ? displayName[0].toUpperCase() : '?')}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{displayName}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                        Silver Member
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Email Address</p>
                    <p className="text-xs font-semibold text-slate-800 break-all">{email}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Phone Number</p>
                    <p className="text-xs font-semibold text-slate-800">{phone || '—'}</p>
                  </div>
                </div>
              )}

              {saveSuccess && (
                <p className="text-xs text-emerald-600 font-semibold mt-3">Profile details updated successfully!</p>
              )}
            </div>

            {/* Recent Orders Quick Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Recent Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#d09e44] font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              {userOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userOrders.slice(0, 3).map((o, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold">Order #{o.orderNumber || o._id || o.id || idx + 1001}</span>
                      <span className="text-slate-500">Rs.{(Number(o.total) || 0).toLocaleString('en-IN')}</span>
                      <span className="text-emerald-600 font-bold">{o.orderStatus || o.status || 'Processing'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: MY ORDERS                                            */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Order History & Tracking</h3>
            {userOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center text-slate-400">
                <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
                  <svg className="w-full h-full fill-none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">No Orders Found</h4>
                <p className="text-xs text-slate-400 mb-4">You haven&apos;t placed any orders yet. Discover our luxury fragrance catalog.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (onShopNow) onShopNow();
                    else if (onClose) onClose();
                  }}
                  className="px-5 py-2.5 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.map((ord, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Order #{ord.orderNumber || ord._id || ord.id || `NSH-00${i + 1}`}</p>
                      <p className="text-[11px] text-slate-400">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Rs.{(Number(ord.total) || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full w-max">
                      {ord.orderStatus || ord.status || 'Processing'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 3: MY PROFILE                                           */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Account Details & Address</h3>
              <p className="text-xs text-slate-400">Manage your contact information and default shipping destination.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, building, apartment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai, Delhi, etc."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="110001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#d8a753] hover:bg-[#c69542] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Changes
              </button>

              {saveSuccess && (
                <p className="text-xs text-emerald-600 font-semibold mt-2">Profile updated successfully!</p>
              )}
            </form>
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
        {/* TAB 6: NEESH POINTS                                         */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'points' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">NEESH Reward Points</h3>
                <p className="text-xs text-slate-400">Earn points on every purchase and redeem for exclusive savings.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#d09e44]">50</span>
                <p className="text-[10px] uppercase font-bold text-slate-400">Available Points</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d8a753]/15 text-[#d8a753] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Welcome Bonus Active</h4>
                <p className="text-[11px] text-amber-700">You earned 50 complimentary points upon creating your NEESH account!</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Points History</h4>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">Account Registration Bonus</p>
                  <p className="text-[10px] text-slate-400">Welcome Reward</p>
                </div>
                <span className="text-emerald-600 font-bold">+50 pts</span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 7: MEMBERSHIPS                                          */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'memberships' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">VIP Club Membership</h3>
              <p className="text-xs text-slate-400">Unlock bespoke benefits as you discover more fragrances.</p>
            </div>

            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden shadow-lg border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-serif text-xl font-bold tracking-widest text-[#d6a750]">NEESH VIP</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tier: Silver Member</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#d6a750]">
                  <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-200 mb-1.5">{displayName}</p>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#d6a750] h-full w-[25%]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">450 points to Gold VIP Tier</p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 8: CHANGE PASSWORD                                      */}
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
      </main>
    </div>
  );
};
