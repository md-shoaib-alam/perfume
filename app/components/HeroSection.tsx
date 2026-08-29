'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export interface HeroSlide {
  id: string;
  name: string;
  desktopImage: string;
  mobileImage: string;
  linkUrl: string;
  position?: number;
}

interface HeroSectionProps {
  onShopNow: () => void;
}

import { useHeroSlidesQuery, queryKeys } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow }) => {
  const queryClient = useQueryClient();
  const { data: slides = [] } = useHeroSlidesQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number>(0);

  // Invalidate on admin updates
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
    };
    window.addEventListener('neesh_hero_updated', handleUpdate);
    return () => {
      window.removeEventListener('neesh_hero_updated', handleUpdate);
    };
  }, [queryClient]);

  // Automatic slide interval (every 5.5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  if (slides.length === 0) {
    return (
      <div className="w-full bg-black/95 aspect-[4/5] sm:aspect-[16/7] md:aspect-[21/9] flex items-center justify-center border-b border-[#b69254]/30 relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-black via-zinc-900 to-black animate-pulse" />
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  const handleBannerClick = (e: React.MouseEvent, linkUrl?: string) => {
    if (!linkUrl) {
      e.preventDefault();
      onShopNow();
      return;
    }
    if (linkUrl.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(linkUrl);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onShopNow();
      }
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full bg-black overflow-hidden border-b border-[#b69254]/30 select-none group"
    >
      {/* Sliding Track */}
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full will-change-transform"
        style={{
          transform: `translate3d(-${currentIndex * 100}%, 0, 0)`
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full shrink-0 min-w-full relative bg-black overflow-hidden flex items-center justify-center"
          >
            <a
              href={slide.linkUrl || '#'}
              onClick={(e) => handleBannerClick(e, slide.linkUrl)}
              className="block w-full cursor-pointer group/banner focus:outline-none relative"
            >
              {/* Desktop Image Banner (Full intrinsic ratio - Never crops the bottle cap or text) */}
              <img
                src={slide.desktopImage}
                alt={slide.name || 'Hero Banner'}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="hidden md:block w-full h-auto max-h-[92vh] object-contain select-none mx-auto"
              />

              {/* Mobile Image Banner (Preserved for small devices) */}
              <img
                src={slide.mobileImage || slide.desktopImage}
                alt={slide.name || 'Hero Banner Mobile'}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="block md:hidden w-full h-auto aspect-[4/5] object-cover object-center select-none"
              />
            </a>
          </div>
        ))}
      </div>

      {/* Left Navigation Arrow */}
      {slides.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-[#d6a13d] text-white hover:text-black border border-white/20 hover:border-[#d6a13d] items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Navigation Arrow */}
      {slides.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-[#d6a13d] text-white hover:text-black border border-white/20 hover:border-[#d6a13d] items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Interactive Indicator Dots (Hollow Ring for Active, Solid for Inactive) */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {slides.map((s, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="cursor-pointer flex items-center justify-center p-1 transition-all focus:outline-none"
              >
                {isActive ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-transparent shadow-xs transition-all duration-300" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white opacity-80 hover:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
