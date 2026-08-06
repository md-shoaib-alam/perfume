import React from 'react';

export const GoldTrustBanner: React.FC = () => {
  return (
    <div className="bg-[#b69254] text-white py-6 px-4 border-y border-[#a07c3e]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center font-sans">
        
        {/* Item 1 */}
        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center font-serif text-xs font-bold shrink-0">
            7 DAYS
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">No Questions Asked Returns</h4>
            <p className="text-[11px] text-white/80 leading-tight">Applicable on first order of 100ml and 50ml perfume bottles only</p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-4 0a1 1 0 01-1-1m-1 0a1 1 0 00-1 1" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">Free & Fast Delivery</h4>
            <p className="text-[11px] text-white/80 leading-tight">on your doorsteps in 3-5 days, with a surprise</p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center justify-center md:justify-start gap-4">
          <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">The Lingering Effect You Want</h4>
            <p className="text-[11px] text-white/80 leading-tight">NEESH™ perfumes are blended with proven ingredients to last 10+ hours (Guaranteed)</p>
          </div>
        </div>

      </div>
    </div>
  );
};
