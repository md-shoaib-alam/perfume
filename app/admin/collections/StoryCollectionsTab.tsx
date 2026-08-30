'use client';

import React from 'react';
import { CollectionItem } from './types';
import { MediaUploader } from '../../components/MediaUploader';

interface StoryCollectionsTabProps {
  collections: CollectionItem[];
  activeEditIndex: number | null;
  savingIndex: number | null;
  savedSuccessIndex: number | null;
  onToggleExpand: (index: number) => void;
  onUpdate: (index: number, field: keyof CollectionItem, value: any) => void;
  onSaveSingle: (index: number, e?: React.FormEvent) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  onAddCollection: () => void;
}

export const StoryCollectionsTab: React.FC<StoryCollectionsTabProps> = ({
  collections,
  activeEditIndex,
  savingIndex,
  savedSuccessIndex,
  onToggleExpand,
  onUpdate,
  onSaveSingle,
  onDelete,
  onAddCollection,
}) => {
  if (collections.length === 0) {
    return (
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
          onClick={onAddCollection}
          className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
        >
          Create First Collection
        </button>
      </div>
    );
  }

  return (
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
              onClick={() => onToggleExpand(idx)}
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
                    onDelete(idx);
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
                      onChange={(e) => onUpdate(idx, 'name', e.target.value)}
                      placeholder="e.g. Pour Femme"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subname / Category Tag</label>
                    <input
                      type="text"
                      value={item.subname || ''}
                      onChange={(e) => onUpdate(idx, 'subname', e.target.value)}
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
                      onChange={(e) => onUpdate(idx, 'slug', e.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
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
                    onChange={(e) => onUpdate(idx, 'subtitle', e.target.value)}
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
                    onChange={(e) => onUpdate(idx, 'editorial', e.target.value)}
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
                      onChange={(url) => onUpdate(idx, 'bannerImage', url)}
                      helperText="Recommended: 1920x1080 (16:9) lifestyle photography shown at the top of the collection page."
                    />
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-800 block">2. Homepage Story Circle Thumbnail (1:1 Square)</span>
                    <MediaUploader
                      label="Upload Story Circle Thumbnail"
                      value={item.image || ''}
                      onChange={(url) => onUpdate(idx, 'image', url)}
                      helperText="Recommended: 400x400 (1:1) square icon thumbnail for the homepage circular stories."
                    />
                  </div>
                </div>

                {/* Individual Save Button */}
                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={isSavingThis}
                    onClick={() => onSaveSingle(idx)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-medium text-xs rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingThis ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving {item.name}...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save {item.name} Collection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
