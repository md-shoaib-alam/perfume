'use client';

import React from 'react';
import { useCelebritiesQuery } from '../hooks/useQueries';

export const CelebritySection: React.FC = () => {
  const { data: celebrities = [], isLoading: loading } = useCelebritiesQuery();

  if (!loading && celebrities.length === 0) {
    return null;
  }

  if (celebrities.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 bg-white text-slate-900 font-serif">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-normal tracking-wide text-slate-800 leading-tight">
          Worn by 100k+ fragheads, <br className="sm:hidden" />
          <span>including</span>
        </h2>
      </div>

      {/* Cards Container (Horizontal Slider on Mobile, 4-Col Grid on Desktop) */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-x-visible sm:pb-0">
          {celebrities.map((celeb: any, idx: number) => (
            <div 
              key={celeb.id || idx} 
              className="w-[76vw] max-w-[290px] flex-shrink-0 snap-center sm:w-auto sm:max-w-none"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden group shadow-md bg-slate-100 cursor-pointer">
                <img
                  src={celeb.image}
                  alt={celeb.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                
                {/* Bottom Overlay Gradient with White Thumbnail Badge */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 sm:p-4 flex items-center gap-3">
                  {/* White Thumbnail Box */}
                  {celeb.bottleThumb && (
                    <div className="bg-white p-1 rounded shadow-xs w-10 h-10 flex items-center justify-center shrink-0">
                      <img
                        src={celeb.bottleThumb}
                        alt={celeb.perfume}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Name and Fragrance Title */}
                  <div className="text-left">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-white leading-tight">
                      {celeb.name}
                    </h3>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-white/90 font-medium block mt-0.5">
                      {celeb.perfume}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
