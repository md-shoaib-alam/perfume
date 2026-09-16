'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useCollectionsQuery } from '../hooks/useQueries';

interface GenderCampaignBannersProps {
  onSelectGender?: (gender: 'For Him' | 'For Her') => void;
}

interface CampaignItem {
  id: string;
  title: string;
  gender: 'For Him' | 'For Her';
  image: string;
  showTitle: boolean;
}

export const GenderCampaignBanners: React.FC<GenderCampaignBannersProps> = () => {
  const { data: rawCollections = [] } = useCollectionsQuery();

  const campaigns = useMemo<CampaignItem[]>(() => {
    if (!Array.isArray(rawCollections) || rawCollections.length === 0) return [];

    const himCollection = rawCollections.find(
      (c: any) => c.slug === 'for-him' || c.name?.toLowerCase().includes('him') || c.id === 'for-him'
    );
    const herCollection = rawCollections.find(
      (c: any) => c.slug === 'for-her' || c.name?.toLowerCase().includes('her') || c.id === 'for-her'
    );

    // Prioritize dedicated campaignImage (Homepage Campaign Card)
    const himImg = himCollection?.campaignImage || himCollection?.image || himCollection?.bannerImage || '';
    const herImg = herCollection?.campaignImage || herCollection?.image || herCollection?.bannerImage || '';

    const items: CampaignItem[] = [
      {
        id: 'for-him',
        title: 'For Him',
        gender: 'For Him',
        image: himImg,
        showTitle: himCollection?.showCampaignTitle !== false
      },
      {
        id: 'for-her',
        title: 'For Her',
        gender: 'For Her',
        image: herImg,
        showTitle: herCollection?.showCampaignTitle !== false
      }
    ];

    return items;
  }, [rawCollections]);

  if (campaigns.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {campaigns.map((item) => (
            <Link
              key={item.id}
              href={`/collections/${item.id}`}
              aria-label={`Shop ${item.title}`}
              className="group relative aspect-[2/3] overflow-hidden rounded-none cursor-pointer block bg-slate-100 shadow-xs text-left w-full"
            >
              {/* Background Image (Exact 2:3 Ratio Fit) */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-slate-100" />
              )}

              {/* Top-Left Content with Clean Sans-Serif Typography (Toggled via Admin) */}
              {item.showTitle && (
                <div className="absolute top-5 left-5 sm:top-7 sm:left-7 md:top-8 md:left-8 z-10 text-left">
                  <h3 className="font-sans text-lg sm:text-xl md:text-2xl text-white font-medium tracking-normal leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {item.title}
                  </h3>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
