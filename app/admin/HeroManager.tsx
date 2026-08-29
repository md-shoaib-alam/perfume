'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { HeroSlide } from '../types';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';

export const HeroManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { showConfirm, showAlert } = useConfirm();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [initialSlides, setInitialSlides] = useState<HeroSlide[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSlides = async () => {
    try {
      const data = await api.getHeroSlides();
      if (data && data.length > 0) {
        setSlides(data);
        setInitialSlides(JSON.parse(JSON.stringify(data)));
        queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
        return;
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const currentSlide: HeroSlide = slides[activeSlideIdx] || slides[0] || {
    id: '',
    name: 'New Slide',
    desktopImage: '',
    mobileImage: '',
    linkUrl: '#bestsellers'
  };

  const handleUpdateCurrent = (field: keyof HeroSlide, val: string | number) => {
    const updated = [...slides];
    if (updated[activeSlideIdx]) {
      updated[activeSlideIdx] = { ...updated[activeSlideIdx], [field]: val };
      setSlides(updated);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // 1. Perform database persistence first
      for (const slide of slides) {
        await api.saveHeroSlide(slide);
      }

      // 2. Only after database persistence succeeds, clean up replaced images from Appwrite Storage
      initialSlides.forEach((orig) => {
        const matchingCurrent = slides.find((s) => (orig.id && s.id === orig.id) || s.name === orig.name);
        if (matchingCurrent) {
          if (orig.desktopImage && orig.desktopImage !== matchingCurrent.desktopImage) {
            deleteMediaFromAppwrite(orig.desktopImage).catch(() => {});
          }
          if (orig.mobileImage && orig.mobileImage !== matchingCurrent.mobileImage) {
            deleteMediaFromAppwrite(orig.mobileImage).catch(() => {});
          }
        }
      });

      await loadSlides();
      window.dispatchEvent(new Event('neesh_hero_updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Slides',
        message: `Failed to save slides: ${err.message}`,
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = async () => {
    const newSlide: HeroSlide = {
      id: '',
      name: `Promo Banner ${slides.length + 1}`,
      desktopImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      linkUrl: '#bestsellers'
    };
    try {
      await api.saveHeroSlide(newSlide);
      await loadSlides();
      setActiveSlideIdx(slides.length);
    } catch (e: any) {
      await showAlert({
        title: 'Error Adding Slide',
        message: `Failed to add slide: ${e.message}`,
        variant: 'danger'
      });
    }
  };

  const handleDeleteSlide = async (idx: number) => {
    if (slides.length <= 1) {
      await showAlert({
        title: 'Cannot Delete Slide',
        message: 'You must keep at least one hero slide in your carousel.',
        variant: 'warning'
      });
      return;
    }
    const confirmed = await showConfirm({
      title: 'Delete Hero Slide',
      message: 'Are you sure you want to delete this hero banner slide?',
      confirmText: 'Delete Slide',
      variant: 'danger'
    });
    if (!confirmed) return;

    const slideToDelete = slides[idx];
    try {
      if (slideToDelete?.id) {
        await api.deleteHeroSlide(slideToDelete.id);
      }
      
      // Clean up orphaned storage media only AFTER persistence succeeds
      if (slideToDelete?.desktopImage) deleteMediaFromAppwrite(slideToDelete.desktopImage).catch(() => {});
      if (slideToDelete?.mobileImage) deleteMediaFromAppwrite(slideToDelete.mobileImage).catch(() => {});

      await loadSlides();
      setActiveSlideIdx(Math.max(0, idx - 1));
    } catch (err: any) {
      await showAlert({
        title: 'Error Deleting Slide',
        message: `Failed to delete slide: ${err.message}`,
        variant: 'danger'
      });
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 relative">
      
      {/* Floating Save Success Toast Notification */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#d6a750]/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Hero Carousel Saved Live!</p>
            <p className="text-[11px] text-slate-300">All banner slides are synchronized with Appwrite</p>
          </div>
        </div>
      )}

      {/* Top Banner Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-slate-900">Hero Carousel Banners</h2>
            <span className="px-2.5 py-0.5 bg-[#c59b48]/15 text-[#b58b38] text-[10px] font-bold rounded-full">
              Desktop & Mobile Dual Images
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload or configure full-bleed banner images for Desktop (16:9) and Mobile with destination click URLs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {saved && (
            <span className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved Live</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleAddSlide}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
          >
            <span>+</span>
            <span>Add Banner</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={loading}
            className="px-5 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save All Slides</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slide Tabs Selector (Full Width above Editor & Preview) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {slides.map((s, idx) => (
          <div key={s.id || idx} className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveSlideIdx(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                activeSlideIdx === idx
                  ? 'bg-[#d6a750] text-white shadow-md shadow-[#d6a750]/25'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>Slide {idx + 1}: {s.name}</span>
              {slides.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(idx);
                  }}
                  className="w-4 h-4 rounded-full bg-white/30 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Remove Slide"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 2-Column Responsive Layout: Left = Configure Slide Form, Right = Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Configure Slide Form (7 Columns) */}
        <div className="lg:col-span-7">
          {/* Slide Editor Form */}
          <form onSubmit={handleSave} className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Configure Slide #{activeSlideIdx + 1}: {currentSlide.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Pure Image Banner</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Banner Reference Name *</label>
              <input
                type="text"
                required
                value={currentSlide.name}
                onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                placeholder="e.g. Haute Vetiver Launch Campaign"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            {/* Media Uploaders */}
            <div className="space-y-4">
              <MediaUploader
                label="Desktop Banner Image (16:9 Landscape - Min 1920x1080) *"
                value={currentSlide.desktopImage || ''}
                onChange={(url) => handleUpdateCurrent('desktopImage', url)}
                helperText="Appwrite Cloud Storage uploaded high-res landscape banner for laptops and desktops."
              />

              <MediaUploader
                label="Mobile Portrait Banner Image (9:16 Vertical - Min 1080x1920)"
                value={currentSlide.mobileImage || ''}
                onChange={(url) => handleUpdateCurrent('mobileImage', url)}
                helperText="Crisp portrait banner tailored for smartphone screens. (Falls back to desktop if omitted)."
              />
            </div>

            {/* Link & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Click Action / Target URL</label>
                <input
                  type="text"
                  value={currentSlide.linkUrl || ''}
                  onChange={(e) => handleUpdateCurrent('linkUrl', e.target.value)}
                  placeholder="e.g. /products/haute-vetiver or #bestsellers"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={currentSlide.position || 0}
                  onChange={(e) => handleUpdateCurrent('position', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {saved && (
                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Changes Saved Successfully!</span>
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save All Banner Slides</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Sticky Live Preview Panel (5 Columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Banner Preview
                </h3>
                <span className="text-[11px] text-slate-400">
                  Target: <span className="font-mono text-[#c59b48] font-bold">{currentSlide.linkUrl || '#'}</span>
                </span>
              </div>

              {/* Desktop / Mobile Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewMode === 'desktop'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    previewMode === 'mobile'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Live Preview Display Box - Pure Light Luxury Canvas */}
            <div className="flex justify-center bg-[#faf9f6] border border-amber-200/60 p-4 sm:p-6 rounded-2xl overflow-hidden relative shadow-inner">
              {previewMode === 'desktop' ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden relative border-2 border-slate-200 shadow-lg bg-white flex items-center justify-center">
                  {currentSlide.desktopImage ? (
                    <img
                      src={currentSlide.desktopImage}
                      alt="Desktop Banner Preview"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                      <svg className="w-7 h-7 mb-1.5 opacity-40 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>No Desktop Image Configured</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    16:9 Desktop View
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[220px] aspect-9/16 rounded-2xl overflow-hidden relative border-4 border-slate-300 shadow-xl bg-white flex items-center justify-center">
                  {(currentSlide.mobileImage || currentSlide.desktopImage) ? (
                    <img
                      src={currentSlide.mobileImage || currentSlide.desktopImage}
                      alt="Mobile Banner Preview"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                      <svg className="w-7 h-7 mb-1.5 opacity-40 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>No Mobile Image Configured</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    Mobile View
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
