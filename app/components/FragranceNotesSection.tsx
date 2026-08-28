'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { FragrancePyramidData, PyramidTier } from '../types';

const INITIAL_FALLBACK_TIERS: FragrancePyramidData = {
  top: {
    title: 'Top Notes — The Initial Aura',
    duration: '0 to 30 Minutes',
    description:
      'The initial sensory impression upon opening and spray. Highly volatile citrus, aromatic, and rare floral accords crafted for instant radiance.',
    notes: [
      {
        name: 'Calabrian Bergamot',
        role: 'Luminous Citrus Spark',
        source: 'Hand-pressed in Calabria, Southern Italy',
        image: ''
      },
      {
        name: 'Saffron Absolute',
        role: 'Regal Golden Spice Accord',
        source: 'Harvested at dawn in Pampore, Kashmir',
        image: ''
      },
      {
        name: 'Taif Rose Petals',
        role: 'Crisp Velvet Blossom',
        source: 'Hydro-distilled in Taif Mountain Valleys',
        image: ''
      }
    ]
  },
  heart: {
    title: 'Heart Notes — The Scent Soul',
    duration: '30 Minutes to 4 Hours',
    description:
      'The core architectural body of the perfume that unfolds as the top notes subside. Rich floral and aromatic resins defining character.',
    notes: [
      {
        name: 'Bourbon Vanilla Pods',
        role: 'Creamy Warmth & Depth',
        source: 'Sun-cured in Madagascar',
        image: ''
      },
      {
        name: 'Orris Butter',
        role: 'Silky Powdery Richness',
        source: 'Aged 3 Years in Florence, Italy',
        image: ''
      },
      {
        name: 'Cardamom Co-Extract',
        role: 'Green Warm Spicy Spark',
        source: 'Wild-harvested in Guatemala Rainforests',
        image: ''
      }
    ]
  },
  base: {
    title: 'Base Notes — The Lingering Sillage',
    duration: '4 to 12+ Hours',
    description:
      'The foundation of high-concentration extraits. Heavy molecular resins and vintage woods that anchor the fragrance and bond with skin chemistry.',
    notes: [
      {
        name: 'Aged Assam Agarwood (Oud)',
        role: 'Smoky Balsamic Power',
        source: 'Naturally aged wild Aquilaria from Assam',
        image: ''
      },
      {
        name: 'Golden Ambergris Resin',
        role: 'Oceanic Salty Warmth',
        source: 'Sustainably ethically foraged coastal amber',
        image: ''
      },
      {
        name: 'Mysore Sandalwood',
        role: 'Buttery Sacred Cream Wood',
        source: 'Government-certified Santalum Album, India',
        image: ''
      }
    ]
  }
};

export const FragranceNotesSection: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'top' | 'heart' | 'base'>('top');
  const [pyramidData, setPyramidData] = useState<FragrancePyramidData>(INITIAL_FALLBACK_TIERS);

  const loadDataFromAppwrite = async () => {
    try {
      const settings = await api.getSettings();
      if (settings && settings.fragranceTiers) {
        let parsed: FragrancePyramidData | null = null;
        if (typeof settings.fragranceTiers === 'string') {
          try {
            parsed = JSON.parse(settings.fragranceTiers);
          } catch (e) {
            console.error('Failed to parse fragranceTiers JSON:', e);
          }
        } else if (typeof settings.fragranceTiers === 'object') {
          parsed = settings.fragranceTiers;
        }

        if (parsed && (parsed.top || parsed.heart || parsed.base)) {
          setPyramidData({
            top: parsed.top || INITIAL_FALLBACK_TIERS.top,
            heart: parsed.heart || INITIAL_FALLBACK_TIERS.heart,
            base: parsed.base || INITIAL_FALLBACK_TIERS.base
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch dynamic fragrance notes from Appwrite:', err);
    }
  };

  useEffect(() => {
    loadDataFromAppwrite();

    const handleSettingsUpdated = () => {
      loadDataFromAppwrite();
    };

    window.addEventListener('neesh_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('neesh_settings_updated', handleSettingsUpdated);
    };
  }, []);

  const current: PyramidTier = pyramidData[activeTier] || INITIAL_FALLBACK_TIERS[activeTier];

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#caa04c] font-semibold">
            Olfactory Architecture
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-slate-900 mt-2 mb-4">
            The Anatomy of Imperial Olfaction
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-sans leading-relaxed">
            Every Neesh creation evolves through three harmonious tiers of scent. Click each tier below to uncover the master ingredients.
          </p>
        </div>

        {/* Tier Selector Buttons */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-10">
          {(['top', 'heart', 'base'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer ${
                activeTier === tier
                  ? 'bg-[#c59b48] text-white shadow-md shadow-[#c59b48]/20'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {tier === 'top' && '1. Top Notes'}
              {tier === 'heart' && '2. Heart Notes'}
              {tier === 'base' && '3. Base Notes'}
            </button>
          ))}
        </div>

        {/* Active Tier Display */}
        <div className="bg-[#faf9f6] border border-amber-200/60 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-6 mb-8">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-normal text-slate-900">{current.title}</h3>
              <p className="text-slate-600 text-sm mt-1">{current.description}</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs font-mono text-[#916618] font-bold whitespace-nowrap">
              <svg
                className="w-3.5 h-3.5 shrink-0 text-[#916618] stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{current.duration}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {current.notes && current.notes.map((note, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#caa04c]/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {note.image ? (
                    <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-100">
                      <img
                        src={note.image}
                        alt={note.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-xl mb-4 bg-amber-50/60 border border-amber-200/50 flex items-center justify-center text-[#caa04c]">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-[#b88f3e] font-bold block mb-1">
                    {note.role}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-slate-900 mb-1">{note.name}</h4>
                </div>
                <p className="text-xs text-slate-500 font-sans border-t border-slate-100 pt-3 mt-3">
                  {note.source}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
