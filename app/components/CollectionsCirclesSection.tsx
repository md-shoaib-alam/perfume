'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useCollectionsQuery } from '../hooks/useQueries';

interface CollectionCircle {
  id: string;
  name: string;
  subname: string;
  image: string;
}

const GENDER_LANDING_SLUGS = ['for-him', 'for-her', 'unisex', 'gift-set', 'discovery-set'];

export const CollectionsCirclesSection: React.FC = () => {
  const { data: rawCollections = [] } = useCollectionsQuery();

  const collections = useMemo(() => {
    if (!Array.isArray(rawCollections) || rawCollections.length === 0) return [];
    return rawCollections.filter((item: any) => {
      const isGenderPage = GENDER_LANDING_SLUGS.includes(item.slug || item.id);
      if (isGenderPage) {
        return Boolean(item.showInStoryCircle);
      }
      return true;
    });
  }, [rawCollections]);

  if (collections.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 md:py-12 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        {/* Horizontal Scroll / Centered Row */}
        <div className="flex items-start justify-start sm:justify-center gap-3.5 sm:gap-6 md:gap-10 overflow-x-auto no-scrollbar px-3 sm:px-0 pb-3 pt-1 touch-pan-x">
          {collections.map((col: any) => {
            const targetHref = `/collections/${col.slug || col.id}`;

            return (
              <Link
                key={col.id || col._id}
                href={targetHref}
                className="group flex flex-col items-center flex-shrink-0 cursor-pointer w-[76px] sm:w-[96px] md:w-[112px] text-center focus:outline-none [-webkit-tap-highlight-color:transparent]"
              >
                {/* Clean Circular Frame with Subtle Gold Accent Ring on Hover */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-slate-100 border border-slate-200 group-hover:border-[#caa04c] transition-colors duration-300 shadow-2xs">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 relative">
                    <img
                      src={col.image || '/assets/collection-placeholder.jpg'}
                      alt={col.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Typography: 2-line title support with subtext */}
                <div className="mt-2 text-center w-full px-0.5">
                  <h3 className="text-[11px] sm:text-xs md:text-[13px] font-serif font-bold text-slate-800 group-hover:text-[#b88f3e] transition-colors leading-snug line-clamp-2">
                    {col.name}
                  </h3>
                  {col.subname && (
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-sans tracking-wide mt-0.5 truncate">
                      {col.subname}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
