'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../services/api';
import { slugify } from '../utils/slug';

import { useReelsQuery, queryKeys } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export const ReelShortsSection: React.FC = () => {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { data: reelsList = [], isLoading } = useReelsQuery();
  const [logosList, setLogosList] = useState<string[]>([]);
  const loading = isLoading && reelsList.length === 0;

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const rawLogos = (await api.getPressLogos()) || [];
        setLogosList(rawLogos);
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
    setHasMoved(false);
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
    if (Math.abs(x - startX) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // If both lists are empty and not loading, don't show the section at all
  if (!loading && reelsList.length === 0 && logosList.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-18 bg-white text-slate-900 font-serif">
      {/* Featured In Logos Header with Infinite Right-to-Left Marquee Slider (Only if logos exist in DB) */}
      {logosList.length > 0 && (
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14 text-center">
          <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-serif tracking-wide text-[#353534] font-normal">
            Featured In
          </h3>
          
          {/* Marquee Container with matching container boundaries & luxury edge gradient masks */}
          <div className="w-full overflow-hidden py-4 bg-white relative mt-6 sm:mt-8">
            {/* Edge gradient fades on the navbar container bounds */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Native Marquee Tag */}
            {React.createElement(
              'marquee',
              {
                behavior: 'scroll',
                direction: 'left',
                scrollamount: '6',
                className: 'w-full overflow-hidden py-1',
                onMouseEnter: (e: any) => e.currentTarget?.stop && e.currentTarget.stop(),
                onMouseLeave: (e: any) => e.currentTarget?.start && e.currentTarget.start()
              },
              <div className="inline-flex items-center gap-16 sm:gap-24">
                {logosList.map((item: any, idx) => {
                  const isObj = typeof item === 'object' && item !== null;
                  const name = isObj ? item.name : item;
                  const image = isObj ? item.image : (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/')) ? item : undefined);

                  return (
                    <div key={idx} className="inline-flex items-center mx-8 sm:mx-14">
                      {image ? (
                        <img
                          src={image}
                          alt={name || 'Press feature'}
                          loading="lazy"
                          decoding="async"
                          className="h-[30px] md:h-[40px] xl:h-[50px] max-w-[220px] object-contain hover:opacity-90 transition-all select-none cursor-pointer"
                        />
                      ) : (
                        <span className="hover:text-[#d6a750] transition-colors cursor-pointer whitespace-nowrap uppercase select-none text-xl md:text-2xl xl:text-3xl font-serif font-black tracking-widest text-slate-900">
                          {name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
            {reelsList.map((reel: any, idx) => {
              const slug = reel.productId || (reel.title ? slugify(reel.title) : '');
              const href = slug ? `/products/${slug}` : '#';

              return (
                <Link
                  key={reel.id || idx}
                  href={href}
                  onClick={(e) => {
                    if (hasMoved) {
                      e.preventDefault();
                    }
                  }}
                  className="w-44 sm:w-56 bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer shrink-0 group hover:border-[#c59b48]/60 transition-colors"
                >
                  {/* 9:16 Vertical Reel Video/Photo */}
                  <div className="relative aspect-[9/16] overflow-hidden bg-slate-900">
                    <img
                      src={reel.image}
                      alt={reel.title}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Bottom White Product Details Section with Overlapping Thumbnail */}
                  <div className="bg-white px-3.5 pb-4 pt-1 text-center relative flex flex-col items-center border-t border-slate-100">
                    {/* Product Thumbnail (Overlaps the bottom edge of the 9:16 media) */}
                    {reel.productImage && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200/90 shadow-md -mt-7 sm:-mt-8 mb-2 overflow-hidden flex items-center justify-center shrink-0 z-10 p-0.5">
                        <img
                          src={reel.productImage}
                          alt={reel.title}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Fragrance Title */}
                    <h4 className="font-serif text-sm sm:text-base font-bold text-slate-900 leading-snug truncate max-w-full px-1 mt-0.5 group-hover:text-[#c59b48] transition-colors">
                      {reel.title}
                    </h4>

                    {/* Price Tag */}
                    <p className="font-sans text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                      {reel.price}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
