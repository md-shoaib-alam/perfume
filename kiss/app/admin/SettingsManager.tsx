'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState({
    announcementText: 'FLAT 15% OFF | USE CODE: LUXE15',
    announcementCode: 'LUXE15',
    freeGiftThreshold: 3500,
    contactEmail: 'concierge@neesh.com',
    contactPhone: '+91 (800) 555-NEESH'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await api.getSettings();
      if (data) setSettings((prev) => ({ ...prev, ...data }));
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Live Store Settings & Banners</h2>
          <p className="text-xs text-slate-500">Configure top promotional ticker, discount coupons, and contact details.</p>
        </div>
        {saved && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded">
            ✓ Settings Updated
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        {/* Announcement Bar Section */}
        <div>
          <h4 className="font-serif font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100">
            Gold Top Announcement Bar
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Banner Announcement Text</label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coupon Promo Code</label>
              <input
                type="text"
                value={settings.announcementCode}
                onChange={(e) => setSettings({ ...settings, announcementCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>
          </div>
        </div>

        {/* Free Gift Threshold & Contact */}
        <div>
          <h4 className="font-serif font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100">
            Cart Thresholds & Concierge
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Gift Threshold (₹)</label>
              <input
                type="number"
                value={settings.freeGiftThreshold}
                onChange={(e) => setSettings({ ...settings, freeGiftThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Concierge Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
