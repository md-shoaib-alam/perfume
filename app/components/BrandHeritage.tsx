'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface HeritageContent {
  badge: string;
  title: string;
  titleHighlight: string;
  narrative: string;
  image: string;
  concentrationValue: string;
  concentrationLabel: string;
  macerationValue: string;
  macerationLabel: string;
  ctaText: string;
  ctaLink: string;
}

const DEFAULT_HERITAGE: HeritageContent = {
  badge: 'Imperial Legacy',
  title: 'BOTTLED WITH',
  titleHighlight: 'ROYAL HERITAGE & PARISIAN FINESSE',
  narrative:
    'NEESH brings together centuries of Royal Indian Attar-making traditions and modern French haute perfumery. Every fragrance is macerated for 90 days in dark oak barrels to achieve unprecedented longevity and depth.',
  image:
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=80',
  concentrationValue: '30%',
  concentrationLabel: 'Oil Concentration (Extrait)',
  macerationValue: '90 Days',
  macerationLabel: 'Oak Barrel Maceration',
  ctaText: 'Discover the Craftsmanship',
  ctaLink: '#bestsellers',
};

export const BrandHeritage: React.FC = () => {
  const [content, setContent] = useState<HeritageContent>(DEFAULT_HERITAGE);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await api.getSettings();
        if (settings) {
          setContent({
            badge: settings.heritageBadge || DEFAULT_HERITAGE.badge,
            title: settings.heritageTitle || DEFAULT_HERITAGE.title,
            titleHighlight: settings.heritageTitleHighlight || DEFAULT_HERITAGE.titleHighlight,
            narrative: settings.heritageNarrative || DEFAULT_HERITAGE.narrative,
            image: settings.heritageImage || DEFAULT_HERITAGE.image,
            concentrationValue: settings.heritageConcentrationValue || DEFAULT_HERITAGE.concentrationValue,
            concentrationLabel: settings.heritageConcentrationLabel || DEFAULT_HERITAGE.concentrationLabel,
            macerationValue: settings.heritageMacerationValue || DEFAULT_HERITAGE.macerationValue,
            macerationLabel: settings.heritageMacerationLabel || DEFAULT_HERITAGE.macerationLabel,
            ctaText: settings.heritageCtaText || DEFAULT_HERITAGE.ctaText,
            ctaLink: settings.heritageCtaLink || DEFAULT_HERITAGE.ctaLink,
          });
        }
      } catch (e) {
        console.warn('Could not load heritage content from Appwrite:', e);
      }
    };
    load();
    window.addEventListener('focus', load);
    window.addEventListener('neesh_settings_updated', load);
    return () => {
      window.removeEventListener('focus', load);
      window.removeEventListener('neesh_settings_updated', load);
    };
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Presentation */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden border border-amber-900/40 shadow-2xl">
              <img
                src={content.image}
                alt="Imperial Perfumery Artisans"
                loading="lazy"
                decoding="async"
                className="w-full h-[450px] object-cover"
              />
            </div>
            {/* Glowing Accent Frame */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 rounded-3xl filter blur-xl -z-10" />
          </div>

          {/* Heritage Content */}
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
              {content.badge}
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {content.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                {content.titleHighlight}
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {content.narrative}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-amber-900/30">
              <div>
                <span className="font-serif text-3xl font-bold text-amber-300">
                  {content.concentrationValue}
                </span>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                  {content.concentrationLabel}
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-amber-300">
                  {content.macerationValue}
                </span>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                  {content.macerationLabel}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={content.ctaLink}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-amber-300 hover:text-amber-100 border-b-2 border-amber-400/50 pb-1 hover:border-amber-200 transition-all"
              >
                <span>{content.ctaText}</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
