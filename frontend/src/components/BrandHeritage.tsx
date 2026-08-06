import React from 'react';

export const BrandHeritage: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Visual Presentation */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden border border-amber-900/40 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=80"
                alt="Imperial Perfumery Artisans"
                className="w-full h-[450px] object-cover"
              />
            </div>
            {/* Glowing Accent Frame */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 rounded-3xl filter blur-xl -z-10" />
          </div>

          {/* Heritage Content */}
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">Imperial Legacy</span>
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              BOTTLED WITH <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                ROYAL HERITAGE & PARISIAN FINESSE
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              NEESH brings together centuries of Royal Indian Attar-making traditions and modern French haute perfumery. Every fragrance is macerated for 90 days in dark oak barrels to achieve unprecedented longevity and depth.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-amber-900/30">
              <div>
                <span className="font-serif text-3xl font-bold text-amber-300">30%</span>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Oil Concentration (Extrait)</p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-amber-300">90 Days</span>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Oak Barrel Maceration</p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#bestsellers"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-amber-300 hover:text-amber-100 border-b-2 border-amber-400/50 pb-1 hover:border-amber-200 transition-all"
              >
                Discover the Craftsmanship &rarr;
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
