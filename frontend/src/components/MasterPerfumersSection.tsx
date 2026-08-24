import React, { useState } from 'react';

const PERFUMERS = [
  {
    id: 1,
    name: 'JULIEN RASQUINET',
    displayName: 'Julien Rasquinet',
    award: 'Honoured with Italian Perfumer Award in 2017 & 2022',
    bio: 'GLOBAL CELEBRITY PERFUMER JULIEN RASQUINET. JULIEN IS THE NOSE BEHIND FRAGRANCES FOR CREED, TOM FORD, AMOUAGE, NISHANE, AND MANY MORE.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'CHRISTIAN PROVENZANO',
    displayName: 'Christian Provenzano',
    award: 'Global Master Perfumer & CPL Aromas Director',
    bio: 'LEGENDARY PERFUMER BEHIND EXCLUSIVE ROYAL ORIENTAL EXTRACTS AND WORLDWIDE AWARD-WINNING FRAGRANCES.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'DOMINIQUE ROPION',
    displayName: 'Dominique Ropion',
    award: 'International Fine Fragrance Master (Paris)',
    bio: 'ICONIC FRENCH PERFUMER KNOWN FOR PRECISE OLFACTORY ARCHITECTURE AND UNMATCHED FLORAL ACCORDS.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'NANAKO OGI',
    displayName: 'Nanako Ogi',
    award: 'International Fine Fragrance Creator (Tokyo)',
    bio: 'CREATOR OF CRYSTAL FRESH AQUATICS AND FINE PARISIAN FLORA PERFUMERY.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    name: 'ARTURETTO LANDI',
    displayName: 'Arturetto Landi',
    award: 'Italian Perfumer & Oriental Oud Master',
    bio: 'PIONEER OF LUXURY ORIENTAL WOODS, OUD ABSOLUTES AND CELEBRITY PRIVATE BLENDS.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80'
  }
];

export const MasterPerfumersSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const current = PERFUMERS[activeIndex];

  return (
    <section className="py-16 sm:py-24 bg-white text-slate-900 font-serif">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto px-4 text-center mb-8 sm:mb-12">
        <span className="text-[11px] font-sans uppercase tracking-[0.3em] text-[#d6a750] font-semibold block mb-2">
          THE NOSES BEHIND NEESH
        </span>
        <h2 className="text-2xl sm:text-4xl font-normal tracking-wide text-slate-800 leading-tight">
          Blended by Award-Winning <br />
          <span className="italic">Master Perfumers</span>
        </h2>
        <div className="w-16 h-0.5 bg-[#d6a750] mx-auto mt-4" />
      </div>

      {/* Mobile Avatar Selector & Dash Indicators (Visible on Mobile `< md`) */}
      <div className="md:hidden flex flex-col items-center gap-3 mb-6 px-4">
        {/* Avatars Row */}
        <div className="flex items-center justify-center gap-3">
          {PERFUMERS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-14 h-14 rounded-full overflow-hidden transition-all p-[2px] cursor-pointer ${
                activeIndex === idx
                  ? 'border-2 border-[#d6a750] shadow-md ring-2 ring-[#d6a750]/20 bg-white'
                  : 'border border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={p.image}
                alt={p.name}
                className={`w-full h-full object-cover rounded-full ${
                  activeIndex === idx ? '' : 'grayscale'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Dash Indicators */}
        <div className="flex items-center justify-center gap-2 mt-1">
          {PERFUMERS.map((_, idx) => (
            <div
              key={idx}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                activeIndex === idx ? 'w-6 bg-[#d6a750]' : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Left: Perfumer Large Portrait Frame */}
        <div className="md:col-span-6 relative flex justify-center">
          {/* Gold Outer Border Frame */}
          <div className="relative p-2 border border-[#d6a750] bg-white w-full max-w-md shadow-md">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover"
              />

              {/* Bottom Gradient Overlay with Perfumer Name */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-left">
                <span className="font-serif text-xl sm:text-2xl font-normal text-white drop-shadow-md">
                  {current.displayName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info & Desktop Avatars */}
        <div className="md:col-span-6 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
          {/* Quote & Award Title */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center md:items-start text-center md:text-left">
            <span className="text-4xl sm:text-5xl text-[#d6a750] font-serif leading-none opacity-70">“</span>
            <p className="text-lg sm:text-2xl font-serif italic text-slate-800 leading-snug">
              {current.award.includes('Italian Perfumer Award') ? (
                current.award.split('Italian Perfumer Award').map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i === 0 && <span className="text-[#d6a750] not-italic font-medium">Italian Perfumer Award</span>}
                  </React.Fragment>
                ))
              ) : (
                current.award
              )}
            </p>
          </div>

          {/* Perfumer Name & Uppercase Bio */}
          <div className="space-y-3 md:pl-6 md:border-l-2 md:border-[#d6a750]/30 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-6 h-[1px] bg-[#d6a750] block" />
              <h3 className="font-sans text-xs font-bold tracking-[0.2em] text-slate-900 uppercase">
                {current.name}
              </h3>
            </div>
            <p className="font-sans text-[11px] text-slate-500 tracking-wider leading-relaxed max-w-md mx-auto md:mx-0">
              {current.bio}
            </p>
          </div>

          {/* Desktop Avatar Selector & Dash Indicators (Hidden on Mobile) */}
          <div className="hidden md:flex flex-col gap-3 pt-4 md:pl-6">
            <div className="flex items-center gap-3.5">
              {PERFUMERS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-16 h-16 rounded-full overflow-hidden transition-all p-[2px] cursor-pointer ${
                    activeIndex === idx
                      ? 'border-2 border-[#d6a750] shadow-md ring-2 ring-[#d6a750]/20 bg-white scale-105'
                      : 'border border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className={`w-full h-full object-cover rounded-full ${
                      activeIndex === idx ? '' : 'grayscale'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dash Indicators */}
            <div className="flex items-center gap-2 mt-1">
              {PERFUMERS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-[2px] rounded-full transition-all duration-300 ${
                    activeIndex === idx ? 'w-6 bg-[#d6a750]' : 'w-4 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
