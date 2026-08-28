'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { seedAppwriteDatabase } from '@/lib/seedAppwrite';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';
import type { FragrancePyramidData, PyramidTier, NoteItem } from '../types';

const DEFAULT_FRAGRANCE_TIERS: FragrancePyramidData = {
  top: {
    title: 'Top Notes — The Initial Spark',
    duration: '0 to 30 Minutes',
    description:
      'The first olfactory impression perceived immediately upon atomization. Crisp, effervescent botanical isolates designed to captivate the senses.',
    notes: [
      {
        name: 'Calabrian Bergamot',
        role: 'Luminous Citrus Spark',
        source: 'Hand-pressed in Calabria, Southern Italy',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Saffron Absolute',
        role: 'Regal Golden Spice Accord',
        source: 'Harvested at dawn in Pampore, Kashmir',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Taif Rose Petals',
        role: 'Crisp Velvet Blossom',
        source: 'Hydro-distilled in Taif Mountain Valleys',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  heart: {
    title: 'Heart Notes — The Scent Soul',
    duration: '30 Minutes to 4 Hours',
    description:
      'The core architectural body of the perfume that unfolds as the top notes subside. Rich floral and aromatic resins defining character.',
    notes: [
      {
        name: 'Bourbon Vanilla Pods',
        role: 'Creamy Warmth & Depth',
        source: 'Sun-cured in Madagascar',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Orris Butter',
        role: 'Silky Powdery Richness',
        source: 'Aged 3 Years in Florence, Italy',
        image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Cardamom Co-Extract',
        role: 'Green Warm Spicy Spark',
        source: 'Wild-harvested in Guatemala Rainforests',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  base: {
    title: 'Base Notes — The Lingering Sillage',
    duration: '4 to 12+ Hours',
    description:
      'The foundation of high-concentration extraits. Heavy molecular resins and vintage woods that anchor the fragrance and bond with skin chemistry.',
    notes: [
      {
        name: 'Aged Assam Agarwood (Oud)',
        role: 'Smoky Balsamic Power',
        source: 'Naturally aged wild Aquilaria from Assam',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Golden Ambergris Resin',
        role: 'Oceanic Salty Warmth',
        source: 'Sustainably ethically foraged coastal amber',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Mysore Sandalwood',
        role: 'Buttery Sacred Cream Wood',
        source: 'Government-certified Santalum Album, India',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
      }
    ]
  }
};

export const SettingsManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [settings, setSettings] = useState({
    announcementText: 'FLAT 15% OFF | USE CODE: LUXE15',
    announcementCode: 'LUXE15',
    freeGiftThreshold: 3500,
    contactEmail: 'concierge@bakhoorbliss.com',
    contactPhone: '+91 (800) 555-BAKHOOR',
    returnsBadgeText: '7 DAYS',
    returnsTitle: 'No Questions Asked Returns',
    returnsDescription: 'Applicable on first order of 100ml and 50ml perfume bottles only',
    deliveryTitle: 'Free & Fast Delivery',
    deliveryDescription: 'on your doorsteps in 3-5 days, with a surprise',
    guaranteeTitle: 'The Lingering Effect You Want',
    guaranteeDescription: 'BakhoorBliss perfumes are blended with proven ingredients to last 10+ hours (Guaranteed)'
  });

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
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
                top: parsed.top || DEFAULT_FRAGRANCE_TIERS.top,
                heart: parsed.heart || DEFAULT_FRAGRANCE_TIERS.heart,
                base: parsed.base || DEFAULT_FRAGRANCE_TIERS.base
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
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
          <h2 className="text-xl font-serif font-bold text-slate-900">Live Store Settings & Olfactory Config</h2>
          <p className="text-xs text-slate-500">Configure top promotional ticker, trust claims, and the dynamic Olfactory Notes Pyramid stored in Appwrite.</p>
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

        {/* Olfactory Architecture / Fragrance Notes Pyramid Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-4 border-b border-slate-100">
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-sm">
                Olfactory Architecture & Fragrance Pyramid (Appwrite Dynamic)
              </h4>
              <p className="text-[11px] text-slate-500">
                Configure Top, Heart, and Base notes displayed on the homepage. Upload ingredient lifestyle photos to Appwrite Cloud Storage (`perfume_media`).
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentTier.notes && currentTier.notes.map((note, noteIdx) => (
                  <div
                    key={noteIdx}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-[#b58b38] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Ingredient #{noteIdx + 1}
                      </span>
                      {currentTier.notes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTierNote(noteIdx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                          title="Remove Note"
                        >
                          Remove
                        </button>
                      )}
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
                        helperText="Appwrite Storage uploaded botanical visual."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gold Trust & Guarantee Banner Section */}
        <div>
          <h4 className="font-serif font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100">
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
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Appwrite Database Initialization / Seeder Card */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#c59b48] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#c59b48]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
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
            seedResult.ok ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
          }`}>
            {seedResult.message}
          </div>
        )}
      </div>

    </div>
  );
};
