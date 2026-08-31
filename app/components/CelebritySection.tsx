'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCelebritiesQuery, queryKeys } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { slugify } from '../utils/slug';

export const CelebritySection: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: rawData = [], isLoading: loading } = useCelebritiesQuery();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.celebrities });
    };
    window.addEventListener('neesh_celebrities_updated', handleUpdate);
    return () => {
      window.removeEventListener('neesh_celebrities_updated', handleUpdate);
    };
  }, [queryClient]);

  const sectionTitle = typeof rawData === 'object' && !Array.isArray(rawData) && rawData.title
    ? rawData.title
    : 'Worn by 100k+ fragheads, including';

  const celebrities = Array.isArray(rawData)
    ? rawData
    : (Array.isArray(rawData?.items) ? rawData.items : []);

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
          {sectionTitle}
        </h2>
      </div>

      {/* Cards Container (Horizontal Slider on Mobile, 4-Col Grid on Desktop) */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-x-visible sm:pb-0">
          {celebrities.map((celeb: any, idx: number) => {
            const targetPath = celeb.targetUrl || (celeb.productId ? `/products/${celeb.productId}` : (celeb.perfume ? `/products/${slugify(celeb.perfume)}` : ''));
            const CardWrapper = targetPath ? Link : 'div';
            const wrapperProps = targetPath ? { href: targetPath } : {};

            return (
              <div 
                key={celeb.id || idx} 
                className="w-[76vw] max-w-[290px] flex-shrink-0 snap-center sm:w-auto sm:max-w-none"
              >
                <CardWrapper
                  {...wrapperProps}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden group shadow-md bg-slate-100 cursor-pointer block"
                >
                  <img
                    src={celeb.image}
                    alt={celeb.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Bottom Overlay Gradient with White Thumbnail Badge */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4">
                    {/* White Thumbnail Box for Fragrance Bottle */}
                    {(celeb.bottleThumb || celeb.productImage) && (
                      <div className="bg-white rounded-2xl shadow-md w-[60px] h-[60px] md:w-[65px] md:h-[65px] xl:w-[70px] xl:h-[70px] flex items-center justify-center shrink-0 border border-white/40 overflow-hidden p-0.5">
                        <img
                          src={celeb.bottleThumb || celeb.productImage}
                          alt={celeb.perfume || 'Fragrance bottle'}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* Name and Fragrance Title */}
                    <div className="text-left min-w-0 flex-1">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight tracking-wide drop-shadow-sm truncate">
                        {celeb.name}
                      </h3>
                      {celeb.perfume && (
                        <span className="font-sans text-xs sm:text-sm uppercase tracking-widest text-slate-100 font-semibold block mt-1 drop-shadow-xs truncate">
                          {celeb.perfume}
                        </span>
                      )}
                    </div>
                  </div>
                </CardWrapper>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
