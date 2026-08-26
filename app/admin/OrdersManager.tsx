'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await api.updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return (o.orderStatus || 'Processing') === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Customer Orders Pipeline</h2>
          <p className="text-xs text-slate-500">Track shipments, dispatch packages, and view order details.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Orders Cards (< md) */}
      <div className="md:hidden space-y-3.5">
        {loading ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord._id || ord.orderNumber}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              {/* Order Header: ID + Date + Amount */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs">{ord.orderNumber}</span>
                  <p className="text-[10px] text-slate-400">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">₹{(ord.total || 0).toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-400">
                    {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{ord.customer?.name || 'Customer'}</p>
                  <p className="text-[11px] text-slate-400">{ord.customer?.city || 'India'}</p>
                </div>

                {/* Status Dropdown */}
                <select
                  value={ord.orderStatus || 'Processing'}
                  onChange={(e) => handleStatusChange(ord._id || ord.orderNumber, e.target.value)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(
                    ord.orderStatus || 'Processing'
                  )}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* View Details Action */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedOrder(ord)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                >
                  View Order Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Orders Table (hidden on mobile, visible on >= md) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items & Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id || ord.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                      <div className="text-[10px] text-slate-400">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Just now'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{ord.customer?.name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500">{ord.customer?.city || 'India'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">
                        ₹{(ord.total || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={ord.orderStatus || 'Processing'}
                        onChange={(e) => handleStatusChange(ord._id || ord.orderNumber, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(
                          ord.orderStatus || 'Processing'
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Order: {selectedOrder.orderNumber}</h3>
                <span className="text-xs text-slate-500">Payment: {selectedOrder.paymentStatus || 'Paid'}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedOrder.customer?.name}</div>
              <div className="text-slate-600">{selectedOrder.customer?.email}</div>
              <div className="text-slate-600">{selectedOrder.customer?.phone}</div>
              <div className="text-slate-600 pt-1 border-t border-slate-200 mt-2 flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{selectedOrder.customer?.address}, {selectedOrder.customer?.city} - {selectedOrder.customer?.postalCode}</span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedOrder.items?.map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {it.image && (
                      <img
                        src={it.image}
                        alt={it.name}
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 object-cover rounded bg-slate-100"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-500">{it.size} × {it.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 text-sm font-bold text-slate-900 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-[#c59b48] text-base">₹{(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
