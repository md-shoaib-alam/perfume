'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { useConfirm } from '../components/CustomConfirmModal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';
import { CollectionItem, STANDARD_LANDING_PAGES, generateUniqueSlug } from './collections/types';
import { StoryCollectionsTab } from './collections/StoryCollectionsTab';
import { GenderLandingPagesTab } from './collections/GenderLandingPagesTab';

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
  const [initialGenderPages, setInitialGenderPages] = useState<CollectionItem[]>([]);
  const [savingGenderSlug, setSavingGenderSlug] = useState<string | null>(null);
  const [savedGenderSlug, setSavedGenderSlug] = useState<string | null>(null);
  const [activeGenderEditSlug, setActiveGenderEditSlug] = useState<string | null>(null);

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
              bannerImage: match.bannerImage || '',
              campaignImage: match.campaignImage || '',
              showInStoryCircle: Boolean(match.showInStoryCircle)
            };
          }
          return preset;
        });
        setGenderPages(mergedGenderPages);
        setInitialGenderPages(JSON.parse(JSON.stringify(mergedGenderPages)));
      } else {
        setCollections([]);
        setInitialCollections([]);
        setGenderPages(STANDARD_LANDING_PAGES);
        setInitialGenderPages(JSON.parse(JSON.stringify(STANDARD_LANDING_PAGES)));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collections from database.');
      setCollections([]);
      setInitialCollections([]);
      setGenderPages(STANDARD_LANDING_PAGES);
      setInitialGenderPages(JSON.parse(JSON.stringify(STANDARD_LANDING_PAGES)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleUpdate = (idx: number, field: keyof CollectionItem, val: any) => {
    const updated = [...collections];
    updated[idx] = { ...updated[idx], [field]: val };
    setCollections(updated);
  };

  const handleUpdateGenderPage = (slug: string, field: keyof CollectionItem, val: any) => {
    setGenderPages((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveGenderLandingPage = async (slug: string) => {
    const pageItem = genderPages.find((p) => p.slug === slug);
    if (!pageItem) return;

    const originalPage = initialGenderPages.find((p) => p.slug === slug);

    // Auto-delete old replaced media from Appwrite storage
    if (originalPage?.bannerImage && originalPage.bannerImage !== pageItem.bannerImage) {
      deleteMediaFromAppwrite(originalPage.bannerImage).catch(() => {});
    }
    if (originalPage?.campaignImage && originalPage.campaignImage !== pageItem.campaignImage) {
      deleteMediaFromAppwrite(originalPage.campaignImage).catch(() => {});
    }
    if (originalPage?.image && originalPage.image !== pageItem.image) {
      deleteMediaFromAppwrite(originalPage.image).catch(() => {});
    }

    const payload: any = {
      ...pageItem,
      image: pageItem.image || '',
      bannerImage: pageItem.bannerImage || '',
      campaignImage: pageItem.campaignImage || '',
      showInStoryCircle: Boolean(pageItem.showInStoryCircle)
    };

    setSavingGenderSlug(slug);
    try {
      if (pageItem.id) {
        await api.updateCollection(pageItem.id, payload);
      } else {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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

      setInitialGenderPages((prev) =>
        prev.map((p) => (p.slug === slug ? JSON.parse(JSON.stringify(pageItem)) : p))
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
      setSavedGenderSlug(slug);
      setTimeout(() => setSavedGenderSlug(null), 3000);

      await showAlert({
        title: 'Landing Page Saved',
        message: `Landing page settings and media for "${pageItem.name}" updated successfully.`,
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

  const handleResetGenderPage = async (slug: string) => {
    const pageItem = genderPages.find((p) => p.slug === slug);
    if (!pageItem) return;

    const confirmed = await showConfirm({
      title: 'Reset Landing Page',
      message: `Are you sure you want to reset "${pageItem.name}" to default? This will clear custom images and story text.`,
      confirmText: 'Reset',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      if (pageItem.id) {
        await fetch(`/api/collections?id=${pageItem.id}`, { method: 'DELETE' });
      }

      if (pageItem.image) deleteMediaFromAppwrite(pageItem.image).catch(() => {});
      if (pageItem.bannerImage) deleteMediaFromAppwrite(pageItem.bannerImage).catch(() => {});
      if (pageItem.campaignImage) deleteMediaFromAppwrite(pageItem.campaignImage).catch(() => {});

      const preset = STANDARD_LANDING_PAGES.find((p) => p.slug === slug);
      setGenderPages((prev) =>
        prev.map((p) =>
          p.slug === slug
            ? {
                ...(preset || p),
                id: undefined,
                image: '',
                bannerImage: '',
                campaignImage: '',
                showInStoryCircle: false
              }
            : p
        )
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.collections });

      await showAlert({
        title: 'Page Reset',
        message: `"${pageItem.name}" has been reset to defaults.`,
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Error Resetting Page',
        message: err.message || 'Failed to reset page.',
        variant: 'danger'
      });
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

    const validImg = col.image && col.image.trim().startsWith('http') ? col.image.trim() : null;
    const validBanner = col.bannerImage && col.bannerImage.trim().startsWith('http') ? col.bannerImage.trim() : null;

    const payload: any = {
      ...col,
      image: validImg || validBanner || '',
      bannerImage: validBanner || validImg || ''
    };

    setSavingIndex(idx);
    try {
      let savedDoc: any;
      if (col.id) {
        savedDoc = await api.updateCollection(col.id, payload);
      } else {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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

      {/* Story Collections Tab */}
      {activeTab === 'story' && !isLoading && !error && (
        <StoryCollectionsTab
          collections={collections}
          activeEditIndex={activeEditIndex}
          savingIndex={savingIndex}
          savedSuccessIndex={savedSuccessIndex}
          onToggleExpand={(idx) => setActiveEditIndex(activeEditIndex === idx ? null : idx)}
          onUpdate={handleUpdate}
          onSaveSingle={handleSaveSingle}
          onDelete={handleDeleteCollection}
          onAddCollection={handleAddCollection}
        />
      )}

      {/* Gender & Categories Tab */}
      {activeTab === 'gender' && !isLoading && !error && (
        <GenderLandingPagesTab
          genderPages={genderPages}
          activeGenderEditSlug={activeGenderEditSlug}
          savingGenderSlug={savingGenderSlug}
          savedGenderSlug={savedGenderSlug}
          onToggleExpand={(slug) => setActiveGenderEditSlug(activeGenderEditSlug === slug ? null : slug)}
          onUpdatePage={handleUpdateGenderPage}
          onSavePage={handleSaveGenderLandingPage}
          onResetPage={handleResetGenderPage}
        />
      )}
    </div>
  );
};
