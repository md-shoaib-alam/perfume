'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

export interface ReelShort {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  image: string;
}

export const ReelsPressManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [reels, setReels] = useState<ReelShort[]>([]);
  const [logos, setLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit / Modal State
  const [editingReel, setEditingReel] = useState<ReelShort | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLogoName, setNewLogoName] = useState('');
  const [saveToast, setSaveToast] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reelsData, logosData] = await Promise.all([
        api.getReels(),
        api.getPressLogos()
      ]);
      setReels(reelsData || []);
      setLogos(logosData || []);
    } catch (e) {
      console.error('Failed to load reels/press:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const saveReelsToStorage = async (updated: ReelShort[]) => {
    setReels(updated);
    await api.saveReels(updated);
    window.dispatchEvent(new Event('neesh_reels_updated'));
    showToast('Reels updated successfully!');
  };

  const saveLogosToStorage = async (updated: string[]) => {
    setLogos(updated);
    await api.savePressLogos(updated);
    window.dispatchEvent(new Event('neesh_reels_updated'));
    showToast('Press logos updated successfully!');
  };

  const handleOpenAddModal = () => {
    setEditingReel(null);
    setTitle('');
    setSubtitle('By Midnight');
    setPrice('Rs. 8,500');
    setImage('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reel: ReelShort) => {
    setEditingReel(reel);
    setTitle(reel.title);
    setSubtitle(reel.subtitle);
    setPrice(reel.price);
    setImage(reel.image);
    setIsModalOpen(true);
  };

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) return;

    if (editingReel) {
      const updated = reels.map((r) =>
        r.id === editingReel.id ? { ...r, title, subtitle, price, image } : r
      );
      await saveReelsToStorage(updated);
    } else {
      const newReel: ReelShort = {
        id: `reel-${Date.now()}`,
        title,
        subtitle,
        price,
        image
      };
      await saveReelsToStorage([...reels, newReel]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteReel = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Reel Short',
      message: 'Are you sure you want to delete this Reel short from the homepage?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (confirmed) {
      const updated = reels.filter((r) => r.id !== id);
      await saveReelsToStorage(updated);
    }
  };

  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogoName.trim()) return;
    const upper = newLogoName.trim().toUpperCase();
    if (logos.includes(upper)) {
      await showAlert({
        title: 'Duplicate Logo',
        message: 'This publication is already in the list.',
        variant: 'warning'
      });
      return;
    }
    const updated = [...logos, upper];
    await saveLogosToStorage(updated);
    setNewLogoName('');
  };

  const handleRemoveLogo = async (index: number) => {
    const updated = logos.filter((_, i) => i !== index);
    await saveLogosToStorage(updated);
  };

  const handleResetDefaults = async () => {
    const confirmed = await showConfirm({
      title: 'Reset to Clean State',
      message: 'Remove all custom reels and press logos?',
      confirmText: 'Reset',
      variant: 'warning'
    });
    if (confirmed) {
      await saveReelsToStorage([]);
      await saveLogosToStorage([]);
    }
  };

  return (
    <div className="space-y-10 font-sans pb-12">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c59b48] fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Reels Shorts & Featured In Press Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your homepage vertical 9:16 reel cards and the continuous &quot;Featured In&quot; press publications ticker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>Add New Reel</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {saveToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-fade-in-up flex items-center gap-2">
          <span>✓</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: REELS SHORT CARDS MANAGEMENT                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              1. Vertical Video Reel Shorts ({reels.length} Active Cards)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These cards appear on your homepage in the interactive horizontal swipe reel showcase.
            </p>
          </div>
          <span className="text-xs bg-[#c59b48]/10 text-[#c59b48] font-bold px-3 py-1 rounded-full">
            9:16 Aspect Ratio
          </span>
        </div>

        {/* Horizontal Swipe Reel Cards Container */}
        <div className="overflow-x-auto pb-4 pt-1 select-none flex gap-4 sm:gap-5 [scrollbar-width:thin] scrollbar-thumb-slate-300">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="w-38 sm:w-48 bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 flex flex-col justify-between group shrink-0 transition-all duration-300 hover:shadow-xl hover:border-[#c59b48]/50"
            >
              {/* Image Preview with 9:16 ratio */}
              <div className="relative aspect-[9/16] overflow-hidden bg-slate-900">
                <img
                  src={reel.image}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Top Subtitle Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-block bg-black/75 backdrop-blur-md text-[#d6a750] px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-widest uppercase border border-[#d6a750]/30 shadow-xs">
                    {reel.subtitle}
                  </span>
                </div>

                {/* Bottom Overlay Text */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 pt-6 flex flex-col justify-end">
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-white leading-tight truncate">{reel.title}</h4>
                  <p className="text-[11px] sm:text-xs text-[#d6a750] font-semibold mt-0.5">{reel.price}</p>
                </div>
              </div>

              {/* Bottom Integrated Action Bar */}
              <div className="p-2 sm:p-2.5 bg-slate-900 flex items-center gap-1.5 sm:gap-2 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEditModal(reel)}
                  className="flex-1 py-1.5 px-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-[11px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteReel(reel.id)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Delete Reel"
                >
                  <svg className="w-3.5 h-3.5 fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* "+ Add New Reel" Dashed Placeholder Card */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-38 sm:w-48 aspect-[9/16] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#c59b48] bg-slate-50/60 hover:bg-[#c59b48]/5 flex flex-col items-center justify-center p-4 text-center transition-all duration-300 group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white group-hover:bg-[#c59b48] text-slate-400 group-hover:text-white flex items-center justify-center shadow-xs mb-2 sm:mb-3 transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover:text-[#c59b48] transition-colors">
              Add New Reel
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
              9:16 Vertical Card
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: FEATURED IN PRESS LOGOS MANAGEMENT                 */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            2. &quot;Featured In&quot; Press Publications Ticker ({logos.length} Publications)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Add or remove fashion magazines and press features that continuously scroll on your homepage ticker.
          </p>
        </div>

        {/* Add Logo Form */}
        <form onSubmit={handleAddLogo} className="flex gap-3 max-w-md">
          <input
            type="text"
            value={newLogoName}
            onChange={(e) => setNewLogoName(e.target.value)}
            placeholder="e.g. GQ, VOGUE, FORBES, MEN'S HEALTH"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold uppercase focus:outline-none focus:border-[#c59b48]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            + Add Publication
          </button>
        </form>

        {/* Existing Logos Grid / Pills */}
        <div className="flex flex-wrap gap-3 pt-2">
          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs font-serif font-bold text-sm text-slate-800"
            >
              <span>{logo}</span>
              <button
                type="button"
                onClick={() => handleRemoveLogo(idx)}
                className="w-4 h-4 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-500 flex items-center justify-center text-[10px] cursor-pointer transition-colors"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Marquee Live Simulation Preview */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Homepage Preview:</p>
          <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-hidden relative">
            <div className="flex animate-marquee space-x-12 items-center text-slate-900 font-serif font-bold text-lg tracking-widest">
              {logos.concat(logos).map((l, i) => (
                <span key={i} className="whitespace-nowrap uppercase text-slate-700">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT REEL                                        */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-fade-in-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-900">
                {editingReel ? 'Edit Reel Card' : 'Add New Reel Card'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fragrance Name (Title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dark Cacao, Haute Vetiver"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#c59b48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Top Badge / Subtitle</label>
                  <input
                    type="text"
                    required
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. By Midnight, Wild Roots"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#c59b48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price Tag</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. Rs. 8,500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#c59b48]"
                  />
                </div>
              </div>

              <MediaUploader
                label="Vertical Cover Media (Image or Video) *"
                value={image}
                onChange={(url) => setImage(url)}
                helperText="Upload vertical video or 9:16 cover photo."
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {editingReel ? 'Save Changes' : 'Add Reel'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
