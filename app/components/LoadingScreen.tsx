'use client';

import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isLoading
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible scale-105'
      }`}
      aria-hidden={!isLoading}
    >
      {/* Background Soft Luxury Radial Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-100/30 blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="flex flex-col items-center justify-center text-center px-4 max-w-xs mx-auto">
        {/* Concentric Champagne Gold Luxury Spinner */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-6">
          {/* Subtle Outer Track */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-slate-200/60" />

          {/* Smooth Fast Spinning Champagne Gold Arc */}
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[#d6a750] border-r-[#caa04c] animate-spin" />

          {/* Counter-rotating Inner Subtle Accent Ring */}
          <div
            className="absolute inset-2.5 rounded-full border border-transparent border-b-[#caa04c]/40 border-l-[#d6a750]/60 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '2s' }}
          />

          {/* Center Brand Monogram Geometric Emblem */}
          <div className="w-6 h-6 text-[#caa04c] flex items-center justify-center drop-shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5L17.5 12L12 17.5L6.5 12L12 6.5Z" />
            </svg>
          </div>
        </div>

        {/* Brand Logo / Typography */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-4">
          <img
            src="/assets/neesh_logo_130x40.avif"
            alt="NEESH Perfumes"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </div>

        {/* Elegant Animated Gold Progress Track */}
        <div className="w-32 sm:w-40 h-[2px] bg-slate-100 rounded-full overflow-hidden relative mb-3">
          <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#d6a750] to-transparent animate-pulse" />
        </div>

        {/* Microcopy Subtitle */}
        <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-slate-400 font-medium">
          Haute Parfumerie
        </p>
      </div>
    </div>
  );
};
