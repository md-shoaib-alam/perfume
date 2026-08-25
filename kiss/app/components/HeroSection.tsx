'use client';

import React, { useState, useEffect, useRef } from 'react';

interface HeroSlide {
  id: string;
  badgeText: string;
  topTagline: string;
  title: string;
  subtitle: string;
  sourceQuote: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  bottleImage: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badgeText: 'VINTAGE HARVEST 2026',
    topTagline: 'ARGUABLY THE',
    title: 'LONGEST - LASTING',
    subtitle: 'FRESHIE ON THE PLANET',
    sourceQuote: '- Forbes',
    buttonText: 'SHOP NOW',
    buttonLink: '#bestsellers',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80',
    bottleImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'slide-2',
    badgeText: 'ROYAL ACCORD',
    topTagline: 'CRAFTED WITH PURE OUD',
    title: 'DARK CACAO NOIR',
    subtitle: 'EXTRAIT DE PARFUM 30%',
    sourceQuote: '- GQ India',
    buttonText: 'EXPLORE NOIR',
    buttonLink: '#catalog',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2000&q=80',
    bottleImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'slide-3',
    badgeText: 'LIMITED EDITION',
    topTagline: 'MASTER PERFUMER EXCLUSIVE',
    title: 'HAUTE VETIVER',
    subtitle: 'RAW EARTH & RAW CACAO',
    sourceQuote: '- Vogue',
    buttonText: 'DISCOVER VINTAGE',
    buttonLink: '#catalog',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=80',
    bottleImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
  }
];

// Clean up any legacy duplicate bottle backgrounds
const sanitizeHeroSlides = (loaded: HeroSlide[]): HeroSlide[] => {
  return loaded.map((s, idx) => {
    // If the background image is accidentally a perfume bottle photo, replace with atmospheric texture
    if (s.image?.includes('1592945403244') || s.image?.includes('1594035910387') || s.image?.includes('1547887537')) {
      const defaultBg = DEFAULT_SLIDES[idx]?.image || DEFAULT_SLIDES[0].image;
      return { ...s, image: defaultBg };
    }
    return s;
  });
};

interface HeroSectionProps {
  onShopNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow }) => {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number>(0);

  // Load slides dynamically from storage & sync
  useEffect(() => {
    const loadSlides = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('neesh_hero_slides');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(sanitizeHeroSlides(parsed));
              return;
            }
          }
        }
      } catch (e) {}
      setSlides(DEFAULT_SLIDES);
    };

    loadSlides();
    window.addEventListener('neesh_hero_updated', loadSlides);
    window.addEventListener('storage', loadSlides);
    return () => {
      window.removeEventListener('neesh_hero_updated', loadSlides);
      window.removeEventListener('storage', loadSlides);
    };
  }, []);

  // Automatic slide interval (every 5.5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[80vh] sm:min-h-[85vh] bg-black text-white flex items-center justify-center overflow-hidden border-b border-[#b69254]/30 pt-16 sm:pt-20 select-none group"
    >
      {/* Background Graphic Cross-Fade Layers (Dark Ambient Textures, NO duplicate bottles) */}
      {slides.map((slide, idx) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out ${
            idx === currentIndex
              ? 'opacity-30 scale-100'
              : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`
          }}
        />
      ))}

      {/* Dark Luxury Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black pointer-events-none" />

      {/* Smooth Sliding Multi-Track Viewport */}
      <div className="relative z-10 w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full will-change-transform"
          style={{
            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`
          }}
        >
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id}
                className="w-full shrink-0 min-w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Left Luxury Bottle Showcase Card */}
                <div className="md:col-span-6 flex justify-center order-2 md:order-1">
                  <div
                    className={`relative w-64 sm:w-80 md:w-96 aspect-[3/4] p-3 sm:p-4 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent rounded-3xl border border-[#b69254]/30 shadow-2xl flex items-center justify-center transition-all duration-700 overflow-hidden ${
                      isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
                    }`}
                  >
                    <img
                      src={slide.bottleImage}
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-2xl drop-shadow-[0_0_45px_rgba(214,161,61,0.35)] transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Right Headline, Quote & Call-to-Action */}
                <div className="md:col-span-6 text-center md:text-left space-y-4 sm:space-y-6 font-serif order-1 md:order-2">
                  
                  {/* Top Pill Badge */}
                  <div className="flex justify-center md:justify-start">
                    <span
                      className={`inline-block px-3 py-1 bg-[#d6a750]/20 text-[#d6a13d] border border-[#d6a13d]/40 font-sans text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-full shadow-xs transition-all duration-700 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                      }`}
                    >
                      {slide.badgeText}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-sans uppercase tracking-[0.3em] text-[#d6a13d] font-semibold block transition-all duration-700 delay-75 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    {slide.topTagline}
                  </span>

                  <h1
                    className={`text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#d6a13d] leading-none transition-all duration-700 delay-100 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {slide.title}
                  </h1>

                  <p
                    className={`text-base sm:text-xl font-sans text-slate-200 tracking-wider font-light transition-all duration-700 delay-150 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {slide.subtitle}
                  </p>

                  <p
                    className={`text-sm font-serif italic text-slate-400 transition-all duration-700 delay-200 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {slide.sourceQuote}
                  </p>

                  <div
                    className={`pt-2 sm:pt-4 flex justify-center md:justify-start gap-4 transition-all duration-700 delay-300 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <button
                      onClick={onShopNow}
                      className="px-8 sm:px-10 py-3.5 bg-transparent border-2 border-[#d6a13d] text-[#d6a13d] hover:bg-[#d6a13d] hover:text-black font-sans font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-md cursor-pointer active:scale-95"
                    >
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Left Navigation Arrow */}
      {slides.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-[#d6a13d] text-white hover:text-black border border-white/20 hover:border-[#d6a13d] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xl active:scale-95"
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
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-[#d6a13d] text-white hover:text-black border border-white/20 hover:border-[#d6a13d] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Interactive Slider Indicator Dots matching design (Hollow Ring for Active, Solid for Inactive) */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {slides.map((s, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="cursor-pointer flex items-center justify-center p-1 transition-all"
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
