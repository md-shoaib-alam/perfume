'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface InstagramPost {
  id: string;
  image: string;
  instagramUrl?: string;
  caption?: string;
}

export interface InstagramShowcaseData {
  title: string;
  handle: string;
  profileUrl: string;
  items: InstagramPost[];
}

const DEFAULT_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    instagramUrl: 'https://instagram.com',
    caption: 'Haute Vetiver extrait'
  },
  {
    id: 'ig-2',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
    instagramUrl: 'https://instagram.com',
    caption: 'Evening sillage notes'
  },
  {
    id: 'ig-3',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    instagramUrl: 'https://instagram.com',
    caption: 'The Noir Collection'
  },
  {
    id: 'ig-4',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    instagramUrl: 'https://instagram.com',
    caption: 'Artisanal formulation'
  },
  {
    id: 'ig-5',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
    instagramUrl: 'https://instagram.com',
    caption: 'Pure botanical essence'
  },
  {
    id: 'ig-6',
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=600&q=80',
    instagramUrl: 'https://instagram.com',
    caption: 'Signature extrait'
  }
];

export const InstagramShowcaseSection: React.FC = () => {
  const { data } = useQuery<InstagramShowcaseData>({
    queryKey: ['instagramShowcase'],
    queryFn: () => api.getInstagramPosts(),
    staleTime: 60 * 1000,
    retry: false
  });

  const title = data?.title || 'Get Inspired';
  const handle = data?.handle || '@bakhoorbliss';
  const profileUrl = data?.profileUrl || 'https://instagram.com';
  const items = Array.isArray(data?.items) && data.items.length > 0 ? data.items : DEFAULT_INSTAGRAM_POSTS;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-20 bg-white text-slate-900 overflow-hidden">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 sm:mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-4xl text-slate-900 font-normal tracking-wide leading-tight">
            {title}
          </h2>
          
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs sm:text-sm text-slate-600 hover:text-[#caa04c] transition-colors inline-flex items-center gap-1.5 tracking-wider font-medium cursor-pointer"
          >
            <span>{handle}</span>
            <svg
              className="w-3.5 h-3.5 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Square Media Showcase Row / Grid (Sharp Edges, No Scale Zoom) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
          {items.map((item, idx) => {
            const postHref = item.instagramUrl || profileUrl;
            
            return (
              <a
                key={item.id || idx}
                href={postHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View Instagram post ${idx + 1}`}
                className="group relative aspect-square overflow-hidden rounded-none bg-slate-100 border border-slate-200/60 block shadow-2xs cursor-pointer"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.caption || `Instagram showcase ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />

                {/* Refined Luxury Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center text-white">
                  {/* Clean Stroke Instagram Vector SVG Icon */}
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-2 shadow-xs">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>

                  <span className="font-sans text-[10.5px] tracking-wider uppercase font-semibold text-white">
                    View Post
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
