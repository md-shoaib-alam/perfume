'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

export const GenderCampaignBanners: React.FC<GenderCampaignBannersProps> = () => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);

  useEffect(() => {
    const loadCampaignMedia = async () => {
      try {
        const collections = await api.getCollections().catch(() => []);

        const himCollection = collections.find(
          (c) => c.slug === 'for-him' || c.name?.toLowerCase().includes('him')
        );
        const herCollection = collections.find(
          (c) => c.slug === 'for-her' || c.name?.toLowerCase().includes('her')
        );

        const himImg = himCollection?.image || himCollection?.bannerImage || '';
        const herImg = herCollection?.image || herCollection?.bannerImage || '';

        const items: CampaignItem[] = [
          {
            id: 'for-him',
            title: himCollection?.name || 'For Him',
            gender: 'For Him',
            image: himImg
          },
          {
            id: 'for-her',
            title: herCollection?.name || 'For Her',
            gender: 'For Her',
            image: herImg
          }
        ];

        setCampaigns(items);
      } catch (err) {
        console.warn('Failed to load campaign media from Appwrite:', err);
      }
    };

    loadCampaignMedia();
  }, []);

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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
