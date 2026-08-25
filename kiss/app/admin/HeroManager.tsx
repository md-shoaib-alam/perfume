'use client';
import React, { useState, useEffect } from 'react';

interface HeroSlide {
  id: string;
  badgeText: string;
  topTagline: string;
  title: string;
  subtitle: string;
  sourceQuote: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  bottleImage: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badgeText: 'VINTAGE HARVEST 2026',
    topTagline: 'ARGUABLY THE',
    title: 'LONGEST - LASTING',
    subtitle: 'FRESHIE ON THE PLANET',
    sourceQuote: '- Forbes',
    buttonText: 'SHOP NOW',
    buttonLink: '#bestsellers',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80',
    bottleImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'slide-2',
    badgeText: 'ROYAL ACCORD',
    topTagline: 'CRAFTED WITH PURE OUD',
    title: 'DARK CACAO NOIR',
    subtitle: 'EXTRAIT DE PARFUM 30%',
    sourceQuote: '- GQ India',
    buttonText: 'EXPLORE NOIR',
    buttonLink: '#catalog',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2000&q=80',
    bottleImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
  }
];

export const HeroManager: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('neesh_hero_slides');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((s: HeroSlide, i: number) => {
            if (s.image?.includes('1592945403244') || s.image?.includes('1594035910387')) {
              return { ...s, image: DEFAULT_SLIDES[i]?.image || DEFAULT_SLIDES[0].image };
            }
            return s;
          });
          setSlides(cleaned);
          return;
        }
      }
    } catch (e) {}
  }, []);

  const currentSlide = slides[activeSlideIdx] || slides[0] || DEFAULT_SLIDES[0];

  const handleUpdateCurrent = (field: keyof HeroSlide, val: string) => {
    const updated = [...slides];
    updated[activeSlideIdx] = {
      ...updated[activeSlideIdx],
      [field]: val
    };
    setSlides(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('neesh_hero_slides', JSON.stringify(slides));
    window.dispatchEvent(new Event('neesh_hero_updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      badgeText: 'NEW LAUNCH',
      topTagline: 'EXPERIENCE THE',
      title: 'HAUTE PERFUMERY',
      subtitle: 'EXCLUSIVE COLLECTION',
      sourceQuote: '- Vogue',
      buttonText: 'DISCOVER',
      buttonLink: '#catalog',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=2000&q=80',
      bottleImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIdx(updated.length - 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      alert('You must keep at least one hero slide.');
      return;
    }
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    setActiveSlideIdx(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans pb-10">
      
      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-slate-900">Hero Carousel Manager</h2>
            <span className="px-2.5 py-0.5 bg-[#c59b48]/15 text-[#b58b38] text-[10px] font-bold rounded-full">
              16:9 Widescreen
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize 16:9 widescreen slides, headline titles, bottle graphics, and call-to-action buttons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in-up">
              ✓ Hero Carousel Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleAddSlide}
            className="px-4 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Slide</span>
          </button>
        </div>
      </div>

      {/* Slide Tabs Swiper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {slides.map((s, idx) => (
          <div key={s.id} className="flex items-center shrink-0">
            <button
              onClick={() => setActiveSlideIdx(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSlideIdx === idx
                  ? 'bg-slate-900 text-[#d6a750] shadow-md shadow-slate-900/10 border border-slate-800'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>Slide {idx + 1}: {s.title.slice(0, 15)}...</span>
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

      {/* 16:9 Live Preview Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            16:9 Aspect Ratio Live Preview
          </h3>
          <span className="text-[11px] font-mono text-slate-400">16:9 Widescreen Canvas</span>
        </div>

        {/* 16:9 Responsive Preview Box */}
        <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative shadow-xl bg-black border border-slate-800 group">
          {/* Background Image */}
          <img
            src={currentSlide.image}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/40" />

          {/* Foreground 16:9 Content */}
          <div className="absolute inset-0 p-4 sm:p-8 md:p-12 flex items-center justify-between gap-4 z-10">
            
            {/* Left Texts */}
            <div className="max-w-[60%] space-y-2 sm:space-y-4">
              <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-[#d6a750] text-black font-sans text-[8px] sm:text-xs font-bold tracking-widest uppercase rounded">
                {currentSlide.badgeText}
              </span>
              <p className="text-[9px] sm:text-xs font-sans tracking-widest text-[#d6a13d] uppercase font-semibold">
                {currentSlide.topTagline}
              </p>
              <h2 className="font-serif text-lg sm:text-3xl md:text-5xl font-bold text-[#d6a13d] leading-none">
                {currentSlide.title}
              </h2>
              <p className="text-[10px] sm:text-base font-sans text-slate-200 tracking-wider font-light">
                {currentSlide.subtitle}
              </p>
              <p className="text-[9px] sm:text-xs font-serif italic text-slate-400">
                {currentSlide.sourceQuote}
              </p>
              <div className="pt-1 sm:pt-2">
                <span className="inline-block px-3 sm:px-6 py-1 sm:py-2.5 border border-[#d6a13d] text-[#d6a13d] text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-xs">
                  {currentSlide.buttonText}
                </span>
              </div>
            </div>

            {/* Right Bottle Graphics */}
            <div className="w-[35%] aspect-[3/4] max-h-[85%] rounded-xl border border-[#b69254]/30 bg-gradient-to-b from-amber-500/10 to-transparent p-2 sm:p-4 flex items-center justify-center shrink-0">
              <img
                src={currentSlide.bottleImage}
                alt="Bottle"
                className="max-h-full object-contain drop-shadow-[0_0_25px_rgba(214,161,61,0.35)]"
              />
            </div>
          </div>

          {/* Indicator Dots */}
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
      </div>

      {/* Slide Editor Form */}
      <form onSubmit={handleSave} className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        <h3 className="font-serif font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
          Edit Slide #{activeSlideIdx + 1} Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Badge Tag (Top Pill)</label>
            <input
              type="text"
              value={currentSlide.badgeText}
              onChange={(e) => handleUpdateCurrent('badgeText', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Small Intro Tagline</label>
            <input
              type="text"
              value={currentSlide.topTagline}
              onChange={(e) => handleUpdateCurrent('topTagline', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Main Headline Title *</label>
            <input
              type="text"
              required
              value={currentSlide.title}
              onChange={(e) => handleUpdateCurrent('title', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtitle Line</label>
            <input
              type="text"
              value={currentSlide.subtitle}
              onChange={(e) => handleUpdateCurrent('subtitle', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quote Source (e.g. - Forbes)</label>
            <input
              type="text"
              value={currentSlide.sourceQuote}
              onChange={(e) => handleUpdateCurrent('sourceQuote', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Button Call-To-Action</label>
            <input
              type="text"
              value={currentSlide.buttonText}
              onChange={(e) => handleUpdateCurrent('buttonText', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">16:9 Background Image URL</label>
            <input
              type="url"
              value={currentSlide.image}
              onChange={(e) => handleUpdateCurrent('image', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bottle Graphic / Cutout URL</label>
            <input
              type="url"
              value={currentSlide.bottleImage}
              onChange={(e) => handleUpdateCurrent('bottleImage', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Save All Slides (16:9)
          </button>
        </div>
      </form>

    </div>
  );
};
