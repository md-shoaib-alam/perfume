'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center select-none"
      aria-hidden={!isLoading}
    >
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-xs mx-auto">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-slate-200/70" />
          <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#d6a750] border-r-[#caa04c] animate-spin" />
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative z-10">
            <Image
              src="/assets/bakhoorbliss.avif"
              alt="Bakhoor Bliss"
              width={140}
              height={140}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <p className="font-serif text-xs sm:text-sm uppercase tracking-[0.25em] text-[#caa04c] font-semibold">
          Bakhoor Bliss
        </p>
      </div>
    </div>
  );
};
