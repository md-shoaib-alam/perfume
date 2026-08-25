'use client';
import React, { useRef, useState } from 'react';

const REELS = [
  {
    title: 'Dark Cacao',
    price: 'Rs. 8,500',
    subtitle: 'By Midnight',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Haute Vetiver',
    price: 'Rs. 8,500',
    subtitle: 'Master Perfumer Gloves',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Indian Wild Vetiver',
    price: 'Rs. 8,500',
    subtitle: 'Wild Roots',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Anything Like This Before',
    price: 'Rs. 8,500',
    subtitle: 'Dew Drops',
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Tsunara Fresh',
    price: 'Rs. 7,990',
    subtitle: 'Oceanic Rain',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
  }
];

const LOGOS = ['VOGUE', 'COSMOPOLITAN', 'GQ', 'ELLE', 'GRAZIA', 'FORBES', "HARPER'S BAZAAR", "L'OFFICIEL"];

export const ReelShortsSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="py-14 bg-white text-slate-900 font-serif">
      {/* Featured In Logos Header with Infinite Right-to-Left Marquee Slider */}
      <div className="w-full text-center mb-10 overflow-hidden">
        <h3 className="text-xl font-serif tracking-wider text-slate-800 mb-6">
          Featured In
        </h3>
        <div className="w-full overflow-hidden py-2 bg-white relative">
          {/* Edge gradient fades for luxury transition */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee Track 1 + Track 2 (100% gapless infinite loop) */}
          <div className="flex w-max overflow-hidden">
            {/* Track 1 */}
            <div className="flex shrink-0 animate-marquee space-x-12 sm:space-x-16 items-center text-slate-900 font-serif font-bold text-xl sm:text-2xl tracking-widest pr-12 sm:pr-16">
              {LOGOS.map((logo, idx) => (
                <span 
                  key={`l1-${idx}`} 
                  className="hover:text-[#d6a750] transition-colors cursor-pointer whitespace-nowrap uppercase"
                >
                  {logo}
                </span>
              ))}
            </div>

            {/* Track 2 */}
            <div className="flex shrink-0 animate-marquee space-x-12 sm:space-x-16 items-center text-slate-900 font-serif font-bold text-xl sm:text-2xl tracking-widest pr-12 sm:pr-16" aria-hidden="true">
              {LOGOS.map((logo, idx) => (
                <span 
                  key={`l2-${idx}`} 
                  className="hover:text-[#d6a750] transition-colors cursor-pointer whitespace-nowrap uppercase"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Reel Shorts Cards with Mouse Grab Scroll & Matching Navbar Max Width */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto select-none py-2 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-5 min-w-max">
          {REELS.map((reel, idx) => (
            <div
              key={idx}
              className="w-56 sm:w-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-200/20 shadow-md group flex flex-col justify-between cursor-pointer transform transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="relative aspect-[9/16] overflow-hidden">
                <img
                  src={reel.image}
                  alt={reel.title}
                  draggable={false}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#d6a750]">
                    {reel.subtitle}
                  </span>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white leading-tight">{reel.title}</h4>
                    <p className="font-sans text-xs text-slate-300 font-semibold mt-1">{reel.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
