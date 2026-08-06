import React from 'react';

interface HeroSectionProps {
  onShopNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow }) => {
  return (
    <div className="relative min-h-[85vh] bg-black text-white flex items-center justify-center overflow-hidden border-b border-[#b69254]/30 pt-16 sm:pt-20">
      {/* Background Graphic Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Big Luxury Bottle */}
        <div className="md:col-span-6 flex justify-center">
          <div className="relative w-72 sm:w-96 aspect-[3/4] p-4 bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl border border-[#b69254]/30 shadow-2xl flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"
              alt="Tsunara Extrait De Parfum"
              className="max-h-[380px] object-contain drop-shadow-[0_0_35px_rgba(214,161,61,0.3)]"
            />
          </div>
        </div>

        {/* Right Headline & CTA */}
        <div className="md:col-span-6 text-center md:text-left space-y-6 font-serif">
          <span className="text-xs font-sans uppercase tracking-[0.3em] text-[#d6a13d] font-semibold block">
            ARGUABLY THE
          </span>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#d6a13d] leading-none">
            LONGEST - LASTING
          </h1>

          <p className="text-lg sm:text-xl font-sans text-slate-200 tracking-wider font-light">
            FRESHIE ON THE PLANET
          </p>

          <p className="text-sm font-serif italic text-slate-400">
            - Forbes
          </p>

          <div className="pt-4">
            <button
              onClick={onShopNow}
              className="px-10 py-3 bg-transparent border-2 border-[#d6a13d] text-[#d6a13d] hover:bg-[#d6a13d] hover:text-black font-sans font-bold text-xs uppercase tracking-widest transition-all rounded-sm shadow-md"
            >
              SHOP NOW
            </button>
          </div>
        </div>

      </div>

      {/* Slider Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <span className="w-2.5 h-2.5 rounded-full bg-white" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/40 border border-white/60" />
      </div>
    </div>
  );
};
