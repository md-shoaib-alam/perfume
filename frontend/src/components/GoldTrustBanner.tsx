import React from 'react';

export const GoldTrustBanner: React.FC = () => {
  return (
    <div className="bg-[#c59b48] text-white py-7 px-4 sm:px-8 border-y border-[#b58b38]">
      <div className="max-w-[1680px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center font-sans">
        
        {/* Item 1 */}
        <div className="flex items-center gap-4 text-left max-w-sm mx-auto md:mx-0">
          <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center font-serif text-[11px] font-extrabold tracking-tight text-white shrink-0 shadow-xs">
            7 DAYS
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-0.5">
              No Questions Asked Returns
            </h4>
            <p className="text-[11px] text-white/90 leading-snug font-normal">
              Applicable on first order of 100ml and 50ml perfume bottles only
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-4 text-left max-w-sm mx-auto md:mx-0">
          <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-4 0a1 1 0 01-1-1m-1 0a1 1 0 00-1 1" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-0.5">
              Free & Fast Delivery
            </h4>
            <p className="text-[11px] text-white/90 leading-snug font-normal">
              on your doorsteps in 3-5 days, with a surprise
            </p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-4 text-left max-w-sm mx-auto md:mx-0">
          <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-0.5">
              The Lingering Effect You Want
            </h4>
            <p className="text-[11px] text-white/90 leading-snug font-normal">
              NEESH™ perfumes are blended with proven ingredients to last 10+ hours (Guaranteed)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
