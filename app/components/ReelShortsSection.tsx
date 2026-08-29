'use client';
import React, { useRef, useState, useEffect } from 'react';
import { api } from '../services/api';

import { useReelsQuery, queryKeys } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export const ReelShortsSection: React.FC = () => {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { data: reelsList = [], isLoading } = useReelsQuery();
  const [logosList, setLogosList] = useState<string[]>([]);
  const loading = isLoading && reelsList.length === 0;

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const rawLogos = (await api.getPressLogos()) || [];
        setLogosList(rawLogos.length > 0 && rawLogos.length < 12 ? [...rawLogos, ...rawLogos] : rawLogos);
      } catch (e) {}
    };
    loadLogos();

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reels });
      loadLogos();
    };
    window.addEventListener('neesh_reels_updated', handleUpdate);
    return () => {
      window.removeEventListener('neesh_reels_updated', handleUpdate);
    };
  }, [queryClient]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // If both lists are empty and not loading, don't show the section at all
  if (!loading && reelsList.length === 0 && logosList.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-white text-slate-900 font-serif">
      {/* Featured In Logos Header with Infinite Right-to-Left Marquee Slider (Only if logos exist in DB) */}
      {logosList.length > 0 && (
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <h3 className="text-xl font-serif tracking-wider text-slate-800 text-center mb-6">
            Featured In
          </h3>
          
          {/* Marquee Container with matching container boundaries & luxury edge gradient masks */}
          <div className="w-full overflow-hidden py-2 bg-white relative">
            {/* Edge gradient fades on the navbar container bounds */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Marquee Track */}
            <div className="flex w-max animate-marquee">
              {/* Track 1 */}
              <div className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16 text-slate-900 font-serif font-bold text-xl sm:text-2xl tracking-widest">
                {logosList.map((logo, idx) => (
                  <span 
                    key={`l1-${idx}`} 
                    className="hover:text-[#d6a750] transition-colors cursor-pointer whitespace-nowrap uppercase select-none"
                  >
                    {logo}
                  </span>
                ))}
              </div>

              {/* Track 2 */}
              <div className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16 text-slate-900 font-serif font-bold text-xl sm:text-2xl tracking-widest" aria-hidden="true">
                {logosList.map((logo, idx) => (
                  <span 
                    key={`l2-${idx}`} 
                    className="hover:text-[#d6a750] transition-colors cursor-pointer whitespace-nowrap uppercase select-none"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Reel Shorts Cards (Only if reels exist in DB) */}
      {reelsList.length > 0 && (
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto select-none py-2 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex gap-4 sm:gap-5 min-w-max">
            {reelsList.map((reel, idx) => (
              <div
                key={reel.id || idx}
                className="w-48 sm:w-56 bg-slate-900 rounded-xl overflow-hidden border border-slate-200/20 shadow-md group flex flex-col justify-between cursor-pointer transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[9/16] overflow-hidden">
                  <img
                    src={reel.image}
                    alt={reel.title}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#d6a750]">
                      {reel.subtitle}
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white leading-tight">{reel.title}</h4>
                      <p className="font-sans text-xs text-slate-300 font-semibold mt-1">{reel.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
