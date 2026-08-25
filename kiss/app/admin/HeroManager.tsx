'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

export interface HeroSlide {
  id: string;
  name: string;
  desktopImage: string;
  mobileImage: string;
  linkUrl: string;
}

export const HeroManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSlides = async () => {
    try {
      const data = await api.getHeroSlides();
      if (data && data.length > 0) {
        setSlides(data);
        return;
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const currentSlide = slides[activeSlideIdx] || slides[0] || {
    id: '',
    name: 'New Slide',
    desktopImage: '',
    mobileImage: '',
    linkUrl: '#catalog'
  };

  const handleUpdateCurrent = (field: keyof HeroSlide, val: string) => {
    const updated = [...slides];
    if (updated[activeSlideIdx]) {
      updated[activeSlideIdx] = { ...updated[activeSlideIdx], [field]: val };
      setSlides(updated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentSlide) {
        await api.saveHeroSlide(currentSlide);
      }
      await loadSlides();
      window.dispatchEvent(new Event('neesh_hero_updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Slide',
        message: `Failed to save slide: ${err.message}`,
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
    if (slideToDelete?.id && !slideToDelete.id.startsWith('slide-')) {
      await api.deleteHeroSlide(slideToDelete.id);
    }
    await loadSlides();
    setActiveSlideIdx(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans pb-10">
      
      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-slate-900">Hero Carousel Banners</h2>
            <span className="px-2.5 py-0.5 bg-[#c59b48]/15 text-[#b58b38] text-[10px] font-bold rounded-full">
              Desktop & Mobile Dual Images
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload or configure full-bleed banner images for Desktop (16:9) and Mobile, with destination click URLs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in-up">
              ✓ Carousel Saved Live
            </span>
          )}
          <button
            type="button"
            onClick={handleAddSlide}
            className="px-4 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Slide Tabs Swiper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {slides.map((s, idx) => (
          <div key={s.id} className="flex items-center shrink-0">
            <button
              onClick={() => setActiveSlideIdx(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                activeSlideIdx === idx
                  ? 'bg-slate-900 text-[#d6a750] shadow-md shadow-slate-900/10 border border-slate-800'
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
                  className="w-4 h-4 rounded-full bg-slate-700/40 hover:bg-red-500 text-white flex items-center justify-center text-[9px] cursor-pointer"
                  title="Remove Slide"
                >
                  ✕
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Live Preview Section with Desktop/Mobile Switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Banner Preview
            </h3>
            <span className="text-[11px] text-slate-400">
              Clicking banner opens: <span className="font-mono text-[#c59b48] font-bold">{currentSlide.linkUrl || '#'}</span>
            </span>
          </div>

          {/* Desktop / Mobile Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                previewMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Desktop (16:9)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                previewMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Mobile Banner</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex justify-center bg-slate-950 p-4 sm:p-8 rounded-2xl overflow-hidden relative shadow-inner">
          {previewMode === 'desktop' ? (
            <div className="w-full aspect-[16/9] max-w-4xl rounded-xl overflow-hidden relative border border-slate-800 shadow-2xl bg-black group flex items-center justify-center">
              {currentSlide.desktopImage ? (
                <img
                  src={currentSlide.desktopImage}
                  alt="Desktop Banner Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 text-xs">
                  <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>No Desktop Image Configured</span>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
                Desktop 16:9 View
              </div>

              {/* Dots in preview */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`transition-all duration-300 ${
                      idx === activeSlideIdx
                        ? 'w-3 h-3 rounded-full border-2 border-white bg-transparent'
                        : 'w-1.5 h-1.5 rounded-full bg-white opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden relative border-4 border-slate-800 shadow-2xl bg-black group flex items-center justify-center">
              {(currentSlide.mobileImage || currentSlide.desktopImage) ? (
                <img
                  src={currentSlide.mobileImage || currentSlide.desktopImage}
                  alt="Mobile Banner Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 text-xs">
                  <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>No Mobile Image Configured</span>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
                Mobile View
              </div>

              {/* Dots in preview */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`transition-all duration-300 ${
                      idx === activeSlideIdx
                        ? 'w-3 h-3 rounded-full border-2 border-white bg-transparent'
                        : 'w-1.5 h-1.5 rounded-full bg-white opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Editor Form */}
      <form onSubmit={handleSave} className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-serif font-bold text-base text-slate-900">
            Configure Slide #{activeSlideIdx + 1}: {currentSlide.name}
          </h3>
          <span className="text-[11px] text-slate-400">Pure Image Banner (Zero Overlays)</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <MediaUploader
            label="🖥️ Desktop Banner Image (16:9 / Widescreen) *"
            value={currentSlide.desktopImage || ''}
            onChange={(url) => handleUpdateCurrent('desktopImage', url)}
            helperText="High-resolution widescreen banner for desktops and tablets."
          />

          <MediaUploader
            label="📱 Mobile Banner Image (Vertical Orientation) *"
            value={currentSlide.mobileImage || ''}
            onChange={(url) => handleUpdateCurrent('mobileImage', url)}
            helperText="Vertical mobile optimized banner image."
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            🔗 Click Target Destination URL / Link
          </label>
          <input
            type="text"
            value={currentSlide.linkUrl}
            onChange={(e) => handleUpdateCurrent('linkUrl', e.target.value)}
            placeholder="#bestsellers or /product/1 or https://..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#d6a750]"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            When any customer taps or clicks anywhere on this banner, they will be taken to this URL.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Save All Banner Slides
          </button>
        </div>
      </form>

    </div>
  );
};
