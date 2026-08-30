'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../services/api';

interface CollectionCircle {
  id: string;
  name: string;
  subname: string;
  image: string;
}

const GENDER_LANDING_SLUGS = ['for-him', 'for-her', 'unisex', 'gift-set', 'discovery-set'];

export const CollectionsCirclesSection: React.FC = () => {
  const [collections, setCollections] = useState<CollectionCircle[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCollections();
        if (data && data.length > 0) {
          // Filter to only display Story Collections (Bureau, Luxe, Haute, etc.) and exclude gender landing pages unless explicitly enabled
          const storyCollections = data.filter((item: any) => {
            const isGenderPage = GENDER_LANDING_SLUGS.includes(item.slug || item.id);
            if (isGenderPage) {
              return Boolean(item.showInStoryCircle);
            }
            return true;
          });
          setCollections(storyCollections);
        }
      } catch (e) {}
    };
    load();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 md:py-12 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        {/* Horizontal Scroll / Centered Row */}
        <div className="flex items-start justify-start sm:justify-center gap-3.5 sm:gap-6 md:gap-10 overflow-x-auto no-scrollbar px-3 sm:px-0 pb-3 pt-1 touch-pan-x">
          {collections.map((item) => (
            <Link
              key={item.id}
              href={`/collections/${(item as any).slug || item.id}`}
              className="group flex flex-col items-center text-center cursor-pointer shrink-0 w-[78px] sm:w-[94px] md:w-[110px] select-none outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]"
            >
              {/* Gold Ring Circular Image */}
              <div className="w-[70px] h-[70px] sm:w-[88px] sm:h-[88px] md:w-[104px] md:h-[104px] rounded-full p-[2px] sm:p-[2.5px] border-2 border-[#d6a750] bg-white shadow-xs group-hover:shadow-md transition-all">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`${item.name} ${item.subname || ''}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <span className="font-serif font-bold text-slate-700 text-base sm:text-lg md:text-xl">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-2 sm:mt-2.5 w-full px-0.5">
                <span className="block font-sans text-[11px] sm:text-xs md:text-sm font-semibold text-slate-900 group-hover:text-[#caa04c] transition-colors leading-tight break-words">
                  {item.name}
                </span>
                {item.subname && (
                  <span className="block font-sans text-[10px] sm:text-xs md:text-xs font-normal text-slate-500 group-hover:text-[#caa04c] transition-colors leading-tight mt-0.5 break-words">
                    {item.subname}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
