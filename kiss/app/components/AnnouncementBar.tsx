'use client';
import React from 'react';

const MESSAGES = [
  "NEW LAUNCH SPECIAL | FLAT 20% OFF | USE CODE : NEW20 ✦",
  "FREE SHIPPING ON ORDERS OVER RS. 1,500 ✦",
  "LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE ✦",
  "7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML ✦",
];

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="announcement-bar group bg-[#caa04c] text-[#222222] font-semibold text-[11px] py-2 overflow-hidden uppercase tracking-widest whitespace-nowrap block w-full select-none cursor-pointer relative">
      <div className="flex w-max animate-marquee-slow group-hover:[animation-play-state:paused]">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center gap-12 pr-12">
          {MESSAGES.map((msg, i) => (
            <span key={`t1-${i}`} className="inline-flex items-center">
              {msg}
            </span>
          ))}
        </div>

        {/* Track 2 (Duplicate for 100% gapless infinite loop) */}
        <div className="flex shrink-0 items-center gap-12 pr-12" aria-hidden="true">
          {MESSAGES.map((msg, i) => (
            <span key={`t2-${i}`} className="inline-flex items-center">
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


