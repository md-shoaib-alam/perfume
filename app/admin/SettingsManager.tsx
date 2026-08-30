'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { seedAppwriteDatabase } from '@/lib/seedAppwrite';
import { useConfirm } from '../components/CustomConfirmModal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';

const DEFAULT_SETTINGS = {
  freeGiftThreshold: 3500,
  contactEmail: 'wecare@bakhoorbliss.com',
  contactPhone: '+91 72062 77777'
};

export const SettingsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { showConfirm, showAlert } = useConfirm();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [syncingUsers, setSyncingUsers] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        if (data) {
          setSettings({
            freeGiftThreshold: data.freeGiftThreshold ?? DEFAULT_SETTINGS.freeGiftThreshold,
            contactEmail: data.contactEmail || DEFAULT_SETTINGS.contactEmail,
            contactPhone: data.contactPhone || DEFAULT_SETTINGS.contactPhone
          });
        }
      } catch (err: any) {
        console.warn('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        freeGiftThreshold: Number(settings.freeGiftThreshold) || 3500,
        contactEmail: settings.contactEmail.trim(),
        contactPhone: settings.contactPhone.trim()
      });

      window.dispatchEvent(new Event('neesh_settings_updated'));
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      await showAlert({
        title: 'Save Failed',
        message: `Failed to save store settings: ${err.message || 'Unknown error occurred'}`,
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDatabase = async () => {
    const confirmed = await showConfirm({
      title: 'Initialize Store Database',
      message: 'This will seed perfumes, collections, coupons, and slides into your Appwrite database. Continue?',
      confirmText: 'Seed Database',
      variant: 'warning'
    });
    if (!confirmed) return;

    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedAppwriteDatabase();
      if (res.errors.length > 0) {
        setSeedResult({
          ok: false,
          message: `Seeded with warnings: ${res.errors.join(', ')}`
        });
      } else {
        setSeedResult({
          ok: true,
          message: `Successfully populated Appwrite (${res.products} products, ${res.coupons} coupons, ${res.hero_slides} slides, ${res.collections} collections).`
        });
      }
    } catch (err: any) {
      setSeedResult({
        ok: false,
        message: `Initialization failed: ${err.message}`
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleSyncUsers = async () => {
    const confirmed = await showConfirm({
      title: 'Sync Clerk Users to Appwrite',
      message: 'This will synchronize all registered users from Clerk Auth into your Appwrite database. Continue?',
      confirmText: 'Sync Users',
      variant: 'info'
    });
    if (!confirmed) return;

    setSyncingUsers(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/users/sync-all', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult({
          ok: true,
          message: `Successfully synchronized ${data.totalClerkUsers} users (${data.created} created, ${data.updated} updated).`
        });
      } else {
        setSyncResult({
          ok: false,
          message: `Sync failed: ${data.error || 'Unknown error'}`
        });
      }
    } catch (err: any) {
      setSyncResult({
        ok: false,
        message: `Failed to execute sync: ${err.message}`
      });
    } finally {
      setSyncingUsers(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span>Store Settings & Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage checkout free gift offers, customer concierge support contact, and database synchronization tools.
          </p>
        </div>

        {saved && (
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-fade-in-up">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Settings Saved Live</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Cart Offers & Concierge Section */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Cart Offers & Support Concierge</h3>
            <p className="text-[11px] text-slate-500">Configure free gift eligibility rules and customer support contact info.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Free Gift Threshold */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Free Gift Cart Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeGiftThreshold}
                onChange={(e) => setSettings({ ...settings, freeGiftThreshold: Number(e.target.value) })}
                placeholder="3500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                Orders above this amount unlock a complimentary luxury perfume sample.
              </span>
            </div>

            {/* Support Email */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="wecare@bakhoorbliss.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                Displayed in emails and customer help sections.
              </span>
            </div>

            {/* Support Phone */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Concierge Phone Number
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                placeholder="+91 72062 77777"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                Available for phone orders and concierge calls.
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Database Tools Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Database & User Synchronization</h3>
          <p className="text-[11px] text-slate-500">One-click administrative tools to keep Clerk users and store data synced.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clerk Sync Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Synchronize Clerk Users</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Fetches all registered customers from Clerk Authentication and syncs them into your Appwrite database table.
              </p>
            </div>
            {syncResult && (
              <div className={`p-2.5 rounded-lg text-xs font-medium ${syncResult.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {syncResult.message}
              </div>
            )}
            <button
              type="button"
              onClick={handleSyncUsers}
              disabled={syncingUsers}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {syncingUsers ? 'Syncing Users...' : 'Sync All Users from Clerk'}
            </button>
          </div>

          {/* Database Initializer */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Initialize Sample Products & Data</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Seeds standard luxury perfumes, collections, and coupons if starting on a new empty database.
              </p>
            </div>
            {seedResult && (
              <div className={`p-2.5 rounded-lg text-xs font-medium ${seedResult.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {seedResult.message}
              </div>
            )}
            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {seeding ? 'Initializing...' : 'Seed Store Database'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
