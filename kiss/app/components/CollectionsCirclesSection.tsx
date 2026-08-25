'use client';
import React from 'react';

interface CollectionCircle {
  id: string;
  name: string;
  subname: string;
  image: string;
}

const COLLECTIONS: CollectionCircle[] = [
  {
    id: 'bureau',
    name: 'Bureau',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'luxe',
    name: 'Luxe',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'haute',
    name: 'Haute',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'miss-neesh',
    name: 'Miss NEESH',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
  }
];

export const CollectionsCirclesSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 sm:gap-10 md:gap-14">
          {COLLECTIONS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex flex-col items-center text-center cursor-pointer transition-transform hover:-translate-y-1"
            >
              {/* Gold Ring Circular Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full p-[2.5px] border-2 border-[#d6a750] bg-white shadow-xs group-hover:shadow-md transition-all">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={`${item.name} ${item.subname}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-2.5 sm:mt-3">
                <span className="block font-sans text-[11px] sm:text-xs md:text-sm font-medium text-slate-800 group-hover:text-[#d6a750] transition-colors leading-tight">
                  {item.name}
                </span>
                <span className="block font-sans text-[11px] sm:text-xs md:text-sm font-medium text-slate-800 group-hover:text-[#d6a750] transition-colors leading-tight">
                  {item.subname}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
