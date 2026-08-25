'use client';
import React, { useState } from 'react';

export const HeroManager: React.FC = () => {
  const [heroData, setHeroData] = useState({
    title: 'TSUNARA',
    subtitle: 'THE LONGEST LASTING PERFUME',
    badgeText: 'VINTAGE HARVEST 2026',
    description: 'Blended with aged ambergris, rare woods, and 30% pure Extrait concentration to last 14+ hours.',
    buttonText: 'EXPLORE VINTAGE',
    buttonLink: '#bestsellers',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('neesh_hero_config', JSON.stringify(heroData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Hero Banner Editor</h2>
          <p className="text-xs text-slate-500">Customize main homepage hero image, headlines, and call-to-action buttons.</p>
        </div>
        {saved && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded">
            ✓ Hero Banner Updated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Headline Title</label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                value={heroData.subtitle}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Badge Tag</label>
              <input
                type="text"
                value={heroData.badgeText}
                onChange={(e) => setHeroData({ ...heroData, badgeText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Button Text</label>
              <input
                type="text"
                value={heroData.buttonText}
                onChange={(e) => setHeroData({ ...heroData, buttonText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description Paragraph</label>
            <textarea
              rows={2}
              value={heroData.description}
              onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Desktop Hero Image URL</label>
            <input
              type="text"
              value={heroData.image}
              onChange={(e) => setHeroData({ ...heroData, image: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all"
            >
              Publish Hero Updates
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl overflow-hidden relative shadow-lg flex flex-col justify-end p-6 min-h-[300px]">
          <img
            src={heroData.image}
            alt="Hero Preview"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="relative z-10 space-y-2 text-white">
            <span className="inline-block px-2.5 py-0.5 bg-[#d6a750] text-black font-mono text-[9px] font-bold rounded">
              {heroData.badgeText}
            </span>
            <h3 className="font-serif text-2xl font-bold text-white leading-tight">
              {heroData.title}
            </h3>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {heroData.subtitle} - {heroData.description}
            </p>
            <button className="mt-2 px-4 py-2 bg-[#d6a750] text-black font-bold text-[10px] uppercase tracking-wider rounded">
              {heroData.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
