'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useConfirm } from '../components/CustomConfirmModal';

interface CouponItem {
  id: string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  isActive: boolean;
}

export const CouponsManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newMinOrder, setNewMinOrder] = useState(0);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await api.getCoupons();
      setCoupons(data || []);
    } catch (err: any) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode) return;

    setSubmitting(true);
    try {
      await api.createCoupon({
        code: cleanCode,
        discountPercentage: newType === 'percentage' ? newDiscount : 0,
        discountAmount: newType === 'fixed' ? newDiscount : 0,
        minOrderAmount: newMinOrder,
        isActive: true
      });
      setNewCode('');
      setNewDiscount(10);
      setNewMinOrder(0);
      await loadCoupons();
      await showAlert({
        title: 'Coupon Created',
        message: `Promo code "${cleanCode}" has been published to Appwrite database.`,
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Creation Failed',
        message: err.message || 'Could not save coupon to Appwrite.',
        variant: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon: CouponItem) => {
    try {
      await api.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: any) {
      await showAlert({
        title: 'Update Error',
        message: err.message || 'Could not update coupon status.',
        variant: 'danger'
      });
    }
  };

  const handleDeleteCoupon = async (coupon: CouponItem) => {
    const confirmed = await showConfirm({
      title: 'Delete Promo Code',
      message: `Are you sure you want to permanently delete coupon "${coupon.code}" from Appwrite?`,
      confirmText: 'Delete Coupon',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deleteCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      await showAlert({
        title: 'Deleted',
        message: `Coupon "${coupon.code}" was removed.`,
        variant: 'info'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Delete Error',
        message: err.message || 'Could not delete coupon from Appwrite.',
        variant: 'danger'
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discount Coupons & Offers Engine</h2>
        <p className="text-xs text-slate-500 mt-1">Create and manage active discount coupons and promotional codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Coupon Form */}
        <form onSubmit={handleAddCoupon} className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Create Promo Code
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER25"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Value {newType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                value={newDiscount}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                min={1}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Minimum Order Value (₹)</label>
            <input
              type="number"
              value={newMinOrder}
              onChange={(e) => setNewMinOrder(Number(e.target.value))}
              min={0}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#caa04c] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving Promo Code...' : '+ Add Promo Code'}
          </button>
        </form>

        {/* Live Coupons Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-sm text-slate-900">
              Active Promo Codes ({coupons.length})
            </h3>
            <button
              onClick={loadCoupons}
              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <div className="inline-block w-6 h-6 border-2 border-[#caa04c] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading promo codes...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-14 text-center bg-slate-50 rounded-xl border border-slate-200/80 p-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 mx-auto flex items-center justify-center text-[#caa04c]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="font-bold text-slate-800 text-sm">No Coupons Found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">There are currently no active discount promo codes. Create your first code on the left.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Code</th>
                    <th className="pb-3 font-semibold">Discount</th>
                    <th className="pb-3 font-semibold">Min Order</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-slate-900">{coupon.code}</td>
                      <td className="py-3.5 text-[#caa04c] font-bold">
                        {coupon.discountPercentage && coupon.discountPercentage > 0
                          ? `${coupon.discountPercentage}% OFF`
                          : `₹${coupon.discountAmount} OFF`}
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {coupon.minOrderAmount && coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : 'No minimum'}
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider cursor-pointer ${
                            coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(coupon)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
