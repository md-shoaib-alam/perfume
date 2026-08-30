'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '../services/api';

export const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit fields for selected order modal
  const [modalStatus, setModalStatus] = useState('');
  const [modalTrackingNumber, setModalTrackingNumber] = useState('');
  const [modalTrackingUrl, setModalTrackingUrl] = useState('');
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  // Address edit state in modal
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [copiedAddress, setCopiedAddress] = useState(false);

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

  // Reset to page 1 whenever filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, pageSize]);

  useEffect(() => {
    if (selectedOrder) {
      setModalStatus(selectedOrder.orderStatus || selectedOrder.status || 'Processing');
      setModalTrackingNumber(selectedOrder.trackingNumber || '');
      setModalTrackingUrl(selectedOrder.trackingUrl || selectedOrder.trackingLink || '');
      setModalSuccessMsg('');
      setIsEditingAddress(false);
      setCopiedAddress(false);

      const cust = selectedOrder.customer || {};
      setEditCustomer({
        name: cust.name || selectedOrder.customerName || '',
        email: cust.email || selectedOrder.customerEmail || '',
        phone: cust.phone || selectedOrder.customerPhone || '',
        address: (cust.address || (typeof selectedOrder.shippingAddress === 'string' ? selectedOrder.shippingAddress : selectedOrder.shippingAddress?.address || '')).replace(/,\s*,/g, ',').trim(),
        city: cust.city || selectedOrder.shippingAddress?.city || '',
        state: cust.state || selectedOrder.shippingAddress?.state || '',
        pincode: cust.pincode || cust.postalCode || selectedOrder.shippingAddress?.pincode || '',
        country: cust.country || selectedOrder.shippingAddress?.country || 'India'
      });
    }
  }, [selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await api.updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const handleSaveOrderTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSavingModal(true);
    setModalSuccessMsg('');
    try {
      const orderId = selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber;
      await api.updateOrderStatus(
        orderId,
        modalStatus,
        modalTrackingNumber,
        modalTrackingUrl,
        isEditingAddress ? editCustomer : undefined
      );
      setModalSuccessMsg('Order updated successfully!');
      await loadOrders();
      // Update local selectedOrder state
      setSelectedOrder((prev: any) => prev ? {
        ...prev,
        status: modalStatus,
        orderStatus: modalStatus,
        trackingNumber: modalTrackingNumber,
        trackingUrl: modalTrackingUrl,
        customerName: editCustomer.name || prev.customerName,
        customerEmail: editCustomer.email || prev.customerEmail,
        customerPhone: editCustomer.phone || prev.customerPhone,
        customer: {
          ...prev.customer,
          ...editCustomer
        }
      } : null);
      setIsEditingAddress(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update order details');
    } finally {
      setIsSavingModal(false);
    }
  };

  const handleCopyFullAddress = () => {
    if (!selectedOrder) return;
    const c = selectedOrder.customer || editCustomer;
    const text = [
      c.name,
      c.phone ? `Phone: ${c.phone}` : '',
      c.email ? `Email: ${c.email}` : '',
      (c.address || '').replace(/,\s*,/g, ',').trim(),
      `${c.city || ''} ${c.state || ''} ${c.pincode || ''}`.trim(),
      c.country || 'India'
    ].filter(Boolean).join('\n');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter.toLowerCase() === 'all') return true;
      const s = (o.orderStatus || o.status || 'Pending').toLowerCase().replace(/_/g, ' ');
      const f = statusFilter.toLowerCase().replace(/_/g, ' ');
      if (f === 'pending') {
        return s === 'pending' || s === 'order placed';
      }
      if (f === 'in transit') {
        return s === 'in transit' || s === 'in_transit' || s === 'out for delivery';
      }
      return s === f;
    });
  }, [orders, statusFilter]);

  // Derived Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const startIndex = filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredOrders.length);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase().replace(/_/g, ' ');
    switch (s) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in transit':
      case 'out for delivery':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'order placed':
      case 'packed':
      case 'processing':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Orders Pipeline</h2>
          <p className="text-xs text-slate-500">Track shipments, dispatch packages, inspect customer addresses, and update live tracking URLs.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Pending', 'Processing', 'In Transit', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter.toLowerCase() === st.toLowerCase()
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
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            Loading orders...
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            No orders found.
          </div>
        ) : (
          paginatedOrders.map((ord) => {
            const cust = ord.customer || {};
            const rawAddr = (cust.address || ord.shippingAddress || '').replace(/,\s*,/g, ',').trim();
            const fullAddr = [
              rawAddr,
              cust.city,
              cust.state ? `${cust.state}${cust.pincode ? ` - ${cust.pincode}` : ''}` : '',
              cust.country
            ].filter(Boolean).join(', ').replace(/,\s*,/g, ',');

            return (
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

                {/* Customer & Address Preview */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{cust.name || ord.customerName || 'Customer'}</p>
                    <span className="text-[10px] font-mono text-slate-500">{cust.phone || ord.customerPhone}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {fullAddr || 'No address provided'}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <select
                    value={ord.orderStatus || ord.status || 'Processing'}
                    onChange={(e) => handleStatusChange(ord._id || ord.orderNumber, e.target.value)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(
                      ord.orderStatus || ord.status || 'Processing'
                    )}`}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View & Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Stable Card: Table + Permanently Pinned Bottom Pagination */}
      <div className="hidden md:flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-xs min-h-[640px] lg:min-h-[calc(100vh-260px)] overflow-hidden">
        {/* Table Area */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order ID & Date</th>
                <th className="px-5 py-3.5">Customer & Delivery Address</th>
                <th className="px-4 py-3.5">Items & Total</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading orders pipeline...</span>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    No customer orders found under this filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const cust = ord.customer || {};
                  const rawAddr = (cust.address || ord.shippingAddress || '').replace(/,\s*,/g, ',').trim();
                  const fullAddr = [
                    rawAddr,
                    cust.city,
                    cust.state ? `${cust.state}${cust.pincode ? ` - ${cust.pincode}` : ''}` : '',
                    cust.country
                  ].filter(Boolean).join(', ').replace(/,\s*,/g, ',');

                  return (
                    <tr key={ord._id || ord.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 align-top">
                        <span className="font-mono font-bold text-slate-900 block">{ord.orderNumber}</span>
                        <div className="text-[10.5px] text-slate-400 mt-0.5">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </div>
                        <span className="inline-block mt-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-semibold">
                          {ord.paymentMethod || 'Razorpay'}
                        </span>
                      </td>

                      {/* Customer & Full Address Breakdown Column */}
                      <td className="px-5 py-4 align-top max-w-sm">
                        <div className="font-bold text-slate-900 text-xs">
                          {cust.name || ord.customerName || 'Customer'}
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-500 mt-0.5">
                          {cust.phone || ord.customerPhone || 'No phone'} • {cust.email || ord.customerEmail || 'No email'}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed bg-slate-50/80 p-1.5 rounded-lg border border-slate-100" title={fullAddr}>
                          {fullAddr || 'No delivery address recorded'}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="font-bold text-slate-900 text-sm font-sans">
                          ₹{(ord.total || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <select
                          value={ord.orderStatus || ord.status || 'Processing'}
                          onChange={(e) => handleStatusChange(ord._id || ord.orderNumber, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(
                            ord.orderStatus || ord.status || 'Processing'
                          )}`}
                        >
                          <option value="Order Placed">1. Order Placed</option>
                          <option value="Packed">2. Packed</option>
                          <option value="Shipped">3. Shipped</option>
                          <option value="Out for Delivery">4. Out for Delivery</option>
                          <option value="Delivered">5. Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 align-top text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          View & Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Cleanly Attached */}
        <div className="border-t border-slate-200 p-3.5 bg-slate-50/60 flex items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          {/* Left: Range and Total Count */}
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-semibold text-slate-900">{startIndex}</strong>–<strong className="font-semibold text-slate-900">{endIndex}</strong> of <strong className="font-semibold text-slate-900">{filteredOrders.length}</strong> orders
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-200 bg-white rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              if (
                totalPages > 7 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              }

              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pagination Bar (< md) */}
      {filteredOrders.length > 0 && (
        <div className="md:hidden bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            <strong className="text-slate-900">{startIndex}</strong>–<strong className="text-slate-900">{endIndex}</strong> of <strong className="text-slate-900">{filteredOrders.length}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2 py-1 bg-slate-100 font-bold rounded-lg text-slate-900">{currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details, Full Address Inspector & Live Tracking Modal (Spacious & Clean, No Cut-Offs) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Order: {selectedOrder.orderNumber}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(modalStatus)}`}>
                    {modalStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Payment: <strong className="text-slate-800 uppercase">{selectedOrder.paymentMethod || 'Online'}</strong> • Status: <strong className="text-slate-800 uppercase">{selectedOrder.paymentStatus || 'Paid'}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-sm font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              
              {/* Top Grid: Courier Tracking + Customer Address */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* 1. Admin Live Tracking Configurator */}
                <form onSubmit={handleSaveOrderTracking} className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#916618] uppercase tracking-wider">
                        Live Courier Tracking
                      </span>
                      {modalSuccessMsg && (
                        <span className="text-[10.5px] text-emerald-700 font-semibold">{modalSuccessMsg}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Order Status (Customer Stepper Phase)
                      </label>
                      <select
                        value={modalStatus}
                        onChange={(e) => setModalStatus(e.target.value)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#d6a750]"
                      >
                        <option value="Order Placed">1. Order Placed</option>
                        <option value="Packed">2. Packed</option>
                        <option value="Shipped">3. Shipped (In Transit)</option>
                        <option value="Out for Delivery">4. Out for Delivery</option>
                        <option value="Delivered">5. Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        AWB / Tracking Number
                      </label>
                      <input
                        type="text"
                        value={modalTrackingNumber}
                        onChange={(e) => setModalTrackingNumber(e.target.value)}
                        placeholder="e.g. BLUEDART-987654321 or DELHIVERY-12345"
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Live Tracking URL (BlueDart, Shiprocket, etc.)
                      </label>
                      <input
                        type="url"
                        value={modalTrackingUrl}
                        onChange={(e) => setModalTrackingUrl(e.target.value)}
                        placeholder="https://shiprocket.co/tracking/..."
                        className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingModal}
                      className="w-full py-2 bg-[#caa04c] hover:bg-[#b88f3e] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingModal ? 'Saving...' : 'Update Status & Tracking'}
                    </button>
                  </div>
                </form>

                {/* 2. Customer Delivery Address Inspector & Editor */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Delivery Address</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyFullAddress}
                          className="text-[11px] font-semibold text-[#caa04c] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAddress ? '✓ Copied!' : 'Copy'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(!isEditingAddress)}
                          className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                        >
                          {isEditingAddress ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    {!isEditingAddress ? (
                      /* Read-Only View of Full Address */
                      <div className="space-y-2.5 text-xs text-slate-700">
                        {/* Name and Quick Contact Badges */}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {editCustomer.name || 'Anonymous Customer'}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {editCustomer.phone && (
                              <a
                                href={`tel:${editCustomer.phone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold hover:bg-emerald-100 transition-colors"
                                title="Call Customer"
                              >
                                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{editCustomer.phone}</span>
                              </a>
                            )}
                            {editCustomer.email && (
                              <a
                                href={`mailto:${editCustomer.email}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-medium hover:bg-slate-200 transition-colors"
                                title="Email Customer"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{editCustomer.email}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Formatted Address Box */}
                        <div className="font-medium text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed text-xs space-y-1">
                          <p className="text-slate-900 font-semibold">{editCustomer.address}</p>
                          <p className="text-slate-700">{editCustomer.city}, {editCustomer.state} - <span className="font-mono font-bold text-slate-900">{editCustomer.pincode}</span></p>
                          <p className="text-xs pt-1 border-t border-slate-100 text-slate-900 font-bold uppercase tracking-wider">
                            Country: <span className="text-[#916618] font-extrabold">{editCustomer.country || 'India'}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* In-Line Edit Address Form */
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Name</label>
                            <input
                              type="text"
                              value={editCustomer.name}
                              onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Phone</label>
                            <input
                              type="tel"
                              value={editCustomer.phone}
                              onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#d6a750]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Street Address</label>
                          <input
                            type="text"
                            value={editCustomer.address}
                            onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">City</label>
                            <input
                              type="text"
                              value={editCustomer.city}
                              onChange={(e) => setEditCustomer({ ...editCustomer, city: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">State</label>
                            <input
                              type="text"
                              value={editCustomer.state}
                              onChange={(e) => setEditCustomer({ ...editCustomer, state: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">PIN Code</label>
                            <input
                              type="text"
                              value={editCustomer.pincode}
                              onChange={(e) => setEditCustomer({ ...editCustomer, pincode: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#d6a750]"
                            />
                          </div>
                        </div>

                        <div className="pt-1 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveOrderTracking}
                            disabled={isSavingModal}
                            className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-black"
                          >
                            Save Address
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ordered Fragrances List with Image & Link to Product Page */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-900 block">Ordered Fragrances ({selectedOrder.items?.length || 0}):</span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((item: any, i: number) => {
                    const prodImg = item.product?.image || item.image || item.product?.images?.[0] || '';
                    const prodName = item.product?.name || item.name || 'Signature Fragrance';
                    const prodSize = item.selectedSize || item.size || item.product?.volume || '100ml';
                    const prodId = item.productId || item.product?.id || item.product?._id || item.id;

                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-xs border border-slate-200/80 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Fragrance Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                            {prodImg ? (
                              <img
                                src={prodImg}
                                alt={prodName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-amber-50 flex items-center justify-center text-[#caa04c]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Fragrance Details & View Button */}
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate text-xs">{prodName}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {prodSize} • Qty: <span className="font-bold text-slate-800">{item.quantity}</span>
                            </p>
                            {prodId && (
                              <Link
                                href={`/products/${prodId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#caa04c] hover:text-[#916618] hover:underline mt-0.5 cursor-pointer"
                              >
                                <span>View Fragrance Page</span>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <span className="font-bold text-slate-900 font-sans text-sm shrink-0">
                          ₹{((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Bottom Pinned Bar: Total and Close */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-bold text-slate-900 shrink-0 bg-white">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Payable:</span>
                <span className="text-xl text-[#caa04c] font-sans">₹{(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
