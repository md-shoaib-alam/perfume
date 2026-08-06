import React from 'react';

export const AnnouncementBar: React.FC = () => {
  const itemText = "✦ NEW LAUNCH SPECIAL | FLAT 20% OFF | USE CODE : NEW20";

  return (
    <div className="bg-[#c59b48] text-black font-semibold text-[11px] py-2 overflow-hidden uppercase tracking-widest whitespace-nowrap block w-full">
      <div className="animate-marquee gap-8 items-center">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="inline-block px-4">
            {itemText}
          </span>
        ))}
      </div>
    </div>
  );
};
