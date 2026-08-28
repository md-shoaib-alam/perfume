'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const GoldTrustBanner: React.FC = () => {
  const [claims, setClaims] = useState({
    returnsBadgeText: '7 DAYS',
    returnsTitle: 'No Questions Asked Returns',
    returnsDescription: 'Applicable on first order of 100ml and 50ml perfume bottles only',
    deliveryTitle: 'Free & Fast Delivery',
    deliveryDescription: 'on your doorsteps in 3-5 days, with a surprise',
    guaranteeTitle: 'The Lingering Effect You Want',
    guaranteeDescription: 'NEESH™ perfumes are blended with proven ingredients to last 10+ hours (Guaranteed)'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings();
        if (settings) {
          setClaims((prev) => ({
            returnsBadgeText: settings.returnsBadgeText || prev.returnsBadgeText,
            returnsTitle: settings.returnsTitle || prev.returnsTitle,
            returnsDescription: settings.returnsDescription || prev.returnsDescription,
            deliveryTitle: settings.deliveryTitle || prev.deliveryTitle,
            deliveryDescription: settings.deliveryDescription || prev.deliveryDescription,
            guaranteeTitle: settings.guaranteeTitle || prev.guaranteeTitle,
            guaranteeDescription: settings.guaranteeDescription || prev.guaranteeDescription,
          }));
        }
      } catch (err) {
        console.warn('Failed to load trust banner settings:', err);
      }
    };

    loadSettings();
    window.addEventListener('neesh_settings_updated', loadSettings);
    return () => {
      window.removeEventListener('neesh_settings_updated', loadSettings);
    };
  }, []);

  return (
    <section className="bg-[#c59b48] text-white py-6 sm:py-8 border-y border-[#b58b38]">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-md md:max-w-none mx-auto font-sans">
          
          {/* Item 1: 7 Days Returns */}
          <div className="flex items-center gap-4 w-full">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-white/60 flex items-center justify-center font-serif text-[11px] font-extrabold tracking-tight text-white shrink-0 shadow-xs">
              {claims.returnsBadgeText}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-0.5">
                {claims.returnsTitle}
              </h4>
              <p className="text-[11px] text-white/90 leading-snug font-normal">
                {claims.returnsDescription}
              </p>
            </div>
          </div>

          {/* Item 2: Free & Fast Delivery */}
          <div className="flex items-center gap-4 w-full">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-white/60 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-4 0a1 1 0 01-1-1m-1 0a1 1 0 00-1 1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-0.5">
                {claims.deliveryTitle}
              </h4>
              <p className="text-[11px] text-white/90 leading-snug font-normal">
                {claims.deliveryDescription}
              </p>
            </div>
          </div>

          {/* Item 3: 10+ Hours Guarantee */}
          <div className="flex items-center gap-4 w-full">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-white/60 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-0.5">
                {claims.guaranteeTitle}
              </h4>
              <p className="text-[11px] text-white/90 leading-snug font-normal">
                {claims.guaranteeDescription}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
