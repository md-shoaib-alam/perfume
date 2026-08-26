'use client';
import React, { useState } from 'react';

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder: number;
  active: boolean;
}

export const CouponsManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'NEW20', discount: 20, type: 'percentage', minOrder: 0, active: true },
    { code: 'LUXE15', discount: 15, type: 'percentage', minOrder: 3500, active: true },
    { code: 'IMPERIAL500', discount: 500, type: 'fixed', minOrder: 5000, active: true }
  ]);

  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newMinOrder, setNewMinOrder] = useState(0);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCoupons([
      ...coupons,
      { code: newCode.toUpperCase(), discount: newDiscount, type: newType, minOrder: newMinOrder, active: true }
    ]);
    setNewCode('');
    setNewDiscount(10);
  };

  const toggleCoupon = (idx: number) => {
    const upd = [...coupons];
    upd[idx].active = !upd[idx].active;
    setCoupons(upd);
  };

  const deleteCoupon = (idx: number) => {
    setCoupons(coupons.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-serif font-bold text-slate-900">Discount Coupons & Offers Engine</h2>
        <p className="text-xs text-slate-500">Create promotional codes applied at checkout or shown in announcement tickers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Coupon Form */}
        <form onSubmit={handleAddCoupon} className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
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
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all mt-2"
          >
            + Add Promo Code
          </button>
        </form>

        {/* Coupons List: Mobile Cards + Desktop Table */}
        <div className="lg:col-span-8 space-y-3">
          {/* Mobile Cards View (< sm) */}
          <div className="sm:hidden space-y-3">
            {coupons.map((c, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{c.code}</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {c.type === 'percentage' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>Min: {c.minOrder > 0 ? `₹${c.minOrder}` : 'None'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCoupon(idx)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                    <button
                      onClick={() => deleteCoupon(idx)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Min Order</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-sm">
                        {c.code}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-700">
                        {c.type === 'percentage' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {c.minOrder > 0 ? `₹${c.minOrder}` : 'No minimum'}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleCoupon(idx)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {c.active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => deleteCoupon(idx)}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
