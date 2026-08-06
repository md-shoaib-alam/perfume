import React, { useState } from 'react';

export const FragranceNotesSection: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'top' | 'heart' | 'base'>('top');

  const TIERS = {
    top: {
      title: 'Top Notes (First Impressions)',
      time: '0 - 30 Minutes',
      description: 'The volatile top accords that dazzle your senses upon first spritz.',
      notes: [
        { name: 'Venetian Saffron', origin: 'Venice, Italy', desc: 'Warm, golden, leather-spiced undertones.' },
        { name: 'Taif Damask Rose', origin: 'Taif, Saudi Arabia', desc: 'Dewy, opulent, nectarous floral majesty.' },
        { name: 'Icy Mint & Bergamot', origin: 'Calabria, Italy', desc: 'Zesty sparkling citrus brightness.' }
      ]
    },
    heart: {
      title: 'Heart Notes (The Soul)',
      time: '30 Mins - 4 Hours',
      description: 'The core signature of the fragrance that unfolds gracefully on pulse points.',
      notes: [
        { name: 'Aged Royal Oud', origin: 'Assam, India', desc: 'Deep, resinous, dark woody grandeur.' },
        { name: 'Smokey Incense', origin: 'Oman', desc: 'Mystical balsamic smoke and sacred resins.' },
        { name: 'Cuban Tobacco Leaf', origin: 'Havana, Cuba', desc: 'Rich, cured tobacco leaf with spiced honey.' }
      ]
    },
    base: {
      title: 'Base Notes (The Memory)',
      time: '4 Hours - 16+ Hours',
      description: 'Rich, fixative resins and woods that cling to skin and garments for days.',
      notes: [
        { name: 'Golden Amber', origin: 'Grasse, France', desc: 'Warm, luminous, honeyed amber resin.' },
        { name: 'Atlas Cedarwood', origin: 'Atlas Mountains', desc: 'Noble, dry, balsamic evergreen woodiness.' },
        { name: 'Bourbon Vanilla', origin: 'Madagascar', desc: 'Smooth, creamy, intoxicating sweet vanilla.' }
      ]
    }
  };

  const current = TIERS[activeTier];

  return (
    <section className="py-20 bg-slate-950 border-t border-amber-900/30 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">Fragrance Architecture</span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
            The Anatomy of Imperial Olfection
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Every Neesh creation evolves through three harmonious tiers of scent. Click each tier below to uncover the master ingredients.
          </p>
        </div>

        {/* Tier Selector Buttons */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-12">
          {(['top', 'heart', 'base'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                activeTier === tier
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-slate-900 border border-amber-900/40 text-slate-400 hover:text-amber-200 hover:border-amber-500/40'
              }`}
            >
              {tier === 'top' && '1. Top Notes'}
              {tier === 'heart' && '2. Heart Notes'}
              {tier === 'base' && '3. Base Notes'}
            </button>
          ))}
        </div>

        {/* Active Tier Display */}
        <div className="bg-slate-900/60 border border-amber-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-amber-900/30 pb-6 mb-8">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-amber-200">{current.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{current.description}</p>
            </div>
            <div className="bg-amber-950/60 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-mono text-amber-300 font-semibold whitespace-nowrap">
              ⏱ Projection Window: {current.time}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {current.notes.map((note, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-amber-900/30 rounded-2xl p-5 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-lg text-white">{note.name}</span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/40">
                    {note.origin}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{note.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
