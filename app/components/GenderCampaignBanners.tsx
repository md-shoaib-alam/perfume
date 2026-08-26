'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_BUCKET_ID } from '@/lib/appwrite';

interface GenderCampaignBannersProps {
  onSelectGender?: (gender: 'For Him' | 'For Her') => void;
}

interface CampaignItem {
  id: string;
  title: string;
  gender: 'For Him' | 'For Her';
  image: string;
}

const buildAppwriteMediaUrl = (fileId: string): string => {
  if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID || 'perfume_media'}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
  }
  return '';
};

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'for-him',
    title: 'For Him',
    gender: 'For Him',
    image: buildAppwriteMediaUrl('campaign_for_him')
  },
  {
    id: 'for-her',
    title: 'For Her',
    gender: 'For Her',
    image: buildAppwriteMediaUrl('campaign_for_her')
  }
];

export const GenderCampaignBanners: React.FC<GenderCampaignBannersProps> = ({ onSelectGender }) => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEFAULT_CAMPAIGNS);

  useEffect(() => {
    const loadCampaignMedia = async () => {
      try {
        const [products, collections] = await Promise.all([
          api.getProducts().catch(() => []),
          api.getCollections().catch(() => [])
        ]);

        const himProduct = products.find((p) => p.gender === 'For Him' && p.image);
        const herProduct = products.find((p) => p.gender === 'For Her' && p.image);
        const himCollection = collections.find((c) => c.name?.toLowerCase().includes('him') && c.image);
        const herCollection = collections.find((c) => c.name?.toLowerCase().includes('her') && c.image);

        setCampaigns([
          {
            id: 'for-him',
            title: 'For Him',
            gender: 'For Him',
            image:
              himCollection?.image ||
              himProduct?.image ||
              buildAppwriteMediaUrl('campaign_for_him')
          },
          {
            id: 'for-her',
            title: 'For Her',
            gender: 'For Her',
            image:
              herCollection?.image ||
              herProduct?.image ||
              buildAppwriteMediaUrl('campaign_for_her')
          }
        ]);
      } catch (err) {
        console.warn('Failed to load campaign media from Appwrite:', err);
      }
    };

    loadCampaignMedia();
  }, []);

  const handleClick = (e: React.MouseEvent, gender: 'For Him' | 'For Her') => {
    e.preventDefault();
    if (onSelectGender) {
      onSelectGender(gender);
    }
    const elem = document.getElementById('bestsellers');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {campaigns.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={(e) => handleClick(e, item.gender)}
              aria-label={`Shop ${item.title}`}
              className="group relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-md cursor-pointer block bg-slate-900 shadow-md text-left w-full"
            >
              {/* Background Image */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/30 group-hover:from-black/70 transition-colors duration-300" />

              {/* Top-Left Content */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 text-left">
                <h3 className="font-serif text-2xl sm:text-4xl lg:text-4xl text-white font-normal leading-tight drop-shadow-md">
                  {item.title}
                </h3>
                <span className="font-sans text-[11px] sm:text-xs uppercase tracking-widest text-white font-bold border-b border-white pb-0.5 mt-2 inline-block group-hover:text-[#d6a750] group-hover:border-[#d6a750] transition-all">
                  DISCOVER
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
