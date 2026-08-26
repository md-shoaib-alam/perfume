'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { seedAppwriteDatabase } from '@/lib/seedAppwrite';


import { useConfirm } from '../components/CustomConfirmModal';

export const SettingsManager: React.FC = () => {
  const { showConfirm } = useConfirm();
  const [settings, setSettings] = useState({
    announcementText: 'FLAT 15% OFF | USE CODE: LUXE15',
    announcementCode: 'LUXE15',
    freeGiftThreshold: 3500,
    contactEmail: 'concierge@neesh.com',
    contactPhone: '+91 (800) 555-NEESH'
  });
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    const confirmed = await showConfirm({
      title: 'Seed Appwrite Database',
      message: 'This will upload initial perfumes, reviews, coupons, hero slides, and settings into your Appwrite tables. Continue?',
      confirmText: 'Seed Database',
      variant: 'warning'
    });
    if (!confirmed) return;

    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedAppwriteDatabase();
      if (res.errors.length > 0) {
        setSeedResult(`Seeded with warnings: ${res.errors.join(', ')}`);
      } else {
        setSeedResult(`Successfully populated Appwrite (${res.products} products, ${res.coupons} coupons, ${res.hero_slides} slides, ${res.collections} collections)`);
      }
    } catch (err: any) {
      setSeedResult(`Seed failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Concierge Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Appwrite Database Initialization / Seeder Card */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#c59b48] flex items-center gap-2">
              <span>⚡</span>
              <span>Appwrite Database Initialization</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Click to seed your Appwrite database tables with initial perfumes, reviews, discount coupons, hero banners, and settings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seeding}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              seeding
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-[#c59b48] hover:bg-[#b58b38] text-black font-extrabold shadow-md'
            }`}
          >
            {seeding ? 'Seeding Tables...' : 'Seed Appwrite Data'}
          </button>
        </div>

        {seedResult && (
          <div className={`p-3 rounded-lg text-xs font-semibold ${
            seedResult.startsWith('✅') ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
          }`}>
            {seedResult}
          </div>
        )}
      </div>

    </div>
  );
};

