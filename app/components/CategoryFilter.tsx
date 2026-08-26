'use client';
import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Collections' },
  { id: 'extrait-de-parfum', name: 'Extrait De Parfum (100ml)' },
  { id: 'attar', name: 'Imperial Attars (Pure Oil)' },
  { id: 'discovery-set', name: 'Discovery Sets' },
  { id: 'gift-set', name: 'Luxury Gifting Coffrets' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="py-8 bg-slate-950 border-b border-amber-900/20">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center overflow-x-auto no-scrollbar gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-slate-900/80 border border-amber-900/40 text-slate-300 hover:text-amber-200 hover:border-amber-500/40'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
