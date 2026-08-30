'use client';

import React from 'react';

interface DashboardTabProps {
  userOrders: any[];
  totalSpent: number;
  wishlist: any[];
  user?: any;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  setFirstName: (val: string) => void;
  setLastName: (val: string) => void;
  setPhone: (val: string) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  saveSuccess: boolean;
  onViewAllOrders: () => void;
  onSelectOrder: (order: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  userOrders,
  totalSpent,
  wishlist,
  user,
  firstName,
  lastName,
  displayName,
  email,
  phone,
  isEditingProfile,
  setIsEditingProfile,
  setFirstName,
  setLastName,
  setPhone,
  handleSaveProfile,
  saveSuccess,
  onViewAllOrders,
  onSelectOrder
}) => {
  const fallbackInitial = firstName
    ? firstName[0].toUpperCase()
    : displayName
    ? displayName[0].toUpperCase()
    : email
    ? email[0].toUpperCase()
    : 'U';

  const fallbackName = displayName || (email ? email.split('@')[0] : 'Valued Customer');

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-widest font-extrabold text-slate-800 mb-3 sm:mb-4">
          MY ACCOUNT DASHBOARD
        </h2>

        {/* 3 Top Metric Summary Cards (Orders, Total Spent, Wishlist) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {/* 1. Total Orders */}
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium mb-1 truncate">Total Orders</p>
              <h4 className="text-lg sm:text-2xl font-bold text-slate-900">{userOrders.length}</h4>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 text-[#caa04c] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          {/* 3. Wishlist Items (moved to row 1 on mobile) */}
          <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium mb-1 truncate">Wishlist Items</p>
              <h4 className="text-lg sm:text-2xl font-bold text-slate-900">{wishlist.length}</h4>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>

          {/* 2. Total Spent (full width on mobile, normal width on desktop) */}
          <div className="col-span-2 sm:col-span-1 bg-white p-2.5 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium mb-1 truncate">Total Spent</p>
              <h4 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Rs.{totalSpent.toLocaleString('en-IN')}</h4>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
              ₹
            </div>
          </div>
        </div>
      </div>

      {/* "Your Profile" Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 lg:p-8 shadow-2xs">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide">
            Your Profile
          </h3>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-semibold text-[#caa04c] hover:underline cursor-pointer"
          >
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d09e44]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#caa04c] hover:bg-[#b88f3e] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#caa04c] p-0.5 flex items-center justify-center bg-white shadow-2xs shrink-0">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={fallbackName}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-amber-50/50 flex items-center justify-center text-base sm:text-lg font-serif font-bold text-[#caa04c]">
                    {fallbackInitial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{fallbackName}</p>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 inline-block mt-0.5">
                  Verified Account
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mb-0.5">Email Address</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 break-all">{email || '—'}</p>
            </div>

            {/* Phone */}
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mb-0.5">Phone Number</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">{phone || '—'}</p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <p className="text-xs text-emerald-600 font-semibold mt-3">Profile details updated successfully!</p>
        )}
      </div>

      {/* Recent Orders Quick Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">Recent Orders</h3>
          <button
            onClick={onViewAllOrders}
            className="text-xs text-[#caa04c] font-semibold hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        {userOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-xs">No orders placed yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {userOrders.slice(0, 3).map((o, idx) => (
              <div
                key={idx}
                onClick={() => onSelectOrder(o)}
                className="p-3 sm:p-3.5 bg-slate-50 hover:bg-amber-50/40 border border-slate-200/70 hover:border-[#caa04c]/60 rounded-xl flex items-center justify-between gap-2.5 text-xs cursor-pointer transition-all group"
              >
                {/* Left: Box Icon + Order Number & Date */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#caa04c] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 group-hover:text-[#b88f3e] transition-colors truncate">
                      Order #{o.orderNumber || o._id?.slice(-5)?.toUpperCase() || o.id?.slice(-5)?.toUpperCase() || idx + 1001}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Right: Price + Status Badge + Chevron Icon */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-bold text-xs text-slate-800 whitespace-nowrap">
                    Rs.{(Number(o.total || o.totalAmount) || 0).toLocaleString('en-IN')}
                  </span>
                  <span className={`px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap border ${
                    (() => {
                      const s = (o.orderStatus || o.status || 'pending').toLowerCase().replace(/_/g, ' ');
                      if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
                      if (s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200/60';
                      if (s === 'shipped' || s === 'in transit' || s === 'out for delivery') return 'bg-blue-50 text-blue-700 border-blue-200/60';
                      if (s === 'packed') return 'bg-purple-50 text-purple-700 border-purple-200/60';
                      return 'bg-amber-50/80 text-[#b88f3e] border-amber-200/60';
                    })()
                  }`}>
                    {o.orderStatus || o.status || 'Processing'}
                  </span>
                  <span className="text-slate-400 group-hover:text-[#caa04c] transition-colors hidden sm:inline">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
