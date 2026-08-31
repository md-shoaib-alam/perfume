'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

import { Product } from '../types';

export interface ReelShort {
  id: string;
  title: string;
  price: string;
  subtitle?: string;
  image: string;
  productId?: string;
  productImage?: string;
}

export interface PressPublication {
  id?: string;
  name: string;
  image?: string;
}

export const ReelsPressManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [reels, setReels] = useState<ReelShort[]>([]);
  const [logos, setLogos] = useState<(string | PressPublication)[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit / Modal State
  const [editingReel, setEditingReel] = useState<ReelShort | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoImage, setNewLogoImage] = useState('');
  const [saveToast, setSaveToast] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productImage, setProductImage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reelsData, logosData, prodsData] = await Promise.all([
        api.getReels(),
        api.getPressLogos(),
        api.getProducts()
      ]);
      setReels(reelsData || []);
      setLogos(logosData || []);
      setProducts(prodsData || []);
    } catch (e) {
      console.error('Failed to load reels/press/products:', e);
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
    try {
      await api.saveReels(updated);
      setReels(updated);
      window.dispatchEvent(new Event('neesh_reels_updated'));
      showToast('Reels updated successfully!');
      return true;
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Reels',
        message: `Failed to save reels: ${err?.message || 'An unknown error occurred'}`,
        variant: 'danger'
      });
      return false;
    }
  };

  const saveLogosToStorage = async (updated: (string | PressPublication)[]) => {
    try {
      await api.savePressLogos(updated);
      setLogos(updated);
      window.dispatchEvent(new Event('neesh_reels_updated'));
      showToast('Press logos updated successfully!');
      return true;
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Press Logos',
        message: `Failed to save press logos: ${err?.message || 'An unknown error occurred'}`,
        variant: 'danger'
      });
      return false;
    }
  };

  const handleOpenAddModal = () => {
    setEditingReel(null);
    setSelectedProductId('');
    setTitle('');
    setPrice('Rs. 8,500');
    setImage('');
    setProductImage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reel: ReelShort) => {
    setEditingReel(reel);
    setSelectedProductId(reel.productId || '');
    setTitle(reel.title);
    setPrice(reel.price);
    setImage(reel.image);
    setProductImage(reel.productImage || '');
    setIsModalOpen(true);
  };

  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    if (!prodId) return;
    const prod = products.find((p) => String(p.id) === String(prodId));
    if (prod) {
      setTitle(prod.name);
      setPrice(`Rs. ${Number(prod.price || 0).toLocaleString()}`);
      const thumb = (prod.images && prod.images.length > 0) ? prod.images[0] : (prod.image || '');
      setProductImage(thumb);
    }
  };

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      await showAlert({
        title: 'Media Required',
        message: 'Please provide a title and upload a cover media before saving.',
        variant: 'warning'
      });
      return;
    }

    if (editingReel) {
      const oldImage = editingReel.image;
      const updated = reels.map((r) =>
        r.id === editingReel.id
          ? {
              ...r,
              title,
              price,
              image,
              productId: selectedProductId || undefined,
              productImage: productImage || undefined
            }
          : r
      );
      const success = await saveReelsToStorage(updated);
      if (success) {
        if (oldImage && oldImage !== image) {
          deleteMediaFromAppwrite(oldImage).catch(() => {});
        }
        setIsModalOpen(false);
      }
    } else {
      const newReel: ReelShort = {
        id: `reel-${Date.now()}`,
        title,
        price,
        image,
        productId: selectedProductId || undefined,
        productImage: productImage || undefined
      };
      const success = await saveReelsToStorage([...reels, newReel]);
      if (success) setIsModalOpen(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Reel Short',
      message: 'Are you sure you want to delete this Reel short from the homepage?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (confirmed) {
      const target = reels.find((r) => r.id === id);
      const updated = reels.filter((r) => r.id !== id);
      const success = await saveReelsToStorage(updated);
      if (success && target?.image) {
        deleteMediaFromAppwrite(target.image).catch(() => {});
      }
    }
  };

  const handleAddLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newLogoName.trim();
    const image = newLogoImage.trim();

    if (!name && !image) {
      await showAlert({
        title: 'Publication Required',
        message: 'Please enter a brand/magazine name or upload a logo image.',
        variant: 'warning'
      });
      return;
    }

    const newItem: PressPublication = {
      id: `press-${Date.now()}`,
      name: name || 'FEATURED',
      ...(image ? { image } : {})
    };

    const updated = [...logos, newItem];
    await saveLogosToStorage(updated);
    setNewLogoName('');
    setNewLogoImage('');
  };

  const handleRemoveLogo = async (index: number) => {
    const target = logos[index];
    const updated = logos.filter((_, i) => i !== index);
    const success = await saveLogosToStorage(updated);
    if (success) {
      if (typeof target === 'object' && target?.image) {
        deleteMediaFromAppwrite(target.image).catch(() => {});
      } else if (typeof target === 'string' && (target.startsWith('http') || target.startsWith('/'))) {
        deleteMediaFromAppwrite(target).catch(() => {});
      }
    }
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
              className="w-40 sm:w-52 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 flex flex-col justify-between group shrink-0"
            >
              {/* Top Media Preview with 9:16 ratio */}
              <div className="relative aspect-[9/16] overflow-hidden bg-slate-900">
                <img
                  src={reel.image}
                  alt={reel.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom White Product Details Section */}
              <div className="bg-white px-3.5 pb-3.5 pt-1 text-center relative flex flex-col items-center border-t border-slate-100">
                {/* Product Thumbnail (Overlaps the bottom edge of the 9:16 media) */}
                {reel.productImage && (
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-md -mt-7 mb-2 overflow-hidden flex items-center justify-center shrink-0 z-10 p-0.5">
                    <img
                      src={reel.productImage}
                      alt={reel.title}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Fragrance Title */}
                <h4 className="font-serif text-sm font-bold text-slate-900 leading-snug truncate max-w-full px-1">
                  {reel.title}
                </h4>

                {/* Price Tag */}
                <p className="font-sans text-xs text-slate-600 font-semibold mt-0.5">
                  {reel.price}
                </p>
              </div>

              {/* Bottom Integrated Action Bar */}
              <div className="p-2 sm:p-2.5 bg-slate-50 flex items-center gap-1.5 sm:gap-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(reel)}
                  className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteReel(reel.id)}
                  className="p-1.5 bg-slate-200 hover:bg-rose-600 text-slate-600 hover:text-white rounded-lg transition-colors cursor-pointer"
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
            Add fashion magazines, press features, or brand logo images that continuously scroll on your homepage ticker.
          </p>
        </div>

        {/* Add Logo Form */}
        <form onSubmit={handleAddLogo} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publication / Brand Name
              </label>
              <input
                type="text"
                value={newLogoName}
                onChange={(e) => setNewLogoName(e.target.value)}
                placeholder="e.g. GQ, VOGUE, FORBES, MEN'S HEALTH"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#c59b48]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Displays as text in ticker or used as image alt tag.
              </p>
            </div>

            <div>
              <MediaUploader
                label="Brand Logo Image (Optional)"
                value={newLogoImage}
                onChange={(url) => setNewLogoImage(url)}
                helperText="Upload transparent PNG/SVG/WebP/AVIF. Auto-compressed & stored in Appwrite."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200/60">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Publication</span>
            </button>
          </div>
        </form>

        {/* Existing Logos Grid */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active Ticker Items:</p>
          {logos.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No publications added yet. Add your first brand logo or text above.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {logos.map((item, idx) => {
                const isObj = typeof item === 'object' && item !== null;
                const name = isObj ? item.name : item;
                const image = isObj ? item.image : (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/')) ? item : undefined);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {image ? (
                        <div className="w-10 h-7 bg-white rounded border border-slate-200 p-1 flex items-center justify-center shrink-0">
                          <img src={image} alt={name} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-amber-100 text-[#916618] flex items-center justify-center text-[10px] font-bold shrink-0">
                          T
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate uppercase">{name || 'Logo'}</p>
                        <span className="text-[9.5px] font-medium text-slate-400">
                          {image ? 'Image Logo' : 'Text Only'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(idx)}
                      className="w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-500 flex items-center justify-center text-[11px] cursor-pointer transition-colors shrink-0"
                      title="Remove Publication"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marquee Live Simulation Preview */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Homepage Preview:</p>
          <div className="w-full bg-white p-6 rounded-xl border border-slate-200 overflow-hidden relative shadow-2xs">
            {/* @ts-ignore */}
            <marquee
              behavior="scroll"
              direction="left"
              scrollamount="6"
              className="w-full overflow-hidden py-1"
              onMouseEnter={(e: any) => e.currentTarget?.stop && e.currentTarget.stop()}
              onMouseLeave={(e: any) => e.currentTarget?.start && e.currentTarget.start()}
            >
              <div className="inline-flex items-center gap-16 sm:gap-24">
                {logos.map((item, i) => {
                  const isObj = typeof item === 'object' && item !== null;
                  const name = isObj ? item.name : item;
                  const image = isObj ? item.image : (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/')) ? item : undefined);

                  return (
                    <div key={i} className="inline-flex items-center mx-8 sm:mx-14 select-none">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-[30px] md:h-[40px] xl:h-[50px] max-w-[220px] object-contain hover:opacity-90 transition-all"
                        />
                      ) : (
                        <span className="whitespace-nowrap uppercase font-serif font-black text-xl md:text-2xl xl:text-3xl tracking-widest text-slate-900">
                          {name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </marquee>
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

            <form onSubmit={handleSaveReel} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              {/* Product Selector Dropdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Link Store Product (Auto-Fill Content)
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#c59b48]"
                >
                  <option value="">-- Select a Product to Auto-Fill (Optional) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Rs. {Number(p.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selecting a product automatically fills the name, price, and thumbnail image below.
                </p>
              </div>

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

              {/* Product Thumbnail Image (Bottle / Box) */}
              <MediaUploader
                label="Product Bottle Thumbnail (Shows below the reel video)"
                value={productImage}
                onChange={(url) => setProductImage(url)}
                helperText="Square bottle thumbnail displayed overlapping the bottom card."
              />

              {/* 9:16 Vertical Reel Video/Photo */}
              <MediaUploader
                label="Vertical Cover Media (9:16 Video or Photo) *"
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
