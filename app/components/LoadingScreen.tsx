'use client';

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRender(false), 2000);
      return () => clearTimeout(timer);
    }
    setShouldRender(true);
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center select-none transition-opacity duration-[2000ms] ease-in-out ${
        isLoading
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!isLoading}
    >
      <div
        className={`flex flex-col items-center justify-center text-center px-4 max-w-xs mx-auto transition-all duration-[1800ms] ease-out ${
          isLoading
            ? 'opacity-100 transform translate-y-0 scale-100'
            : 'opacity-0 transform -translate-y-3 scale-95'
        }`}
      >
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-slate-200/70" />
          <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#d6a750] border-r-[#caa04c] animate-spin" />
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative z-10">
            <img
              src="/assets/bakhoorbliss.avif"
              alt="Bakhoor Bliss"
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
