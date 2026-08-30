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

export const CollectionsCirclesSection: React.FC = () => {
  const [collections, setCollections] = useState<CollectionCircle[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCollections();
        if (data && data.length > 0) {
          setCollections(data);
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
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50">
                  <img
                    src={item.image}
                    alt={`${item.name} ${item.subname || ''}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
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
