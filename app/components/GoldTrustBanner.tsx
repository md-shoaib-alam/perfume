'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

import { useSettingsQuery, queryKeys } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export const GoldTrustBanner: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettingsQuery();

  const claims = {
    returnsBadgeText: settings?.returnsBadgeText || '7 DAYS',
    returnsTitle: settings?.returnsTitle || 'No Questions Asked Returns',
    returnsDescription: settings?.returnsDescription || 'Applicable on first order of 100ml and 50ml perfume bottles only',
    deliveryTitle: settings?.deliveryTitle || 'Free & Fast Delivery',
    deliveryDescription: settings?.deliveryDescription || 'on your doorsteps in 3-5 days, with a surprise',
    guaranteeTitle: settings?.guaranteeTitle || 'The Lingering Effect You Want',
    guaranteeDescription: settings?.guaranteeDescription || 'BakhoorBliss perfumes are blended with proven ingredients to last 10+ hours (Guaranteed)'
  };

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    };
    window.addEventListener('neesh_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('neesh_settings_updated', handleUpdate);
    };
  }, [queryClient]);

  return (
    <section className="bg-[#A98D65] text-white py-6 sm:py-8 border-y border-[#977d56]">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-md md:max-w-none mx-auto font-sans">
          
          {/* Item 1: 7 Days Returns */}
          <div className="flex items-center gap-4 w-full">
            <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white/15 backdrop-blur-xs border border-white/50 flex flex-col items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
              <svg className="w-4 h-4 text-white mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[8.5px] font-extrabold tracking-wider leading-none text-white uppercase font-sans">
                {claims.returnsBadgeText || '7 DAYS'}
              </span>
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
            <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white/15 backdrop-blur-xs border border-white/50 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
            <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white/15 backdrop-blur-xs border border-white/50 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
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
