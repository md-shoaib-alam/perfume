'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const DEFAULT_MESSAGES = [
  "NEW LAUNCH SPECIAL | FLAT 20% OFF | USE CODE : NEW20",
  "FREE SHIPPING ON ORDERS OVER RS. 1,500",
  "LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE",
  "7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML",
];

const StarSeparator: React.FC = () => (
  <svg
    className="w-2.5 h-2.5 mx-6 fill-current text-[#222222]/80 shrink-0 inline-block"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

export const AnnouncementBar: React.FC = () => {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await api.getSettings();
        if (settings?.announcementText) {
          setMessages([
            settings.announcementText,
            "FREE SHIPPING ON ORDERS OVER RS. 1,500",
            "LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE",
            "7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML",
          ]);
        }
      } catch (e) {}
    };
    load();
    window.addEventListener('focus', load);
    window.addEventListener('neesh_settings_updated', load);
    return () => {
      window.removeEventListener('focus', load);
      window.removeEventListener('neesh_settings_updated', load);
    };
  }, []);

  return (
    <div className="announcement-bar group bg-[#caa04c] text-[#222222] font-semibold text-[11px] py-2 overflow-hidden uppercase tracking-widest whitespace-nowrap block w-full select-none cursor-pointer relative">
      <div className="flex w-max animate-marquee-slow group-hover:[animation-play-state:paused]">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center">
          {messages.map((msg, i) => (
            <span key={`t1-${i}`} className="inline-flex items-center">
              <span>{msg}</span>
              <StarSeparator />
            </span>
          ))}
        </div>

        {/* Track 2 (Duplicate for 100% gapless infinite loop) */}
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {messages.map((msg, i) => (
            <span key={`t2-${i}`} className="inline-flex items-center">
              <span>{msg}</span>
              <StarSeparator />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


