'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../services/api';

export const DashboardOverview: React.FC<{ onNavigateTo?: (tab: string) => void }> = ({ onNavigateTo }) => {
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalReviews: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    weeklyTrends: [],
    stockAlerts: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStats();
      if (data) {
        setStats(data);
      }
    } catch (err: any) {
      console.warn('Failed to load stats:', err);
      setError(err?.message || 'Failed to load real-time analytics from Appwrite.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 font-sans animate-pulse">
        <div className="h-24 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs" />
          <div className="h-72 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-red-200 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg text-slate-900">Unable to Load Dashboard Data</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
        <button
          onClick={load}
          className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const weeklyTrends = stats.weeklyTrends && stats.weeklyTrends.length > 0
    ? stats.weeklyTrends
    : [
        { day: 'Mon', val: 10, amt: '₹0' },
        { day: 'Tue', val: 10, amt: '₹0' },
        { day: 'Wed', val: 10, amt: '₹0' },
        { day: 'Thu', val: 10, amt: '₹0' },
        { day: 'Fri', val: 10, amt: '₹0' },
        { day: 'Sat', val: 10, amt: '₹0' },
        { day: 'Sun', val: 10, amt: '₹0' }
      ];

  const stockAlerts = stats.stockAlerts || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e1e1e] text-white p-6 rounded-xl border border-white/10 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-[#d6a750] tracking-tight">Store Performance Hub</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time analytics and inventory status from Appwrite & Storefront.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all cursor-pointer inline-block"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider rounded border border-white/20 transition-all cursor-pointer inline-block"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Revenue</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold">₹</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{Number(stats.totalRevenue).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">
              Live from completed orders
            </span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Orders</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalOrders}</h3>
            <span className="inline-block mt-1 text-[11px] text-amber-600 font-medium">
              {stats.pendingOrders} pending dispatch
            </span>
          </div>
        </div>

        {/* Metric 3: Active Catalog */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Catalog</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3h6m-4 0v3m2-3v3M7 6h10a1 1 0 011 1v2a3 3 0 01-3 3H9a3 3 0 01-3-3V7a1 1 0 011-1zm-1 6h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalProducts} Fragrances</h3>
            <span className="inline-block mt-1 text-[11px] text-slate-500 font-medium">
              {stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock alerts` : 'All stock healthy'}
            </span>
          </div>
        </div>

        {/* Metric 4: Customer Reviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Customer Reviews</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">4.9 / 5.0</h3>
            <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">
              Based on {stats.totalReviews} verified reviews
            </span>
          </div>
        </div>
      </div>

      {/* Sales Velocity Chart & Dynamic Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900">Revenue & Order Trends</h4>
              <p className="text-xs text-slate-500">Weekly sales breakdown</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
              Past 7 Days
            </span>
          </div>

          {/* Dynamic Bar Chart */}
          <div className="h-44 flex items-end gap-3 sm:gap-6 pt-4 border-b border-slate-100 pb-2">
            {weeklyTrends.map((item: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-medium">
                  {item.amt}
                </span>
                <div
                  style={{ height: `${item.val}%` }}
                  className="w-full bg-[#d6a750] rounded-t-md group-hover:bg-[#b58b38] transition-all relative min-h-[4px]"
                />
                <span className="text-[11px] font-semibold text-slate-600">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Inventory Alert */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold text-slate-900">Pre-order & Stock Alert</h4>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                {stats.totalProducts} In Catalog
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Live inventory needing attention</p>
            
            <div className="space-y-3">
              {stockAlerts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-xs">
                  No active products found in catalog.
                </div>
              ) : (
                stockAlerts.map((item: any) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      item.isLow
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <h5 className={`font-bold text-xs ${item.isLow ? 'text-amber-900' : 'text-slate-900'}`}>
                        {item.name} ({item.volume})
                      </h5>
                      <p className={`text-[11px] ${item.isLow ? 'text-amber-700' : 'text-slate-600'}`}>
                        {item.stock} units in stock {item.isPreOrder ? '• Pre-order Active' : ''}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded ${
                        item.isLow
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.isLow ? 'LOW' : 'HEALTHY'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/products"
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded transition-colors cursor-pointer text-center block"
          >
            Manage Catalog Inventory
          </Link>
        </div>
      </div>
    </div>
  );
};
