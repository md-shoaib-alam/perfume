'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

export const CollectionsManager: React.FC = () => {
  const { showAlert } = useConfirm();
  const [circles, setCircles] = useState<any[]>([]);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCollections();
        if (data && data.length > 0) {
          setCircles(data);
        }
      } catch (e) {}
    };
    load();
  }, []);

  const handleUpdate = (idx: number, field: string, val: string) => {
    const updated = [...circles];
    (updated[idx] as any)[field] = val;
    setCircles(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let skipped = 0;
      for (const circle of circles) {
        if (!circle.id) {
          skipped++;
          continue;
        }
        await api.updateCollection(circle.id, circle);
      }
      if (skipped > 0) {
        await showAlert({
          title: 'Partially Saved',
          message: `${skipped} collection(s) have no id and were not saved.`,
          variant: 'warning'
        });
      }
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Collections',
        message: `Failed to save collections: ${err.message}`,
        variant: 'danger'
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Collections & Story Circles</h2>
          <p className="text-xs text-slate-500">Manage the 4 round category story circles on the homepage.</p>
        </div>
        {savedMessage && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Changes Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {circles.map((item, idx) => (
          <div key={item.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#d6a750] p-1 shrink-0 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full"
                />
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
                  value={item.name || ''}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title Line 2</label>
                <input
                  type="text"
                  value={item.subname || ''}
                  onChange={(e) => handleUpdate(idx, 'subname', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <MediaUploader
                label="Story Circle Thumbnail Image *"
                value={item.image || ''}
                onChange={(url) => handleUpdate(idx, 'image', url)}
                helperText="Upload square/round image thumbnail."
              />
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
