import React from 'react';

interface TravelSetSectionProps {
  onCustomize: () => void;
}

export const TravelSetSection: React.FC<TravelSetSectionProps> = ({ onCustomize }) => {
  return (
    <section className="py-20 bg-slate-900 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl border border-amber-900/50 p-8 md:p-14 overflow-hidden relative shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-900/50">
                Customizable Luxury Atomizers
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                NEESH MY CLOSET <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                  BUILD YOUR PORTABLE TRAVEL SET
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Choose any 3 or 5 pocket-sized 10ml travel spray atomizers in gold-embossed cases. Perfect for flight carry-ons, evening galas, and on-the-go touchups.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onCustomize}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-full shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  Create Custom Travel Box (₹2,499)
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"
                  alt="Custom Travel Set"
                  className="w-full h-[320px] object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
