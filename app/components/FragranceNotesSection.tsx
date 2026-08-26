'use client';
import React, { useState } from 'react';

interface NoteItem {
  name: string;
  role: string;
  source: string;
  image: string;
}

interface PyramidTier {
  title: string;
  duration: string;
  description: string;
  notes: NoteItem[];
}

const PYRAMID_DATA: Record<'top' | 'heart' | 'base', PyramidTier> = {
  top: {
    title: 'Top Notes — The Initial Spark',
    duration: '0 to 30 Minutes',
    description:
      'The first olfactory impression perceived immediately upon atomization. Crisp, effervescent botanical isolates designed to captivate the senses.',
    notes: [
      {
        name: 'Calabrian Bergamot',
        role: 'Luminous Citrus Spark',
        source: 'Hand-pressed in Calabria, Southern Italy',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Saffron Absolute',
        role: 'Regal Golden Spice Accord',
        source: 'Harvested at dawn in Pampore, Kashmir',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Taif Rose Petals',
        role: 'Crisp Velvet Blossom',
        source: 'Hydro-distilled in Taif Mountain Valleys',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
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
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Orris Butter',
        role: 'Silky Powdery Richness',
        source: 'Aged 3 Years in Florence, Italy',
        image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Cardamom Co-Extract',
        role: 'Green Warm Spicy Spark',
        source: 'Wild-harvested in Guatemala Rainforests',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'
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
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Golden Ambergris Resin',
        role: 'Oceanic Salty Warmth',
        source: 'Sustainably ethically foraged coastal amber',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Mysore Sandalwood',
        role: 'Buttery Sacred Cream Wood',
        source: 'Government-certified Santalum Album, India',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
      }
    ]
  }
};

export const FragranceNotesSection: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'top' | 'heart' | 'base'>('top');
  const current = PYRAMID_DATA[activeTier];

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
                  ? 'bg-[#c59b48] text-white shadow-md shadow-[#c59b48]/20 scale-105'
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
            {current.notes.map((note, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#caa04c]/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-100">
                    <img
                      src={note.image}
                      alt={note.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
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
