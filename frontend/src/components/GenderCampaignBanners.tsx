import React from 'react';

interface GenderCampaignBannersProps {
  onSelectGender?: (gender: 'For Him' | 'For Her') => void;
}

const CAMPAIGNS = [
  {
    id: 'for-him',
    title: 'For Him',
    gender: 'For Him' as const,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'for-her',
    title: 'For Her',
    gender: 'For Her' as const,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
  }
];

export const GenderCampaignBanners: React.FC<GenderCampaignBannersProps> = ({ onSelectGender }) => {
  const handleClick = (e: React.MouseEvent, gender: 'For Him' | 'For Her') => {
    e.preventDefault();
    if (onSelectGender) {
      onSelectGender(gender);
    }
    const elem = document.getElementById('bestsellers');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {CAMPAIGNS.map((item) => (
            <div
              key={item.id}
              onClick={(e) => handleClick(e, item.gender)}
              className="group relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-md cursor-pointer block bg-slate-900 shadow-md"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/30 group-hover:from-black/70 transition-colors duration-300" />

              {/* Top-Left Content */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 text-left">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight drop-shadow-md">
                  {item.title}
                </h3>
                <span className="font-sans text-[11px] sm:text-xs uppercase tracking-widest text-white font-bold border-b border-white pb-0.5 mt-2 inline-block group-hover:text-[#d6a750] group-hover:border-[#d6a750] transition-all">
                  DISCOVER
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
