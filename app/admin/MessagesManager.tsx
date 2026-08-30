'use client';

import React, { useState, useEffect } from 'react';
import { useConfirm } from '../components/CustomConfirmModal';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export const MessagesManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err: any) {
      console.warn('Failed to fetch contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Customer Inquiry',
      message: `Are you sure you want to delete the message from "${name}"?`,
      confirmText: 'Delete Message',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (err: any) {
      showAlert({
        title: 'Delete Failed',
        message: err.message || 'Could not delete message.',
        variant: 'danger'
      });
    }
  };

  const filtered = messages.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span>Customer Contact Inquiries</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, review, and reply to messages submitted through the storefront Contact Us page.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[500px] flex flex-col justify-between">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search inquiries by customer name, email, phone, or message content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#caa04c] focus:bg-white transition-all"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold shrink-0">
            {filtered.length} Inquiries
          </span>
        </div>

        {/* Table / Messages List */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer & Contact</th>
                <th className="px-5 py-3.5">Message / Inquiry</th>
                <th className="px-4 py-3.5">Date Received</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading inquiries pipeline...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400">
                    {searchQuery ? 'No inquiries matching your search.' : 'No contact inquiries received yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-slate-900 text-xs">{msg.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                        <p>
                          <a href={`mailto:${msg.email}`} className="text-slate-600 hover:text-[#caa04c] underline">
                            {msg.email}
                          </a>
                        </p>
                        {msg.phone && (
                          <p className="font-mono text-slate-700 font-medium">
                            <a href={`tel:${msg.phone}`} className="hover:text-[#caa04c]">
                              {msg.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top max-w-md">
                      <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedMessage(msg)}
                        className="text-[10.5px] font-bold text-[#caa04c] hover:underline mt-1 block cursor-pointer"
                      >
                        Read Full Message →
                      </button>
                    </td>

                    <td className="px-4 py-4 align-top whitespace-nowrap text-[11px] text-slate-500 font-mono">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recent'}
                    </td>

                    <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Re: Inquiry from ${encodeURIComponent(msg.name)}`}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Reply Email
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id, msg.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-3.5 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {messages.length} customer messages</span>
        </div>
      </div>

      {/* Full Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Customer Inquiry</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{selectedMessage.name}</p>
                <p className="text-slate-600">Email: <a href={`mailto:${selectedMessage.email}`} className="text-[#caa04c] underline">{selectedMessage.email}</a></p>
                {selectedMessage.phone && <p className="text-slate-600">Phone: <span className="font-mono">{selectedMessage.phone}</span></p>}
                <p className="text-slate-400 font-mono text-[10.5px]">
                  Received: {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'Recent'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Message Content:</label>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedMessage.id, selectedMessage.name)}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Delete Message
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Inquiry from ${encodeURIComponent(selectedMessage.name)}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                >
                  Reply via Email
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
