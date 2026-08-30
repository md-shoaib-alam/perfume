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
          // Filter to only display Story Collections (Bureau, Luxe, Haute, Miss NEESH) and exclude gender landing pages unless explicitly enabled
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
    <section className="py-8 sm:py-12 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12 overflow-x-auto no-scrollbar py-2">
          {collections.map((item) => (
            <Link
              key={item.id}
              href={`/collections/${(item as any).slug || item.id}`}
              className="group flex flex-col items-center text-center cursor-pointer transition-transform hover:-translate-y-1 shrink-0"
            >
              {/* Gold Ring Circular Image (104x104px Inspector Match) */}
              <div className="w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rounded-full p-[2.5px] border-2 border-[#d6a750] bg-white shadow-xs group-hover:shadow-md transition-all">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`${item.name} ${item.subname || ''}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif font-bold text-slate-700 text-lg sm:text-xl">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-2.5 sm:mt-3">
                <span className="block font-sans text-xs sm:text-sm font-medium text-slate-900 group-hover:text-[#d6a750] transition-colors leading-tight">
                  {item.name}
                </span>
                {item.subname && (
                  <span className="block font-sans text-xs sm:text-sm font-medium text-slate-900 group-hover:text-[#d6a750] transition-colors leading-tight">
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
