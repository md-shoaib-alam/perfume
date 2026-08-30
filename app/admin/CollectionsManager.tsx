'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';

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

const STANDARD_LANDING_PAGES: CollectionItem[] = [
  {
    slug: 'for-him',
    name: 'Pour Homme',
    subname: 'For Him (Men)',
    badge: 'HOMME & NOIR COLLECTION',
    subtitle: 'Commanding agarwoods, spicy aromatics, and crisp architectural woods.',
    editorial: 'The Pour Homme Collection captures unyielding presence, refined power, and magnetic depth. Formulated with high-concentration aged agarwood, Venetian saffron, and crisp Calabrian bergamot, each extrait creates an authoritative sillage tailored for the distinguished gentleman.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'for-her',
    name: 'Pour Femme',
    subname: 'For Her (Women)',
    badge: 'FLORELLE & FEMME COLLECTION',
    subtitle: 'Sensual floral extraits, golden ambers, and velvety nectar compositions.',
    editorial: 'The Pour Femme Collection showcases a range of sensual and lasting aromas for the modern woman who embodies and exudes elegance, charisma, and grace. Each fragrance of floral extracts steeped in pristine oils is handcrafted to invoke the essence of sophisticated haute perfumery.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'unisex',
    name: 'Unisex Haute Parfumerie',
    subname: 'Unisex',
    badge: 'EXCLUSIVE ARTISAN BLENDS',
    subtitle: 'Genderless liquid architecture blending rare resins, spices, and exotic florals.',
    editorial: 'Transcend conventional fragrance boundaries with our unisex compositions. Formulated with vintage resins, smoky incense, and rare floral absolutes that evolve uniquely on pulse points throughout the day.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'gift-set',
    name: 'Gifting Collections',
    subname: 'Gift Sets',
    badge: 'LUXURY GIFTING COFFRETS',
    subtitle: 'Handcrafted presentation boxes for special celebrations, anniversaries, and distinguished milestones.',
    editorial: 'Unwrap the magic of haute perfumery. Encased in velvet-lined champagne gold presentation coffrets, our gifting sets represent the ultimate expression of gratitude and luxury.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'discovery-set',
    name: 'Discovery Sets',
    subname: 'Discovery Coffrets',
    badge: 'OLFACTORY TASTING SETS',
    subtitle: 'Explore the complete olfactive spectrum with complimentary voucher redeemable on your full bottle.',
    editorial: 'Experience the entire collection before selecting your signature scent. Each discovery coffret includes travel-ready atomizers accompanied by an exclusive full-bottle redemption voucher.',
    image: '',
    bannerImage: ''
  }
];

const generateUniqueSlug = (existingCollections: CollectionItem[]): string => {
  const existingSlugs = new Set(
    existingCollections.map((c) => c.slug?.toLowerCase().trim()).filter(Boolean)
  );
  let counter = 1;
  while (existingSlugs.has(`collection-${counter}`)) {
    counter++;
  }
  return `collection-${counter}`;
};

export const CollectionsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'story' | 'gender'>('story');
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [initialCollections, setInitialCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedSuccessIndex, setSavedSuccessIndex] = useState<number | null>(null);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  // Gender Landing pages state
  const [genderPages, setGenderPages] = useState<CollectionItem[]>([]);
  const [savingGenderSlug, setSavingGenderSlug] = useState<string | null>(null);
  const [savedGenderSlug, setSavedGenderSlug] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCollections();
      if (data && Array.isArray(data)) {
        // Story collections (custom lines like Bureau, Luxe, Haute, etc.)
        const storyCols = data.filter(
          (c) => !STANDARD_LANDING_PAGES.some((p) => p.slug === c.slug)
        );
        setCollections(storyCols);
        setInitialCollections(JSON.parse(JSON.stringify(storyCols)));
        if (storyCols.length > 0) {
          setActiveEditIndex(0);
        }

        // Gender & Category landing pages merged with live DB items
        const mergedGenderPages = STANDARD_LANDING_PAGES.map((preset) => {
          const match = data.find((c) => c.slug === preset.slug);
          if (match) {
            return {
              ...preset,
              ...match,
              id: match.id,
              name: match.name || preset.name,
              subname: match.subname || preset.subname,
              badge: match.badge || preset.badge,
              subtitle: match.subtitle || preset.subtitle,
              editorial: match.editorial || preset.editorial,
              image: match.image || '',
              bannerImage: match.bannerImage || ''
            };
          }
          return preset;
        });
        setGenderPages(mergedGenderPages);
      } else {
        setCollections([]);
        setInitialCollections([]);
        setGenderPages(STANDARD_LANDING_PAGES);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collections from database.');
      setCollections([]);
      setInitialCollections([]);
      setGenderPages(STANDARD_LANDING_PAGES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleUpdate = (idx: number, field: keyof CollectionItem, val: string) => {
    const updated = [...collections];
    updated[idx] = { ...updated[idx], [field]: val };
    setCollections(updated);
  };

  const handleUpdateGenderPage = (slug: string, field: keyof CollectionItem, val: string) => {
    setGenderPages((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveGenderLandingPage = async (slug: string) => {
    const pageItem = genderPages.find((p) => p.slug === slug);
    if (!pageItem) return;

    setSavingGenderSlug(slug);
    try {
      if (pageItem.id) {
        await api.updateCollection(pageItem.id, pageItem);
      } else {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageItem)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to save landing page in Appwrite');
        }
        const createdDoc = await res.json();
        setGenderPages((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, id: createdDoc.id } : p))
        );
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
      setSavedGenderSlug(slug);
      setTimeout(() => setSavedGenderSlug(null), 3000);

      await showAlert({
        title: 'Landing Page Saved',
        message: `Landing banner and editorial for "${pageItem.name}" updated successfully.`,
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Landing Page',
        message: err.message || 'Failed to persist changes.',
        variant: 'danger'
      });
    } finally {
      setSavingGenderSlug(null);
    }
  };

  const handleAddCollection = () => {
    const uniqueSlug = generateUniqueSlug(collections);
    const newCol: CollectionItem = {
      slug: uniqueSlug,
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

      // Clean up orphaned storage media only AFTER database deletion succeeds
      if (item.image) deleteMediaFromAppwrite(item.image).catch(() => {});
      if (item.bannerImage) deleteMediaFromAppwrite(item.bannerImage).catch(() => {});

      const updated = collections.filter((_, i) => i !== idx);
      setCollections(updated);
      setInitialCollections(initialCollections.filter((_, i) => i !== idx));
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

  // Targeted Single-Collection Save: Saves ONLY the edited collection to Appwrite
  const handleSaveSingle = async (idx: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const col = collections[idx];
    if (!col) return;

    if (!col.name?.trim()) {
      await showAlert({
        title: 'Validation Error',
        message: 'Collection title is required.',
        variant: 'warning'
      });
      return;
    }

    if (!col.slug?.trim()) {
      await showAlert({
        title: 'Validation Error',
        message: 'Collection URL slug is required.',
        variant: 'warning'
      });
      return;
    }

    const originalCol =
      initialCollections[idx] ||
      initialCollections.find((c) => (col.id && c.id === col.id) || (c.slug && c.slug === col.slug));

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
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create collection in Appwrite');
        }
        savedDoc = await res.json();
      }

      // Only after database persistence succeeds, clean up replaced images from Appwrite Storage
      if (originalCol) {
        if (originalCol.image && originalCol.image !== col.image) {
          deleteMediaFromAppwrite(originalCol.image).catch(() => {});
        }
        if (originalCol.bannerImage && originalCol.bannerImage !== col.bannerImage) {
          deleteMediaFromAppwrite(originalCol.bannerImage).catch(() => {});
        }
      }

      const updatedId = savedDoc && savedDoc.id ? savedDoc.id : col.id;
      const updatedCol = { ...col, id: updatedId };

      const updatedList = [...collections];
      updatedList[idx] = updatedCol;
      setCollections(updatedList);

      const updatedInitials = [...initialCollections];
      updatedInitials[idx] = JSON.parse(JSON.stringify(updatedCol));
      setInitialCollections(updatedInitials);

      queryClient.invalidateQueries({ queryKey: queryKeys.collections });

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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Collections & Landing Banners</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage top hero lifestyle banners, story circles, and editorial copy for Gender (For Him / For Her) and Story collections.
          </p>
        </div>

        {activeTab === 'story' && (
          <button
            type="button"
            onClick={handleAddCollection}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Collection</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'story'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Story Collections ({collections.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gender')}
          className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'gender'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#caa04c]" />
          <span>Gender & Categories ({genderPages.length})</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-600">Loading collections...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 mx-auto flex items-center justify-center text-red-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Failed to Load Collections</h3>
          <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={loadCollections}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && collections.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#faf9f6] border border-amber-200/80 mx-auto flex items-center justify-center text-[#caa04c]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">No Collections Created</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are currently no collections created. Create your first luxury collection above.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCollection}
            className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Create First Collection
          </button>
        </div>
      )}

      {/* Tab 1: Story Collections List */}
      {activeTab === 'story' && !isLoading && !error && (
        <>
          {collections.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#faf9f6] border border-amber-200/80 mx-auto flex items-center justify-center text-[#caa04c]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">No Collections Created</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There are currently no collections created. Create your first luxury collection above.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCollection}
                className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Create First Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {collections.map((item, idx) => {
                const isExpanded = activeEditIndex === idx;
                const isSavingThis = savingIndex === idx;
                const isSavedSuccess = savedSuccessIndex === idx;

                return (
                  <div
                    key={item.id || item.slug || idx}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setActiveEditIndex(isExpanded ? null : idx)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-[#d6a750] p-0.5 shrink-0 overflow-hidden bg-slate-100 shadow-2xs flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                            <span className="text-[11px] font-sans font-semibold text-slate-400">({item.subname || 'Collection'})</span>
                            {item.slug && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                                /collections/{item.slug}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.subtitle || 'No subtitle set'}</p>
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
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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
                              value={item.subname || ''}
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
                              label="Upload High-Res Banner"
                              value={item.bannerImage || ''}
                              onChange={(url) => handleUpdate(idx, 'bannerImage', url)}
                              helperText="Recommended: 1920x1080 (16:9) lifestyle photography shown at the top of the collection page."
                            />
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                            <span className="font-bold text-slate-800 block">2. Homepage Story Circle Thumbnail (1:1 Square)</span>
                            <MediaUploader
                              label="Upload Story Circle Thumbnail"
                              value={item.image || ''}
                              onChange={(url) => handleUpdate(idx, 'image', url)}
                              helperText="Recommended: 400x400 (1:1) square icon thumbnail for the homepage circular stories."
                            />
                          </div>
                        </div>

                        {/* Individual Save Button */}
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
          )}
        </>
      )}

      {/* Tab 2: Gender & Category Landing Pages (For Him, For Her, Unisex, Gift Sets, Discovery) */}
      {activeTab === 'gender' && !isLoading && (
        <div className="space-y-6">
          <div className="bg-[#faf9f6] p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-[#caa04c] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Storefront Gender & Category Landing Banners</h3>
                <p className="text-xs text-slate-600">
                  Upload top hero images (16:9 on mobile / widescreen on desktop) and customize the editorial story for core target pages.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {genderPages.map((page) => {
              const isSaving = savingGenderSlug === page.slug;
              const isSaved = savedGenderSlug === page.slug;

              return (
                <div
                  key={page.slug}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-sm">
                        {page.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{page.name}</h4>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold font-mono">
                            {page.subname}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Route: /collections/{page.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <Link
                        href={`/collections/${page.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>View Page</span>
                      </Link>

                      {isSaved && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Saved</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Landing Page Title *</label>
                      <input
                        type="text"
                        value={page.name}
                        onChange={(e) => handleUpdateGenderPage(page.slug!, 'name', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gold Badge Header</label>
                      <input
                        type="text"
                        value={page.badge || ''}
                        onChange={(e) => handleUpdateGenderPage(page.slug!, 'badge', e.target.value)}
                        placeholder="e.g. HOMME & NOIR COLLECTION"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tagline / Short Subtitle</label>
                    <input
                      type="text"
                      value={page.subtitle || ''}
                      onChange={(e) => handleUpdateGenderPage(page.slug!, 'subtitle', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Editorial Narrative (The story paragraph displayed below the top banner image)
                    </label>
                    <textarea
                      rows={3}
                      value={page.editorial || ''}
                      onChange={(e) => handleUpdateGenderPage(page.slug!, 'editorial', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Hero Media Uploaders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-900 block">1. Top Hero Lifestyle Banner (16:9 Mobile / Landscape Desktop) *</span>
                      <MediaUploader
                        label="Top Hero Banner Image"
                        value={page.bannerImage || ''}
                        onChange={(url) => handleUpdateGenderPage(page.slug!, 'bannerImage', url)}
                        helperText="The hero lifestyle photography displayed at the top of this collection page."
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-900 block">2. Campaign Thumbnail / Story Circle (Optional)</span>
                      <MediaUploader
                        label="Square Campaign Image"
                        value={page.image || ''}
                        onChange={(url) => handleUpdateGenderPage(page.slug!, 'image', url)}
                        helperText="Used on homepage campaign cards and story circles."
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveGenderLandingPage(page.slug!)}
                      className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving &quot;{page.name}&quot;...</span>
                        </>
                      ) : (
                        <span>Save &quot;{page.name}&quot; Banner & Story</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
