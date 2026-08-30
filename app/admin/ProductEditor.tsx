'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ProductStoryBlock, ProductSizeOption } from '../types';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

interface ProductEditorProps {
  editingProduct: Product | null;
  initialData: Partial<Product>;
  availableCategories: { slug: string; name: string }[];
  collectionOptions: { slug: string; name: string }[];
  onClose: () => void;
  onSaveSuccess: () => Promise<void>;
  onOpenCategoryManager: () => void;
}

export function ProductEditor({
  editingProduct,
  initialData,
  availableCategories,
  collectionOptions,
  onClose,
  onSaveSuccess,
  onOpenCategoryManager,
}: ProductEditorProps) {
  const { showAlert } = useConfirm();
  const [formData, setFormData] = useState<Partial<Product>>(initialData);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    if (initialData.category && !availableCategories.some((c) => c.slug === initialData.category)) {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }
  }, [initialData, availableCategories]);

  // Derive extra showcase gallery media list
  const extraMediaList: string[] = React.useMemo(() => {
    if (!formData.hoverImage) return [];
    try {
      const parsed = JSON.parse(formData.hoverImage);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not a json array
    }
    return [];
  }, [formData.hoverImage]);

  const handleSaveGalleryMedia = (newUrl: string) => {
    if (!newUrl) return;
    const currentList = [...extraMediaList, newUrl];
    setFormData((prev) => ({
      ...prev,
      hoverImage: JSON.stringify(currentList),
    }));
  };

  const handleDeleteGalleryMedia = (urlToRemove: string) => {
    deleteMediaFromAppwrite(urlToRemove).catch(() => {});
    const currentList = extraMediaList.filter((u) => u !== urlToRemove);
    setFormData((prev) => ({
      ...prev,
      hoverImage: currentList.length > 0 ? JSON.stringify(currentList) : '',
    }));
  };

  // Size Options Handlers
  const handleAddSizeOption = () => {
    const current = formData.sizeOptions || [];
    setFormData({
      ...formData,
      sizeOptions: [
        ...current,
        { size: '50ml', price: formData.price || 0, originalPrice: formData.originalPrice || 0, isSoldOut: false },
      ],
    });
  };

  const handleRemoveSizeOption = (index: number) => {
    const current = formData.sizeOptions || [];
    setFormData({
      ...formData,
      sizeOptions: current.filter((_, i) => i !== index),
    });
  };

  const handleUpdateSizeOption = (
    index: number,
    field: keyof ProductSizeOption,
    value: any
  ) => {
    const current = [...(formData.sizeOptions || [])];
    if (!current[index]) return;
    current[index] = { ...current[index], [field]: value };
    setFormData({
      ...formData,
      sizeOptions: current,
      ...(index === 0 && field === 'price' ? { price: Number(value) } : {}),
      ...(index === 0 && field === 'originalPrice' ? { originalPrice: Number(value) } : {}),
      ...(index === 0 && field === 'size' ? { volume: String(value) } : {}),
    });
  };

  // Olfactory Notes Handlers
  const handleAddNote = (
    type: 'top' | 'heart' | 'base',
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (!val) return;
      const current = formData.notes || { top: [], heart: [], base: [] };
      setFormData({
        ...formData,
        notes: {
          ...current,
          [type]: [...(current[type] || []), val],
        },
      });
      e.currentTarget.value = '';
    }
  };

  const handleRemoveNote = (type: 'top' | 'heart' | 'base', index: number) => {
    const current = formData.notes || { top: [], heart: [], base: [] };
    setFormData({
      ...formData,
      notes: {
        ...current,
        [type]: (current[type] || []).filter((_, i) => i !== index),
      },
    });
  };

  // Story Blocks Handlers
  const handleAddStoryBlock = () => {
    const current = formData.storyBlocks || [];
    if (current.length >= 10) return;
    setFormData({
      ...formData,
      storyBlocks: [
        ...current,
        { image: '', title: '', subtitle: '', description: '', content: '' },
      ],
    });
  };

  const handleRemoveStoryBlock = (index: number) => {
    const current = formData.storyBlocks || [];
    const blockToRemove = current[index];
    if (blockToRemove?.image) {
      deleteMediaFromAppwrite(blockToRemove.image).catch(() => {});
    }
    setFormData({
      ...formData,
      storyBlocks: current.filter((_, i) => i !== index),
    });
  };

  const handleUpdateStoryBlock = (
    index: number,
    field: keyof ProductStoryBlock,
    value: string
  ) => {
    const current = [...(formData.storyBlocks || [])];
    if (!current[index]) return;
    current[index] = { ...current[index], [field]: value };
    if (field === 'description') {
      current[index].content = value;
    } else if (field === 'content') {
      current[index].description = value;
    }
    setFormData({
      ...formData,
      storyBlocks: current,
    });
  };

  const getProductSlug = (p: Product) => {
    return p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || formData.price === undefined || formData.price === null) {
      await showAlert({
        title: 'Missing Required Fields',
        message: 'Please fill fragrance name and price.',
        variant: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        // 1. Database persistence
        await api.updateProduct(editingProduct.id, formData);

        // 2. Storage cleanup for replaced media
        if (editingProduct.image && editingProduct.image !== formData.image) {
          deleteMediaFromAppwrite(editingProduct.image).catch(() => {});
        }
        if (editingProduct.hoverImage && editingProduct.hoverImage !== formData.hoverImage) {
          deleteMediaFromAppwrite(editingProduct.hoverImage).catch(() => {});
        }
        if (editingProduct.storyBlocks && editingProduct.storyBlocks.length > 0) {
          const newStoryImages = new Set(
            (formData.storyBlocks || []).map((b) => b.image).filter(Boolean)
          );
          editingProduct.storyBlocks.forEach((oldBlock) => {
            if (
              oldBlock.image &&
              !newStoryImages.has(oldBlock.image) &&
              oldBlock.image !== formData.image &&
              oldBlock.image !== formData.hoverImage
            ) {
              deleteMediaFromAppwrite(oldBlock.image).catch(() => {});
            }
          });
        }
      } else {
        await api.createProduct(formData);
      }

      await onSaveSuccess();
      onClose();
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Fragrance',
        message: `Failed to save fragrance: ${err.message}`,
        variant: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#faf9f6] overflow-y-auto font-sans">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Fragrance Catalog</span>
            </button>
            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Fragrance'}
              </h3>
              {editingProduct && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-900">
                  ID: {editingProduct.id}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {editingProduct && (
              <a
                href={`/products/${getProductSlug(editingProduct)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#c59b48]/10 hover:bg-[#c59b48]/20 text-[#916618] font-bold text-xs rounded-xl border border-[#c59b48]/30 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Preview live product page"
              >
                <svg className="w-3.5 h-3.5 text-[#916618]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Preview Storefront</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSave(e as any)}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{isSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Fragrance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Page Editor Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Card 1: Basic Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                <span>1. Fragrance Details & Categorization</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fragrance Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Haute Vetiver"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Collection / Story Line</label>
                {collectionOptions.length > 0 ? (
                  <select
                    value={formData.collection || ''}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">None / Standalone</option>
                    {collectionOptions.map((col) => (
                      <option key={col.slug} value={col.slug}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.collection || ''}
                      onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                      placeholder="e.g. signature-line, attar-collection"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">No collection</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Product Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 shrink-0">
                    {availableCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) {
                            setFormData({ ...formData, category: '' });
                          } else {
                            setFormData({ ...formData, category: availableCategories[0]?.slug || '' });
                          }
                        }}
                        className="text-[10.5px] text-[#916618] hover:underline font-bold cursor-pointer whitespace-nowrap"
                      >
                        {isCustomCategory ? '← Choose Category' : '+ Custom Category'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onOpenCategoryManager}
                      className="text-[10.5px] text-slate-500 hover:text-slate-900 font-semibold cursor-pointer underline whitespace-nowrap"
                    >
                      Manage All
                    </button>
                  </div>
                </div>
                {availableCategories.length === 0 || isCustomCategory ? (
                  <div>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Extrait De Parfum, Attar, Gift Set"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                      required
                    />
                    {availableCategories.length === 0 && (
                      <p className="text-[10px] text-slate-400 mt-1">No category</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.category || availableCategories[0]?.slug || ''}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: e.target.value as any });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__custom__">+ Add New Custom Category...</option>
                  </select>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Target Gender <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    href="/admin/collections"
                    target="_blank"
                    className="text-[10.5px] text-[#caa04c] hover:underline font-bold cursor-pointer whitespace-nowrap"
                    title="Manage landing page hero banners for For Him, For Her, Unisex, and Gift Sets"
                  >
                    Manage Banners ↗
                  </Link>
                </div>
                <select
                  value={formData.gender || 'For Him'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="For Him">For Him (Men)</option>
                  <option value="For Her">For Her (Women)</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Gift Sets">Gift Sets</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Concentration / Notes Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Extrait De Parfum • Fresh, Earthy, Woody"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Volume Sizes & Pricing Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                  <span>2. Volume Sizes & Pricing Matrix</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Configure bottle volumes (15ml, 50ml, 100ml), individual prices, and stock availability.</p>
              </div>
              <button
                type="button"
                onClick={handleAddSizeOption}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-medium text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 whitespace-nowrap transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Size Variant</span>
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {formData.sizeOptions?.map((opt, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:flex sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                  <div className="col-span-1 sm:w-32">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Volume Size</label>
                    <input
                      type="text"
                      value={opt.size}
                      onChange={(e) => handleUpdateSizeOption(idx, 'size', e.target.value)}
                      placeholder="e.g. 100ml"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>

                  <div className="col-span-1 sm:w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={opt.price}
                      onChange={(e) => handleUpdateSizeOption(idx, 'price', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>

                  <div className="col-span-1 sm:w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Original MRP (₹)</label>
                    <input
                      type="number"
                      value={opt.originalPrice || 0}
                      onChange={(e) => handleUpdateSizeOption(idx, 'originalPrice', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-between sm:pt-4 sm:ml-auto gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!opt.isSoldOut}
                        onChange={(e) => handleUpdateSizeOption(idx, 'isSoldOut', !e.target.checked)}
                        className="rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs font-bold ${!opt.isSoldOut ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {!opt.isSoldOut ? 'In Stock' : 'Sold Out'}
                      </span>
                    </label>

                    {formData.sizeOptions && formData.sizeOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove size option"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Media Uploaders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                <span>3. Fragrance Photography & Media</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Upload high-definition product bottle images and hover showcase visuals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Main Product Image *</span>
                <MediaUploader
                  label="Main Bottle Image"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  helperText="High-res front product bottle shot."
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Hover Secondary Image</span>
                <MediaUploader
                  label="Hover Showcase Image"
                  value={formData.hoverImage || ''}
                  onChange={(url) => setFormData({ ...formData, hoverImage: url })}
                  helperText="Atmospheric lifestyle or box composition shown on hover."
                />
              </div>
            </div>

            {/* Extra Showcase Gallery for Editing */}
            {editingProduct && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Additional Showcase Gallery Photos</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload additional angles, lifestyle imagery, and unboxing photography for the product carousel.
                  </p>
                </div>

                {extraMediaList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {extraMediaList.map((mediaUrl: string, idx: number) => (
                      <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                        <img
                          src={mediaUrl}
                          alt={`Showcase ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryMedia(mediaUrl)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Delete this image"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-mono rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <MediaUploader
                    label="Add Photo to Showcase Gallery"
                    value=""
                    onChange={(url) => {
                      if (url) {
                        handleSaveGalleryMedia(url);
                      }
                    }}
                    helperText="Upload additional packaging or bottle photos. Saved to Appwrite Storage and linked to fragrance."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Olfactory Pyramid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                <span>4. Olfactory Pyramid (Notes Architecture)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Define top, heart, and base notes. Type a note name and press Enter.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Top Notes (Opening)</label>
                <div className="flex flex-wrap gap-1.5 min-h-9 bg-white p-2 rounded-lg border border-slate-200">
                  {formData.notes?.top.map((note, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      {note}
                      <button
                        type="button"
                        onClick={() => handleRemoveNote('top', idx)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add note + Enter"
                  onKeyDown={(e) => handleAddNote('top', e)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Heart Notes (Body)</label>
                <div className="flex flex-wrap gap-1.5 min-h-9 bg-white p-2 rounded-lg border border-slate-200">
                  {formData.notes?.heart.map((note, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      {note}
                      <button
                        type="button"
                        onClick={() => handleRemoveNote('heart', idx)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add note + Enter"
                  onKeyDown={(e) => handleAddNote('heart', e)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Base Notes (Dry-down)</label>
                <div className="flex flex-wrap gap-1.5 min-h-9 bg-white p-2 rounded-lg border border-slate-200">
                  {formData.notes?.base.map((note, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      {note}
                      <button
                        type="button"
                        onClick={() => handleRemoveNote('base', idx)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add note + Enter"
                  onKeyDown={(e) => handleAddNote('base', e)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Narrative Description */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                <span>5. Olfactory Story & Description</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Write a poetic narrative detailing the character, longevity, and inspiration.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fragrance Description</label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the mood, ingredients, and olfactory character of this fragrance..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-serif"
              />
            </div>
          </div>

          {/* Card 6: Visual Storytelling Blocks (Hero Scroll Section) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                  <span>6. Product Story Blocks (Scroll Narrative)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add rich visual narrative blocks that display during page scroll on the live product showcase.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStoryBlock}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-medium text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 whitespace-nowrap transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Story Block</span>
              </button>
            </div>

            {(!formData.storyBlocks || formData.storyBlocks.length === 0) ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                No story blocks added yet. Click &quot;Add Story Block&quot; to build an immersive scroll journey.
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {formData.storyBlocks.map((block, bIdx) => (
                  <div key={bIdx} className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Story Block #{bIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStoryBlock(bIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove story block"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Headline / Title
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateStoryBlock(bIdx, 'title', e.target.value)}
                          placeholder="e.g. Crafted in Grasse, France"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Subtitle / Tagline
                        </label>
                        <input
                          type="text"
                          value={block.subtitle || ''}
                          onChange={(e) => handleUpdateStoryBlock(bIdx, 'subtitle', e.target.value)}
                          placeholder="e.g. Rare botanical maceration"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Narrative Content
                      </label>
                      <textarea
                        rows={3}
                        value={block.content || block.description || ''}
                        onChange={(e) => handleUpdateStoryBlock(bIdx, 'content', e.target.value)}
                        placeholder="Detailed prose describing the artisanal process, scent evolution, or rare notes..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Block Lifestyle Photo
                      </label>
                      <MediaUploader
                        label={`Story Block #${bIdx + 1} Image`}
                        value={block.image || ''}
                        onChange={(url) => handleUpdateStoryBlock(bIdx, 'image', url)}
                        helperText="High-res vertical or landscape visual matching this narrative segment."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 7: Badges & Inventory Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#caa04c]"></span>
                <span>7. Merchandising Badges & Stock Control</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isBestseller || false}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">Bestseller Badge</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isNew || false}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">New Release</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isPreOrder || false}
                  onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                  className="rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">Pre-Order Only</span>
              </label>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Stock Count</label>
                <input
                  type="number"
                  value={formData.stock ?? 100}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>

            {formData.isPreOrder && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shipping Note Text</label>
                  <input
                    type="text"
                    value={formData.shippingNote || ''}
                    onChange={(e) => setFormData({ ...formData, shippingNote: e.target.value })}
                    placeholder="e.g. Shipping Starts From 31st August"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText || 'PRE-ORDER'}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Submit Bar */}
          <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Cancel & Discard
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{isSaving ? 'Saving...' : editingProduct ? 'Save Fragrance Changes' : 'Publish Fragrance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
