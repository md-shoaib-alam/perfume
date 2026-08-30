'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { seedAppwriteDatabase } from '@/lib/seedAppwrite';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';
import type { FragrancePyramidData, PyramidTier, NoteItem } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';

const DEFAULT_FRAGRANCE_TIERS: FragrancePyramidData = {
  top: {
    title: 'Top Notes — The Initial Spark',
    duration: '0 to 30 Minutes',
    description:
      'The first olfactory impression perceived immediately upon atomization. Crisp, effervescent botanical isolates designed to captivate the senses.',
    notes: []
  },
  heart: {
    title: 'Heart Notes — The Scent Soul',
    duration: '30 Minutes to 4 Hours',
    description:
      'The core architectural body of the perfume that unfolds as the top notes subside. Rich floral and aromatic resins defining character.',
    notes: []
  },
  base: {
    title: 'Base Notes — The Lingering Sillage',
    duration: '4 to 12+ Hours',
    description:
      'The foundation of high-concentration extraits. Heavy molecular resins and vintage woods that anchor the fragrance and bond with skin chemistry.',
    notes: []
  }
};

const DEFAULT_ANNOUNCEMENTS = [
  'FLAT 15% OFF | USE CODE: LUXE15',
  'FREE SHIPPING ON ORDERS OVER RS. 1,500',
  'LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE',
  '7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML'
];

const DEFAULT_SETTINGS = {
  announcementText: 'FLAT 15% OFF | USE CODE: LUXE15',
  announcementCode: 'LUXE15',
  announcementMessages: JSON.stringify(DEFAULT_ANNOUNCEMENTS),
  freeGiftThreshold: 3500,
  contactEmail: 'concierge@bakhoorbliss.com',
  contactPhone: '+91 (800) 555-BAKHOOR',
  returnsBadgeText: '7 DAYS',
  returnsTitle: '7 Days No Questions Asked Returns',
  returnsDescription: 'Applicable on first order of 100ml and 50ml perfume bottles only',
  deliveryTitle: 'Free & Fast Express Delivery',
  deliveryDescription: 'Free shipping on orders over ₹1,500 delivered within 3-5 business days',
  guaranteeTitle: '10+ Hours Long-Lasting Sillage Guarantee',
  guaranteeDescription: 'BakhoorBliss extraits de parfum are crafted with high oil concentration to linger all day'
};

export const SettingsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { showConfirm, showAlert } = useConfirm();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [announcementList, setAnnouncementList] = useState<string[]>(DEFAULT_ANNOUNCEMENTS);

  const [fragranceTiers, setFragranceTiers] = useState<FragrancePyramidData>(DEFAULT_FRAGRANCE_TIERS);
  const [initialFragranceTiers, setInitialFragranceTiers] = useState<FragrancePyramidData>(DEFAULT_FRAGRANCE_TIERS);
  const [activeTierTab, setActiveTierTab] = useState<'top' | 'heart' | 'base'>('top');

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ ok: boolean; message: string } | null>(null);

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
        setSeedResult({
          ok: false,
          message: `Seeded with warnings: ${res.errors.join(', ')}`
        });
      } else {
        setSeedResult({
          ok: true,
          message: `Successfully populated Appwrite (${res.products} products, ${res.coupons} coupons, ${res.hero_slides} slides, ${res.collections} collections)`
        });
      }
    } catch (err: any) {
      setSeedResult({
        ok: false,
        message: `Seed failed: ${err.message}`
      });
    } finally {
      setSeeding(false);
    }
  };

  const [syncingUsers, setSyncingUsers] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSyncUsers = async () => {
    const confirmed = await showConfirm({
      title: 'Sync Clerk Users to Appwrite',
      message: 'This will fetch all registered Clerk users and synchronize them into your Appwrite users table. Continue?',
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
          message: `Successfully synchronized ${data.totalClerkUsers} users from Clerk to Appwrite (${data.created} created, ${data.updated} updated).`
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        if (data) {
          const loadedSettings = {
            announcementText: data.announcementText || DEFAULT_SETTINGS.announcementText,
            announcementCode: data.announcementCode || DEFAULT_SETTINGS.announcementCode,
            announcementMessages: data.announcementMessages || DEFAULT_SETTINGS.announcementMessages,
            freeGiftThreshold: data.freeGiftThreshold ?? DEFAULT_SETTINGS.freeGiftThreshold,
            contactEmail: data.contactEmail || DEFAULT_SETTINGS.contactEmail,
            contactPhone: data.contactPhone || DEFAULT_SETTINGS.contactPhone,
            returnsBadgeText: data.returnsBadgeText || DEFAULT_SETTINGS.returnsBadgeText,
            returnsTitle: data.returnsTitle || DEFAULT_SETTINGS.returnsTitle,
            returnsDescription: data.returnsDescription || DEFAULT_SETTINGS.returnsDescription,
            deliveryTitle: data.deliveryTitle || DEFAULT_SETTINGS.deliveryTitle,
            deliveryDescription: data.deliveryDescription || DEFAULT_SETTINGS.deliveryDescription,
            guaranteeTitle: data.guaranteeTitle || DEFAULT_SETTINGS.guaranteeTitle,
            guaranteeDescription: data.guaranteeDescription || DEFAULT_SETTINGS.guaranteeDescription
          };
          setSettings(loadedSettings);

          if (data.announcementMessages) {
            let parsedMsgs: string[] = [];
            if (typeof data.announcementMessages === 'string') {
              try { parsedMsgs = JSON.parse(data.announcementMessages); } catch (e) {}
            } else if (Array.isArray(data.announcementMessages)) {
              parsedMsgs = data.announcementMessages;
            }
            if (Array.isArray(parsedMsgs) && parsedMsgs.length > 0) {
              setAnnouncementList(parsedMsgs.map((m: any) => String(m)).filter(Boolean));
            }
          } else if (data.announcementText) {
            setAnnouncementList([
              data.announcementText,
              'FREE SHIPPING ON ORDERS OVER RS. 1,500',
              'LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE',
              '7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML'
            ]);
          }
          if (data.fragranceTiers) {
            let parsed: FragrancePyramidData | null = null;
            if (typeof data.fragranceTiers === 'string') {
              try {
                parsed = JSON.parse(data.fragranceTiers);
              } catch (e) {}
            } else if (typeof data.fragranceTiers === 'object') {
              parsed = data.fragranceTiers;
            }
            if (parsed) {
              const merged: FragrancePyramidData = {
                top: {
                  title: parsed.top?.title || DEFAULT_FRAGRANCE_TIERS.top.title,
                  duration: parsed.top?.duration || DEFAULT_FRAGRANCE_TIERS.top.duration,
                  description: parsed.top?.description || DEFAULT_FRAGRANCE_TIERS.top.description,
                  notes: parsed.top?.notes || []
                },
                heart: {
                  title: parsed.heart?.title || DEFAULT_FRAGRANCE_TIERS.heart.title,
                  duration: parsed.heart?.duration || DEFAULT_FRAGRANCE_TIERS.heart.duration,
                  description: parsed.heart?.description || DEFAULT_FRAGRANCE_TIERS.heart.description,
                  notes: parsed.heart?.notes || []
                },
                base: {
                  title: parsed.base?.title || DEFAULT_FRAGRANCE_TIERS.base.title,
                  duration: parsed.base?.duration || DEFAULT_FRAGRANCE_TIERS.base.duration,
                  description: parsed.base?.description || DEFAULT_FRAGRANCE_TIERS.base.description,
                  notes: parsed.base?.notes || []
                }
              };
              setFragranceTiers(merged);
              setInitialFragranceTiers(JSON.parse(JSON.stringify(merged)));
            }
          }
        }
      } catch (err: any) {
        console.warn('Failed to load settings:', err);
        await showAlert({
          title: 'Error Loading Settings',
          message: `Could not retrieve store settings: ${err.message}`,
          variant: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdateTierField = (field: keyof PyramidTier, value: any) => {
    setFragranceTiers((prev) => ({
      ...prev,
      [activeTierTab]: {
        ...prev[activeTierTab],
        [field]: value
      }
    }));
  };

  const handleUpdateTierNote = (noteIndex: number, field: keyof NoteItem, value: string) => {
    setFragranceTiers((prev) => {
      const currentNotes = [...(prev[activeTierTab]?.notes || [])];
      if (currentNotes[noteIndex]) {
        currentNotes[noteIndex] = { ...currentNotes[noteIndex], [field]: value };
      }
      return {
        ...prev,
        [activeTierTab]: {
          ...prev[activeTierTab],
          notes: currentNotes
        }
      };
    });
  };

  const handleAddTierNote = () => {
    setFragranceTiers((prev) => {
      const currentNotes = [...(prev[activeTierTab]?.notes || [])];
      currentNotes.push({
        name: 'New Botanical Note',
        role: 'Accent Note',
        source: 'Sustainably sourced',
        image: ''
      });
      return {
        ...prev,
        [activeTierTab]: {
          ...prev[activeTierTab],
          notes: currentNotes
        }
      };
    });
  };

  const handleRemoveTierNote = (noteIndex: number) => {
    setFragranceTiers((prev) => {
      const currentNotes = (prev[activeTierTab]?.notes || []).filter((_, i) => i !== noteIndex);
      return {
        ...prev,
        [activeTierTab]: {
          ...prev[activeTierTab],
          notes: currentNotes
        }
      };
    });
  };

  const handleAddAnnouncement = () => {
    setAnnouncementList((prev) => [...prev, 'NEW LUXURY ANNOUNCEMENT OFFER']);
  };

  const handleUpdateAnnouncement = (index: number, text: string) => {
    setAnnouncementList((prev) => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  };

  const handleRemoveAnnouncement = (index: number) => {
    setAnnouncementList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanMsgs = announcementList.map((m) => m.trim()).filter(Boolean);
      const payload = {
        ...settings,
        announcementText: cleanMsgs[0] || settings.announcementText || 'FLAT 15% OFF | USE CODE: LUXE15',
        announcementMessages: JSON.stringify(cleanMsgs.length > 0 ? cleanMsgs : DEFAULT_ANNOUNCEMENTS),
        fragranceTiers: JSON.stringify(fragranceTiers)
      };

      // 1. Persist to Appwrite DB first
      await api.updateSettings(payload);

      // 2. Only after database persistence succeeds, clean up replaced note images from Appwrite Storage
      const currentAllImages = new Set<string>();
      (['top', 'heart', 'base'] as const).forEach((t) => {
        (fragranceTiers[t]?.notes || []).forEach((n) => {
          if (n.image) currentAllImages.add(n.image);
        });
      });

      (['top', 'heart', 'base'] as const).forEach((t) => {
        (initialFragranceTiers[t]?.notes || []).forEach((n) => {
          if (n.image && !currentAllImages.has(n.image)) {
            deleteMediaFromAppwrite(n.image).catch(() => {});
          }
        });
      });

      setInitialFragranceTiers(JSON.parse(JSON.stringify(fragranceTiers)));
      window.dispatchEvent(new Event('neesh_settings_updated'));
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      await showAlert({
        title: 'Error Saving Settings',
        message: `Failed to save store settings: ${err.message || 'Unknown error occurred'}`,
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const currentTier = fragranceTiers[activeTierTab] || DEFAULT_FRAGRANCE_TIERS[activeTierTab];

  return (
    <div className="space-y-6 font-sans pb-12">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Live Store Settings & Olfactory Config</h2>
          <p className="text-xs text-slate-500">Configure top promotional ticker, trust claims, cart gifts, and the Olfactory Notes Pyramid.</p>
        </div>
        {saved && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded flex items-center gap-1.5 animate-fade-in-up">
            <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Settings Updated</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-8">
        {/* Announcement Bar Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Gold Top Announcement Bar (Dynamic Promotional Ticker)
              </h4>
              <p className="text-[11px] text-slate-500">
                Manage the live scrolling messages displayed at the very top of your storefront. Add, edit, or remove any phrase in real time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddAnnouncement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Ticker Message</span>
            </button>
          </div>

          {/* Live Dynamic Storefront Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600">Live Storefront Ticker Preview ({announcementList.length} phrases):</span>
              <span className="text-[10px] text-slate-400 font-medium">Updates instantly on store when saved</span>
            </div>
            <div className="bg-[#caa04c] text-[#222222] font-semibold text-[11px] py-2 px-4 rounded-xl overflow-hidden uppercase tracking-widest whitespace-nowrap border border-[#b88f3e]/40 shadow-xs flex items-center gap-6">
              {announcementList.length === 0 ? (
                <span className="text-slate-800/80 italic">No announcement messages added. Click "Add Ticker Message" below.</span>
              ) : (
                announcementList.map((msg, idx) => (
                  <React.Fragment key={idx}>
                    <span className="flex items-center gap-2 shrink-0">
                      {idx === 0 && <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />}
                      <span>{msg || '(Empty message)'}</span>
                    </span>
                    {idx < announcementList.length - 1 && <span className="text-slate-900/60 font-bold">•</span>}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Coupon Code Shortcut */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-700 mb-1 text-xs">Primary Coupon Promo Code</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={settings.announcementCode}
                onChange={(e) => setSettings({ ...settings, announcementCode: e.target.value.toUpperCase() })}
                placeholder="e.g. LUXE15"
                className="w-full sm:w-64 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-[#d6a750] transition-all"
              />
              <span className="text-[11px] text-slate-500">Auto-applies when customers click promo banners</span>
            </div>
          </div>

          {/* Dynamic Message List Editor */}
          <div className="space-y-2.5">
            <span className="block font-bold text-slate-800 text-xs">
              Configured Ticker Phrases ({announcementList.length}):
            </span>
            <div className="space-y-2">
              {announcementList.map((msg, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/80 font-bold text-[11px] text-[#caa04c] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => handleUpdateAnnouncement(index, e.target.value)}
                    placeholder={`Announcement message #${index + 1}`}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#d6a750] transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveAnnouncement(index)}
                    title="Remove Message"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {announcementList.length === 0 && (
              <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-xs">
                <span>No ticker messages. </span>
                <button
                  type="button"
                  onClick={() => setAnnouncementList(DEFAULT_ANNOUNCEMENTS)}
                  className="font-bold text-[#caa04c] hover:underline cursor-pointer"
                >
                  Load Luxury Defaults
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Olfactory Architecture / Fragrance Notes Pyramid Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-4 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Olfactory Architecture & Fragrance Notes Pyramid
              </h4>
              <p className="text-[11px] text-slate-500">
                Configure Top, Heart, and Base notes displayed on the homepage with high-definition ingredient photos.
              </p>
            </div>

            {/* Tier Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
              {(['top', 'heart', 'base'] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTierTab(tabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTierTab === tabKey
                      ? 'bg-[#d6a750] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tabKey === 'top' && '1. Top Notes'}
                  {tabKey === 'heart' && '2. Heart Notes'}
                  {tabKey === 'base' && '3. Base Notes'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-[#faf9f6] rounded-2xl border border-amber-200/60 space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tier Display Title</label>
                <input
                  type="text"
                  value={currentTier.title || ''}
                  onChange={(e) => handleUpdateTierField('title', e.target.value)}
                  placeholder="e.g. Top Notes — The Initial Spark"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longevity / Duration Badge</label>
                <input
                  type="text"
                  value={currentTier.duration || ''}
                  onChange={(e) => handleUpdateTierField('duration', e.target.value)}
                  placeholder="e.g. 0 to 30 Minutes"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tier Description</label>
              <textarea
                rows={2}
                value={currentTier.description || ''}
                onChange={(e) => handleUpdateTierField('description', e.target.value)}
                placeholder="Description of this olfactory phase..."
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            {/* Note Cards List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  {activeTierTab.toUpperCase()} Master Ingredients ({currentTier.notes?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={handleAddTierNote}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  + Add Ingredient Note
                </button>
              </div>

              {(!currentTier.notes || currentTier.notes.length === 0) ? (
                <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No ingredient notes added for this tier yet. Click &quot;+ Add Ingredient Note&quot; to add one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentTier.notes.map((note, noteIdx) => (
                    <div
                      key={noteIdx}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-[#b58b38] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Ingredient #{noteIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTierNote(noteIdx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                          title="Remove Note"
                        >
                          Remove
                        </button>
                      </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ingredient Name *</label>
                      <input
                        type="text"
                        value={note.name}
                        onChange={(e) => handleUpdateTierNote(noteIdx, 'name', e.target.value)}
                        placeholder="e.g. Calabrian Bergamot"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Olfactory Role / Accord</label>
                      <input
                        type="text"
                        value={note.role}
                        onChange={(e) => handleUpdateTierNote(noteIdx, 'role', e.target.value)}
                        placeholder="e.g. Luminous Citrus Spark"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Origin / Extraction Source</label>
                      <input
                        type="text"
                        value={note.source}
                        onChange={(e) => handleUpdateTierNote(noteIdx, 'source', e.target.value)}
                        placeholder="e.g. Hand-pressed in Calabria, Italy"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>

                    <div>
                      <MediaUploader
                        label="Ingredient Image"
                        value={note.image || ''}
                        onChange={(url) => handleUpdateTierNote(noteIdx, 'image', url)}
                        helperText="Upload ingredient visual."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Gold Trust & Guarantee Banner Section */}
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100">
            Gold Trust & Guarantee Banner Claims
          </h4>
          <div className="space-y-4 text-xs">
            {/* Returns Policy */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800">1. Returns Policy Claim</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={settings.returnsBadgeText || ''}
                    onChange={(e) => setSettings({ ...settings, returnsBadgeText: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.returnsTitle || ''}
                    onChange={(e) => setSettings({ ...settings, returnsTitle: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={settings.returnsDescription || ''}
                    onChange={(e) => setSettings({ ...settings, returnsDescription: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Policy */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800">2. Free & Fast Delivery Claim</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.deliveryTitle || ''}
                    onChange={(e) => setSettings({ ...settings, deliveryTitle: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={settings.deliveryDescription || ''}
                    onChange={(e) => setSettings({ ...settings, deliveryDescription: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>
            </div>

            {/* Longevity Guarantee */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800">3. Lingering Effect & Longevity Guarantee</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={settings.guaranteeTitle || ''}
                    onChange={(e) => setSettings({ ...settings, guaranteeTitle: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={settings.guaranteeDescription || ''}
                    onChange={(e) => setSettings({ ...settings, guaranteeDescription: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Free Gift Threshold & Contact */}
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100">
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
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Store Database Initialization / Seeder Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
                <svg className="w-4 h-4 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span>Store Database Initialization</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 ml-10">
              Populate catalog with default perfumes, reviews, discount coupons, hero banners, and brand settings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seeding}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-xs ${
              seeding
                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                : 'bg-slate-900 hover:bg-black text-white'
            }`}
          >
            {seeding ? 'Seeding Catalog...' : 'Load Sample Data'}
          </button>
        </div>

        {seedResult && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
            seedResult.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {seedResult.message}
          </div>
        )}
      </div>

      {/* User Accounts Synchronization Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
                <svg className="w-4 h-4 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span>Customer Accounts Synchronization</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 ml-10">
              Synchronize all registered user profiles for order matching, addresses, and customer profiles.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSyncUsers}
            disabled={syncingUsers}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-xs ${
              syncingUsers
                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                : 'bg-slate-900 hover:bg-black text-white'
            }`}
          >
            {syncingUsers ? 'Syncing Profiles...' : 'Sync Customers'}
          </button>
        </div>

        {syncResult && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
            syncResult.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {syncResult.message}
          </div>
        )}
      </div>

    </div>
  );
};
