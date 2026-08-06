import React, { useState } from 'react';

const PERFUMERS = [
  {
    id: 1,
    name: 'JULIEN RASQUINET',
    award: 'Honoured with Italian Perfumer Award in 2017 & 2022',
    bio: 'GLOBAL CELEBRITY PERFUMER JULIEN RASQUINET. JULIEN IS THE NOSE BEHIND FRAGRANCES FOR CREED, TOM FORD, AMOUAGE, NISHANE, AND MANY MORE.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'CHRISTIAN PROVENZANO',
    award: 'Global Master Perfumer & CPL Aromas Director',
    bio: 'LEGENDARY PERFUMER BEHIND EXCLUSIVE ROYAL ORIENTAL EXTRACTS AND WORLDWIDE AWARD-WINNING FRAGRANCES.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'NANAKO OGI',
    award: 'International Fine Fragrance Creator (Paris)',
    bio: 'CREATOR OF CRYSTAL FRESH AQUATICS AND FINE PARISIAN FLORA PERFUMERY.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'
  }
];

export const MasterPerfumersSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const current = PERFUMERS[activeIndex];

  return (
    <section className="py-20 bg-white text-slate-900 font-serif">
      <div className="max-w-6xl mx-auto px-4 text-center mb-12">
        <span className="text-[11px] font-sans uppercase tracking-[0.3em] text-[#b69254] font-semibold block mb-2">
          THE NOSES BEHIND NEESH
        </span>
        <h2 className="text-3xl sm:text-4xl font-normal tracking-wide text-slate-800">
          Blended by Award-Winning <br />
          <span className="italic">Master Perfumers</span>
        </h2>
        <div className="w-16 h-0.5 bg-[#b69254] mx-auto mt-4" />
      </div>

      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Photo Frame */}
        <div className="md:col-span-5 relative">
          <div className="p-2 border border-[#b69254]/40 bg-white shadow-lg">
            <img
              src={current.image}
              alt={current.name}
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>

        {/* Right Info */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex gap-3 items-start">
            <span className="text-5xl text-[#b69254] font-serif leading-none opacity-60">“</span>
            <p className="text-xl sm:text-2xl font-serif italic text-slate-800 leading-snug">
              {current.award.split('Italian Perfumer Award').map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i === 0 && <span className="text-[#b69254] not-italic font-medium">Italian Perfumer Award</span>}
                </React.Fragment>
              ))}
            </p>
          </div>

          <div className="pl-8 space-y-2 border-l-2 border-[#b69254]/30">
            <h3 className="font-sans text-xs font-bold tracking-[0.2em] text-slate-900 uppercase">
              {current.name}
            </h3>
            <p className="font-sans text-[11px] text-slate-500 tracking-wider leading-relaxed">
              {current.bio}
            </p>
          </div>

          {/* Avatar Selector */}
          <div className="pl-8 pt-4 flex items-center gap-3">
            {PERFUMERS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                  activeIndex === idx ? 'border-[#b69254] ring-2 ring-[#b69254]/30 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
