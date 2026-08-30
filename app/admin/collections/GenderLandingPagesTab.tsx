'use client';

import React from 'react';
import Link from 'next/link';
import { CollectionItem } from './types';
import { MediaUploader } from '../../components/MediaUploader';

interface GenderLandingPagesTabProps {
  genderPages: CollectionItem[];
  activeGenderEditSlug: string | null;
  savingGenderSlug: string | null;
  savedGenderSlug: string | null;
  onToggleExpand: (slug: string) => void;
  onUpdatePage: (slug: string, field: keyof CollectionItem, value: any) => void;
  onSavePage: (slug: string) => Promise<void>;
  onResetPage: (slug: string) => Promise<void>;
}

export const GenderLandingPagesTab: React.FC<GenderLandingPagesTabProps> = ({
  genderPages,
  activeGenderEditSlug,
  savingGenderSlug,
  savedGenderSlug,
  onToggleExpand,
  onUpdatePage,
  onSavePage,
  onResetPage,
}) => {
  return (
    <div className="space-y-6">
      {/* Information Header */}
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

      {/* Pages List Accordion */}
      <div className="space-y-4">
        {genderPages.map((page) => {
          const isExpanded = activeGenderEditSlug === page.slug;
          const isSaving = savingGenderSlug === page.slug;
          const isSaved = savedGenderSlug === page.slug;

          return (
            <div
              key={page.slug}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Accordion Header Row */}
              <div
                onClick={() => onToggleExpand(page.slug!)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#d6a750] p-0.5 shrink-0 overflow-hidden bg-slate-100 shadow-2xs flex items-center justify-center">
                    {page.image || page.bannerImage ? (
                      <img
                        src={page.image || page.bannerImage}
                        alt={page.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-sm">
                        {page.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{page.name}</h4>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold font-mono">
                        {page.subname}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                        /collections/{page.slug}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{page.subtitle || 'No subtitle set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/collections/${page.slug}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="hidden sm:inline">View Page</span>
                  </Link>

                  {isSaved && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Saved</span>
                    </span>
                  )}

                  {page.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResetPage(page.slug!);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Reset to defaults"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

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

              {/* Expanded Edit Form */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-5 text-xs animate-fade-in-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Landing Page Title *</label>
                      <input
                        type="text"
                        value={page.name}
                        onChange={(e) => onUpdatePage(page.slug!, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gold Badge Header</label>
                      <input
                        type="text"
                        value={page.badge || ''}
                        onChange={(e) => onUpdatePage(page.slug!, 'badge', e.target.value)}
                        placeholder="e.g. HOMME & NOIR COLLECTION"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tagline / Short Subtitle</label>
                    <input
                      type="text"
                      value={page.subtitle || ''}
                      onChange={(e) => onUpdatePage(page.slug!, 'subtitle', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Editorial Narrative Story (Displayed below top banner on collection page)
                    </label>
                    <textarea
                      rows={3}
                      value={page.editorial || ''}
                      onChange={(e) => onUpdatePage(page.slug!, 'editorial', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#d6a750] transition-all"
                    />
                  </div>

                  {/* 3 Dedicated Media Uploaders */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* 1. Collection Top Hero Banner (16:9) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">1. Collection Top Hero Banner</span>
                        <span className="text-[10.5px] text-slate-500 block">16:9 horizontal image for top of /collections/{page.slug}</span>
                      </div>
                      <MediaUploader
                        label="Top Hero Banner (16:9)"
                        value={page.bannerImage || ''}
                        onChange={(url) => onUpdatePage(page.slug!, 'bannerImage', url)}
                        helperText="Recommended: 1920x1080 (16:9) horizontal lifestyle photo."
                      />
                    </div>

                    {/* 2. Homepage Campaign Card (4:5) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">2. Homepage Campaign Card</span>
                        <span className="text-[10.5px] text-slate-500 block">4:5 vertical portrait image for homepage campaign discover card</span>
                      </div>
                      <MediaUploader
                        label="Campaign Card (4:5)"
                        value={page.campaignImage || ''}
                        onChange={(url) => onUpdatePage(page.slug!, 'campaignImage', url)}
                        helperText="Recommended: 1080x1350 (4:5) vertical portrait photo."
                      />
                    </div>

                    {/* 3. Homepage Story Circle (1:1) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">3. Story Circle Thumbnail</span>
                        <span className="text-[10.5px] text-slate-500 block">1:1 square thumbnail for the circular stories bar</span>
                      </div>
                      <MediaUploader
                        label="Circle Thumbnail (1:1)"
                        value={page.image || ''}
                        onChange={(url) => onUpdatePage(page.slug!, 'image', url)}
                        helperText="Recommended: 600x600 (1:1) square product photo."
                      />
                    </div>
                  </div>

                  {/* Story Circle Inclusion Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">Show in Homepage Story Circles</span>
                      <span className="text-[11px] text-slate-500 block">
                        Display as a circular story on the storefront homepage.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input
                        type="checkbox"
                        checked={Boolean(page.showInStoryCircle)}
                        onChange={(e) => onUpdatePage(page.slug!, 'showInStoryCircle', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#caa04c]"></div>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => onSavePage(page.slug!)}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-medium text-xs rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving {page.name}...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save {page.name} Banner & Story</span>
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
    </div>
  );
};
