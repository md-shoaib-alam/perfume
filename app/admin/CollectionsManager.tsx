'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

interface CollectionItem {
  id?: string;
  slug?: string;
  name: string;
  subname: string;
  badge?: string;
  subtitle?: string;
  editorial?: string;
  image: string;
  bannerImage?: string;
}

const DEFAULT_COLLECTIONS: CollectionItem[] = [
  {
    slug: 'for-her',
    name: 'Pour Femme',
    subname: 'Collection',
    badge: 'FLORELLE & FEMME COLLECTION',
    subtitle: 'Sensual floral extraits, golden ambers, and velvety nectar compositions.',
    editorial: 'The Pour Femme Collection showcases a range of sensual and lasting aromas for the modern woman who embodies and exudes elegance, charisma, and grace. Each fragrance of floral extracts steeped in pristine oils is handcrafted to invoke the essence of sophisticated haute perfumery.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1920&q=80'
  },
  {
    slug: 'for-him',
    name: 'Pour Homme',
    subname: 'Collection',
    badge: 'HOMME & NOIR COLLECTION',
    subtitle: 'Commanding agarwoods, spicy aromatics, and crisp architectural woods.',
    editorial: 'The Pour Homme Collection captures unyielding presence, refined power, and magnetic depth. Formulated with high-concentration aged agarwood, Venetian saffron, and crisp Calabrian bergamot.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1920&q=80'
  },
  {
    slug: 'haute',
    name: 'Haute',
    subname: 'Collection',
    badge: 'HAUTE COLLECTION',
    subtitle: 'Avant-garde artisan compositions created by world-renowned Master Perfumers.',
    editorial: 'The artisanal crown jewel of the House of NEESH. Formulated in Grasse with ultra-rare natural resins and distilled botanical isolates for the true connoisseur.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1920&q=80'
  },
  {
    slug: 'bureau',
    name: 'Bureau',
    subname: 'Collection',
    badge: 'BUREAU COLLECTION',
    subtitle: 'Refined, versatile office and boardroom extraits designed for authoritative yet unobtrusive elegance.',
    editorial: 'The Bureau Collection presents a range of therapy perfumes crafted for business meetings and day-to-day work experience. Light yet commanding scents with crisp bergamot, fresh lavender, and warm cedarwood.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=80'
  },
  {
    slug: 'luxe',
    name: 'Luxe',
    subname: 'Collection',
    badge: 'LUXE COLLECTION',
    subtitle: 'Rare vintage agarwoods, golden ambers, and regal spice accords crafted for black-tie soirees.',
    editorial: 'The Luxe Collection is built around the most precious raw natural agarwoods, bourbon vanilla, and golden ambers in high extrait concentrations.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1920&q=80'
  },
  {
    slug: 'miss_neesh',
    name: 'Miss NEESH',
    subname: 'Collection',
    badge: 'MISS NEESH COLLECTION',
    subtitle: 'Radiant, youthful floral bouquets and shimmering gourmand nectar formulations.',
    editorial: 'Youthful vivacity meets haute elegance. Sparkling fruity-floral accords blended with white musks and pink peonies for an uplifting, luminous daytime aura.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1920&q=80'
  }
];

export const CollectionsManager: React.FC = () => {
  const { showAlert, showConfirm } = useConfirm();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedSuccessIndex, setSavedSuccessIndex] = useState<number | null>(null);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCollections();
        if (data && data.length > 0) {
          const merged = data.map((item) => {
            const match = DEFAULT_COLLECTIONS.find(
              (d) => d.slug === item.slug || d.name.toLowerCase() === item.name.toLowerCase()
            );
            return {
              ...match,
              ...item,
              bannerImage: item.bannerImage || match?.bannerImage || item.image,
              editorial: item.editorial || match?.editorial || '',
              subtitle: item.subtitle || match?.subtitle || '',
              badge: item.badge || match?.badge || `${item.name.toUpperCase()} COLLECTION`
            };
          });
          setCollections(merged);
        } else {
          setCollections(DEFAULT_COLLECTIONS);
        }
      } catch (e) {
        setCollections(DEFAULT_COLLECTIONS);
      }
    };
    load();
  }, []);

  const handleUpdate = (idx: number, field: keyof CollectionItem, val: string) => {
    const updated = [...collections];
    updated[idx] = { ...updated[idx], [field]: val };
    setCollections(updated);
  };

  const handleAddCollection = () => {
    const newCol: CollectionItem = {
      slug: `collection-${collections.length + 1}`,
      name: 'New Haute Collection',
      subname: 'Collection',
      badge: 'EXCLUSIVE COLLECTION',
      subtitle: 'Luxury bespoke extraits crafted with pure botanical essences.',
      editorial: 'An artisanal formulation embodying decades of master perfumery heritage.',
      image: '',
      bannerImage: ''
    };
    setCollections([newCol, ...collections]);
    setActiveEditIndex(0);
  };

  const handleDeleteCollection = async (idx: number) => {
    const item = collections[idx];
    const confirmed = await showConfirm({
      title: 'Delete Collection',
      message: `Are you sure you want to remove "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      if (item.id) {
        await fetch(`/api/collections?id=${item.id}`, { method: 'DELETE' });
      }
      const updated = collections.filter((_, i) => i !== idx);
      setCollections(updated);
      setActiveEditIndex(null);
      await showAlert({
        title: 'Collection Removed',
        message: `"${item.name}" was successfully removed.`,
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Error Deleting',
        message: err.message || 'Failed to delete collection from database.',
        variant: 'danger'
      });
    }
  };

  // Targeted Single-Collection Save: Saves ONLY the edited collection, preventing redundant bandwidth/writes!
  const handleSaveSingle = async (idx: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const col = collections[idx];
    if (!col) return;

    setSavingIndex(idx);
    try {
      let savedDoc: any;
      if (col.id) {
        savedDoc = await api.updateCollection(col.id, col);
      } else {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(col)
        });
        savedDoc = await res.json();
      }

      if (savedDoc && savedDoc.id) {
        const updated = [...collections];
        updated[idx] = { ...col, id: savedDoc.id };
        setCollections(updated);
      }

      setSavedSuccessIndex(idx);
      setTimeout(() => setSavedSuccessIndex(null), 3000);

      await showAlert({
        title: 'Collection Saved',
        message: `"${col.name}" has been updated live on Appwrite.`,
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Collection',
        message: `Failed to save "${col.name}": ${err.message}`,
        variant: 'danger'
      });
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Collections & Banner Manager</h2>
          <p className="text-xs text-slate-500">
            Upload hero lifestyle banners (16:9), circular story thumbnails, and editorial narratives. Each collection saves individually on demand.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCollection}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Collection</span>
        </button>
      </div>

      {/* Collections Accordion / Cards List */}
      <div className="space-y-4">
        {collections.map((item, idx) => {
          const isExpanded = activeEditIndex === idx;
          const isSavingThis = savingIndex === idx;
          const isSavedSuccess = savedSuccessIndex === idx;

          return (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Header Row */}
              <div
                onClick={() => setActiveEditIndex(isExpanded ? null : idx)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#d6a750] p-0.5 shrink-0 overflow-hidden bg-slate-100 shadow-2xs">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-slate-900 text-base">{item.name}</h4>
                      <span className="text-[11px] font-sans font-semibold text-slate-400">({item.subname})</span>
                      {item.slug && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                          /collections/{item.slug}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSavedSuccess && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Saved</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(idx);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Collection"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Form Fields for this Single Collection */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-5 text-xs animate-fade-in-up">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Collection Title *</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                        placeholder="e.g. Pour Femme"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subname / Category Tag</label>
                      <input
                        type="text"
                        value={item.subname}
                        onChange={(e) => handleUpdate(idx, 'subname', e.target.value)}
                        placeholder="e.g. Collection"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">URL Route Slug *</label>
                      <input
                        type="text"
                        required
                        value={item.slug || ''}
                        onChange={(e) => handleUpdate(idx, 'slug', e.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
                        placeholder="e.g. for-her, haute, bureau"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs focus:outline-none focus:border-[#d6a750]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tagline / Short Subtitle</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => handleUpdate(idx, 'subtitle', e.target.value)}
                      placeholder="e.g. Sensual floral extraits, golden ambers, and velvety nectar compositions."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Editorial Narrative Story (Paragraph shown on collection page)
                    </label>
                    <textarea
                      rows={3}
                      value={item.editorial || ''}
                      onChange={(e) => handleUpdate(idx, 'editorial', e.target.value)}
                      placeholder="Write a rich, poetic paragraph describing the craftsmanship, ingredients, and character of this collection..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>

                  {/* Media Uploaders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 block">1. Hero Lifestyle Banner (16:9 / Landscape)</span>
                      <MediaUploader
                        label="Upload High-Res Banner to Appwrite *"
                        value={item.bannerImage || ''}
                        onChange={(url) => handleUpdate(idx, 'bannerImage', url)}
                        helperText="Recommended: 1920x1080 (16:9) lifestyle photography uploaded to Appwrite Cloud Storage."
                      />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 block">2. Homepage Story Circle Thumbnail (1:1 Square)</span>
                      <MediaUploader
                        label="Upload Story Circle Thumbnail to Appwrite *"
                        value={item.image || ''}
                        onChange={(url) => handleUpdate(idx, 'image', url)}
                        helperText="Recommended: 400x400 (1:1) square icon thumbnail for the homepage circular stories."
                      />
                    </div>
                  </div>

                  {/* Individual Save Button for This Specific Collection */}
                  <div className="flex justify-end pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={isSavingThis}
                      onClick={() => handleSaveSingle(idx)}
                      className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] active:bg-[#a57b28] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingThis ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving &quot;{item.name}&quot;...</span>
                        </>
                      ) : (
                        <span>Save &quot;{item.name}&quot;</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
