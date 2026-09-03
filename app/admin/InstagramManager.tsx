'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirmModal } from '../context/ConfirmModalContext';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';

export interface InstagramItem {
  id: string;
  image: string;
  instagramUrl?: string;
  caption?: string;
}

export interface InstagramData {
  title: string;
  handle: string;
  profileUrl: string;
  items: InstagramItem[];
}

export const InstagramManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirmModal();

  const [data, setData] = useState<InstagramData>({
    title: 'Get Inspired',
    handle: '@bakhoorbliss',
    profileUrl: 'https://instagram.com',
    items: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InstagramItem | null>(null);
  const [modalImage, setModalImage] = useState('');
  const [modalInstagramUrl, setModalInstagramUrl] = useState('');
  const [modalCaption, setModalCaption] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInstagramPosts();
      if (res) {
        setData({
          title: res.title || 'Get Inspired',
          handle: res.handle || '@bakhoorbliss',
          profileUrl: res.profileUrl || 'https://instagram.com',
          items: Array.isArray(res.items) ? res.items : []
        });
      }
    } catch (err) {
      console.error('Failed to load Instagram data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAll = async (updatedData: InstagramData, toastMsg = 'Instagram showcase updated successfully.') => {
    setIsSaving(true);
    try {
      const ok = await api.saveInstagramPosts(updatedData);
      if (ok) {
        setData(updatedData);
        setSaveToast(toastMsg);
        setTimeout(() => setSaveToast(null), 3000);
        return true;
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (err: any) {
      await showAlert({
        title: 'Save Failed',
        message: err.message || 'Could not save Instagram showcase settings.',
        variant: 'danger'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalImage('');
    setModalInstagramUrl('');
    setModalCaption('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InstagramItem) => {
    setEditingItem(item);
    setModalImage(item.image);
    setModalInstagramUrl(item.instagramUrl || '');
    setModalCaption(item.caption || '');
    setIsModalOpen(true);
  };

  const handleSaveModalItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalImage) {
      await showAlert({
        title: 'Image Required',
        message: 'Please upload an image for this showcase post.',
        variant: 'warning'
      });
      return;
    }

    if (editingItem) {
      const oldImage = editingItem.image;
      const updatedItems = data.items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              image: modalImage,
              instagramUrl: modalInstagramUrl.trim() || undefined,
              caption: modalCaption.trim() || undefined
            }
          : item
      );

      const nextData: InstagramData = { ...data, items: updatedItems };
      const success = await handleSaveAll(nextData, 'Instagram post updated successfully.');
      if (success) {
        if (oldImage && oldImage !== modalImage && oldImage.includes('appwrite')) {
          deleteMediaFromAppwrite(oldImage).catch(() => {});
        }
        setIsModalOpen(false);
      }
    } else {
      const newItem: InstagramItem = {
        id: `ig-${Date.now()}`,
        image: modalImage,
        instagramUrl: modalInstagramUrl.trim() || undefined,
        caption: modalCaption.trim() || undefined
      };

      const nextData: InstagramData = { ...data, items: [...data.items, newItem] };
      const success = await handleSaveAll(nextData, 'New Instagram post added successfully.');
      if (success) {
        setIsModalOpen(false);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    const target = data.items.find((i) => i.id === id);
    const confirmed = await showConfirm({
      title: 'Delete Showcase Post',
      message: 'Are you sure you want to remove this photo from the Instagram showcase?',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (confirmed) {
      const nextItems = data.items.filter((i) => i.id !== id);
      const nextData: InstagramData = { ...data, items: nextItems };
      const success = await handleSaveAll(nextData, 'Post removed successfully.');
      if (success && target?.image && target.image.includes('appwrite')) {
        deleteMediaFromAppwrite(target.image).catch(() => {});
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      
      {/* Top Header Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#c59b48]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>Instagram &quot;Get Inspired&quot; Showcase Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your homepage Instagram gallery, custom section title, profile handle, and embed post links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>Add New Post</span>
        </button>
      </div>

      {/* Toast Alert */}
      {saveToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-fade-in-up flex items-center gap-2">
          <span>✓</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header & Profile Details Settings Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
          1. Header & Instagram Handle Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] transition-all"
              placeholder="e.g. Get Inspired"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instagram Handle
            </label>
            <input
              type="text"
              value={data.handle}
              onChange={(e) => setData({ ...data, handle: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#d6a750] transition-all"
              placeholder="e.g. @bakhoorbliss"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instagram Profile URL
            </label>
            <input
              type="text"
              value={data.profileUrl}
              onChange={(e) => setData({ ...data, profileUrl: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750] transition-all"
              placeholder="https://instagram.com/bakhoorbliss"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveAll(data, 'Header settings saved successfully.')}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Header Settings'}
          </button>
        </div>
      </div>

      {/* Showcase Photos Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              2. Active Showcase Photos ({data.items.length} Posts)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Square lifestyle and fragrance photography displayed on your storefront homepage.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
            Loading showcase gallery...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {data.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-xs flex flex-col group"
              >
                {/* Square Image Box */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.caption || `Instagram post ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  
                  {item.instagramUrl && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md text-[10px]">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card Bottom / Action Buttons */}
                <div className="p-2 bg-slate-50 flex items-center gap-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="flex-1 py-1 px-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs text-center"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 bg-slate-200 hover:bg-rose-600 text-slate-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Delete Post"
                  >
                    <svg className="w-3 h-3 fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* "+ Add New Photo" Dashed Card */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#c59b48] bg-slate-50/60 hover:bg-[#c59b48]/5 flex flex-col items-center justify-center p-3 text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#c59b48] text-slate-400 group-hover:text-white flex items-center justify-center shadow-xs mb-1.5 transition-colors">
                <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-bold text-slate-700 group-hover:text-[#c59b48] text-[11px] transition-colors">
                Add Post
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">
                1:1 Square Photo
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Instagram Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Instagram Post' : 'Add New Instagram Post'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4 text-xs">
              
              {/* Media Uploader */}
              <div>
                <MediaUploader
                  label="Showcase Photo (1:1 Square)"
                  value={modalImage}
                  onChange={setModalImage}
                  helperText="Upload high-res square photo (Auto-compressed to AVIF/WebP)."
                />
              </div>

              {/* Instagram Post Link */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Direct Instagram Post / Reel URL (Optional)
                </label>
                <input
                  type="url"
                  value={modalInstagramUrl}
                  onChange={(e) => setModalInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/C_..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750] transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When visitors click this image on the homepage, they will be taken directly to this post.
                </p>
              </div>

              {/* Caption */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Caption / Alt Text (Optional)
                </label>
                <input
                  type="text"
                  value={modalCaption}
                  onChange={(e) => setModalCaption(e.target.value)}
                  placeholder="e.g. Signature Haute Vetiver Extrait"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750] transition-all"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
