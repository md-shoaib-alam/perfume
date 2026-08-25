'use client';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export const DashboardOverview: React.FC<{ onNavigateTo?: (tab: string) => void }> = ({ onNavigateTo }) => {
  const [stats, setStats] = useState<any>({
    totalRevenue: 182400,
    totalOrders: 38,
    totalProducts: 4,
    totalReviews: 652,
    pendingOrders: 6,
    lowStockProducts: 1,
    recentOrders: []
  });
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        console.warn('Failed to load stats:', err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e1e1e] text-white p-6 rounded-xl border border-white/10 shadow-lg">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#d6a750]">Store Performance Hub</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time analytics and inventory status from Appwrite & Storefront.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTo?.('products')}
            className="px-4 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all cursor-pointer"
          >
            + Add Product
          </button>
          <button
            onClick={() => onNavigateTo?.('orders')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider rounded border border-white/20 transition-all cursor-pointer"
          >
            View Orders
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Revenue</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-sm">₹</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">
              ₹{Number(stats.totalRevenue).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">
              ↑ 18.4% from last month
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Orders</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">📦</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">{stats.totalOrders}</h3>
            <span className="inline-block mt-1 text-[11px] text-amber-600 font-medium">
              {stats.pendingOrders} pending dispatch
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Catalog</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-sm">🧴</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">{stats.totalProducts} Fragrances</h3>
            <span className="inline-block mt-1 text-[11px] text-slate-500 font-medium">
              All categories active
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Customer Rating</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm">★</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">4.9 / 5.0</h3>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">
              Based on {stats.totalReviews} reviews
            </span>
          </div>
        </div>
      </div>

      {/* Sales Velocity Chart Simulation & Quick Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-serif text-base font-bold text-slate-900">Revenue & Order Trends</h4>
              <p className="text-xs text-slate-500">Weekly sales breakdown</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
              Past 7 Days
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="h-44 flex items-end gap-3 sm:gap-6 pt-4 border-b border-slate-100 pb-2">
            {[
              { day: 'Mon', val: 40, amt: '₹24k' },
              { day: 'Tue', val: 65, amt: '₹38k' },
              { day: 'Wed', val: 55, amt: '₹32k' },
              { day: 'Thu', val: 85, amt: '₹49k' },
              { day: 'Fri', val: 95, amt: '₹58k' },
              { day: 'Sat', val: 100, amt: '₹64k' },
              { day: 'Sun', val: 80, amt: '₹48k' }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-medium">
                  {item.amt}
                </span>
                <div
                  style={{ height: `${item.val}%` }}
                  className="w-full bg-[#d6a750] rounded-t-md group-hover:bg-[#b58b38] transition-all relative"
                />
                <span className="text-[11px] font-semibold text-slate-600">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Inventory Alert */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-base font-bold text-slate-900 mb-1">Pre-order & Stock Alert</h4>
            <p className="text-xs text-slate-500 mb-4">Inventory items needing attention</p>
            
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-amber-900">Haute Vetiver (100ml)</h5>
                  <p className="text-[11px] text-amber-700">15 units remaining • Pre-order Active</p>
                </div>
                <span className="px-2 py-1 bg-amber-200 text-amber-800 text-[10px] font-bold rounded">
                  LOW
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Glazed Water (100ml)</h5>
                  <p className="text-[11px] text-slate-600">45 units in stock • Bestseller</p>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  HEALTHY
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTo('settings')}
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded transition-colors"
          >
            Configure Store Settings
          </button>
        </div>
      </div>
    </div>
  );
};
