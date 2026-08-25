import React from 'react';

export const AnnouncementBar: React.FC = () => {
  const itemText = "NEW LAUNCH SPECIAL | FLAT 20% OFF | USE CODE : NEW20 ✦";

  return (
    <div className="announcement-bar group bg-[#caa04c] text-[#222222] font-semibold text-[11px] py-2 overflow-hidden uppercase tracking-widest whitespace-nowrap block w-full select-none cursor-pointer">
      <div className="animate-marquee-slow items-center group-hover:[animation-play-state:paused]">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="inline-block px-3">
            {itemText}
          </span>
        ))}
      </div>
    </div>
  );
};

