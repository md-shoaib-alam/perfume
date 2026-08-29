'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

import { usePerfumersQuery } from '../hooks/useQueries';

export const MasterPerfumersSection: React.FC = () => {
  const { data: perfumers = [], isLoading: loading } = usePerfumersQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  if (!loading && perfumers.length === 0) {
    return null;
  }

  if (perfumers.length === 0) {
    return null;
  }

  const current = perfumers[activeIndex] || perfumers[0];

  return (
    <section className="py-16 sm:py-24 bg-white text-slate-900 font-serif">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-12">
          <p className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#d6a750] uppercase">
            THE NOSES BEHIND BAKHOORBLISS
          </p>
          <h2 className="text-2xl sm:text-4xl font-normal tracking-wide text-slate-800 leading-tight">
            Blended by Award-Winning <br />
            <span className="italic">Master Perfumers</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#d6a750] mx-auto mt-4" />
        </div>

        {/* Mobile Avatar Selector & Dash Indicators (Visible on Mobile < md) */}
        <div className="md:hidden flex flex-col items-center gap-3 mb-6 px-4">
          {/* Avatars Row */}
          <div className="flex items-center justify-center gap-3">
            {perfumers.map((p, idx) => (
              <button
                key={p.id || idx}
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
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover rounded-full ${
                    activeIndex === idx ? '' : 'grayscale'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Dash Indicators */}
          <div className="flex items-center justify-center gap-2 mt-1">
            {perfumers.map((_, idx) => (
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
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />

                {/* Bottom Gradient Overlay with Perfumer Name */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-left">
                  <span className="font-serif text-xl sm:text-2xl font-normal text-white drop-shadow-md">
                    {current.displayName || current.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Perfumer Narrative / Biography */}
          <div className="md:col-span-6 flex flex-col justify-center text-left">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-slate-900 uppercase">
              {current.name}
            </h3>

            {/* Subtitle / Award Tag */}
            <p className="font-sans text-xs sm:text-sm font-semibold text-[#caa04c] mt-2 mb-4 tracking-wider">
              {current.award}
            </p>

            {/* Quote / Bio */}
            <p className="font-sans text-xs sm:text-sm leading-relaxed text-slate-600 font-light mb-8">
              {current.quote || current.bio}
            </p>

            {/* Desktop Carousel Indicators */}
            <div className="hidden md:flex items-center gap-3">
              {perfumers.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden transition-all p-[2px] cursor-pointer ${
                    activeIndex === idx
                      ? 'border-2 border-[#d6a750] shadow-md ring-2 ring-[#d6a750]/20 bg-white'
                      : 'border border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover rounded-full ${
                      activeIndex === idx ? '' : 'grayscale'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
