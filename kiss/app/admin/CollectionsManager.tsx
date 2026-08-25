'use client';
import React, { useState } from 'react';

export const CollectionsManager: React.FC = () => {
  const [circles, setCircles] = useState([
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
  ]);

  const [savedMessage, setSavedMessage] = useState(false);

  const handleUpdate = (idx: number, field: string, val: string) => {
    const updated = [...circles];
    (updated[idx] as any)[field] = val;
    setCircles(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Collections & Story Circles</h2>
          <p className="text-xs text-slate-500">Manage the 4 round category story circles on the homepage.</p>
        </div>
        {savedMessage && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded">
            ✓ Changes Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {circles.map((item, idx) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#d6a750] p-1 shrink-0 overflow-hidden bg-slate-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex-1">
                <h4 className="font-serif font-bold text-slate-900 text-sm">Circle #{idx + 1}</h4>
                <span className="text-xs text-slate-500">{item.name} {item.subname}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title Line 1</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title Line 2</label>
                <input
                  type="text"
                  value={item.subname}
                  onChange={(e) => handleUpdate(idx, 'subname', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={item.image}
                  onChange={(e) => handleUpdate(idx, 'image', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="sm:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Save All Collections
          </button>
        </div>
      </form>
    </div>
  );
};
