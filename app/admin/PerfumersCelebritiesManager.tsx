'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { Product } from '../types';
import { slugify } from '../utils/slug';

export interface PerfumerItem {
  id: string;
  name: string;
  award?: string;
  quote?: string;
  bio?: string;
  image?: string;
}

export interface CelebrityItem {
  id: string;
  name: string;
  perfume?: string;
  image?: string;
  bottleThumb?: string;
  targetUrl?: string;
  productId?: string;
}

export const PerfumersCelebritiesManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [activeSection, setActiveSection] = useState<'perfumers' | 'celebrities'>('celebrities');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Data State
  const [perfumers, setPerfumers] = useState<PerfumerItem[]>([]);
  const [celebrities, setCelebrities] = useState<CelebrityItem[]>([]);
  const [celebritySectionTitle, setCelebritySectionTitle] = useState('Worn by 100k+ fragheads, including');
  const [products, setProducts] = useState<Product[]>([]);

  // Title Save State
  const [savingTitle, setSavingTitle] = useState(false);

  // Celebrity Modal State
  const [isCelebModalOpen, setIsCelebModalOpen] = useState(false);
  const [editingCeleb, setEditingCeleb] = useState<CelebrityItem | null>(null);
  const [celebFormName, setCelebFormName] = useState('');
  const [celebFormPerfume, setCelebFormPerfume] = useState('');
  const [celebFormImage, setCelebFormImage] = useState('');
  const [celebFormBottleThumb, setCelebFormBottleThumb] = useState('');
  const [celebFormTargetUrl, setCelebFormTargetUrl] = useState('');
  const [celebFormProductId, setCelebFormProductId] = useState('');
  const [savingCeleb, setSavingCeleb] = useState(false);

  // Perfumer Modal State
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);
  const [editingPerf, setEditingPerf] = useState<PerfumerItem | null>(null);
  const [perfFormName, setPerfFormName] = useState('');
  const [perfFormAward, setPerfFormAward] = useState('');
  const [perfFormQuote, setPerfFormQuote] = useState('');
  const [perfFormBio, setPerfFormBio] = useState('');
  const [perfFormImage, setPerfFormImage] = useState('');
  const [savingPerf, setSavingPerf] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [perfData, celebData, prodData] = await Promise.all([
        api.getPerfumers(),
        api.getCelebrities(),
        api.getProducts()
      ]);
      setPerfumers(Array.isArray(perfData) ? perfData : []);
      if (celebData) {
        if (Array.isArray(celebData)) {
          setCelebrities(celebData);
        } else if (typeof celebData === 'object') {
          setCelebrities(Array.isArray(celebData.items) ? celebData.items : []);
          if (celebData.title) setCelebritySectionTitle(celebData.title);
        }
      }
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch (e) {
      console.error('Failed to load perfumers/celebrities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Title Only
  const handleSaveTitleOnly = async () => {
    setSavingTitle(true);
    try {
      await api.saveCelebrities({
        title: celebritySectionTitle,
        items: celebrities
      });
      window.dispatchEvent(new Event('neesh_celebrities_updated'));
      showToast('Celebrity section heading saved successfully!');
    } catch (err: any) {
      await showAlert({
        title: 'Error',
        message: err.message || 'Failed to save heading.',
        variant: 'danger'
      });
    } finally {
      setSavingTitle(false);
    }
  };

  // -------------------------------------------------------------
  // CELEBRITY MODAL HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddCelebModal = () => {
    setEditingCeleb(null);
    setCelebFormName('');
    setCelebFormPerfume('Signature Extrait');
    setCelebFormImage('');
    setCelebFormBottleThumb('');
    setCelebFormTargetUrl('');
    setCelebFormProductId('');
    setIsCelebModalOpen(true);
  };

  const handleOpenEditCelebModal = (celeb: CelebrityItem) => {
    setEditingCeleb(celeb);
    setCelebFormName(celeb.name || '');
    setCelebFormPerfume(celeb.perfume || '');
    setCelebFormImage(celeb.image || '');
    setCelebFormBottleThumb(celeb.bottleThumb || '');
    setCelebFormTargetUrl(celeb.targetUrl || '');
    setCelebFormProductId(celeb.productId || '');
    setIsCelebModalOpen(true);
  };

  const handleSelectProductForCeleb = (prodId: string) => {
    setCelebFormProductId(prodId);
    if (prodId) {
      const prod = products.find((p) => String(p.id) === String(prodId));
      if (prod) {
        setCelebFormPerfume(prod.name);
        const thumb = prod.images && prod.images.length > 0 ? prod.images[0] : prod.image || '';
        setCelebFormBottleThumb(thumb);
        const slug = slugify(prod.name) || prod.id;
        setCelebFormTargetUrl(`/products/${slug}`);
      }
    }
  };

  const handleSaveCelebModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celebFormName.trim()) {
      await showAlert({
        title: 'Name Required',
        message: 'Please provide a celebrity name.',
        variant: 'warning'
      });
      return;
    }
    if (!celebFormImage.trim()) {
      await showAlert({
        title: 'Photo Required',
        message: 'Please upload a celebrity portrait photo before saving.',
        variant: 'warning'
      });
      return;
    }

    setSavingCeleb(true);
    try {
      let updatedCelebrities: CelebrityItem[] = [];

      if (editingCeleb) {
        updatedCelebrities = celebrities.map((c) =>
          c.id === editingCeleb.id
            ? {
                ...c,
                name: celebFormName.trim(),
                perfume: celebFormPerfume.trim(),
                image: celebFormImage.trim(),
                bottleThumb: celebFormBottleThumb.trim(),
                targetUrl: celebFormTargetUrl.trim(),
                productId: celebFormProductId || undefined
              }
            : c
        );
      } else {
        const newCeleb: CelebrityItem = {
          id: `celeb-${Date.now()}`,
          name: celebFormName.trim(),
          perfume: celebFormPerfume.trim(),
          image: celebFormImage.trim(),
          bottleThumb: celebFormBottleThumb.trim(),
          targetUrl: celebFormTargetUrl.trim(),
          productId: celebFormProductId || undefined
        };
        updatedCelebrities = [...celebrities, newCeleb];
      }

      await api.saveCelebrities({
        title: celebritySectionTitle,
        items: updatedCelebrities
      });
      setCelebrities(updatedCelebrities);
      window.dispatchEvent(new Event('neesh_celebrities_updated'));
      setIsCelebModalOpen(false);
      showToast(editingCeleb ? 'Celebrity updated successfully!' : 'New celebrity added successfully!');
    } catch (err: any) {
      await showAlert({
        title: 'Save Failed',
        message: err.message || 'Failed to save celebrity.',
        variant: 'danger'
      });
    } finally {
      setSavingCeleb(false);
    }
  };

  const handleRemoveCelebrity = async (idx: number) => {
    const celeb = celebrities[idx];
    const confirmed = await showConfirm({
      title: 'Remove Celebrity',
      message: `Are you sure you want to remove "${celeb.name || 'this celebrity'}"?`,
      confirmText: 'Remove',
      variant: 'danger'
    });
    if (confirmed) {
      if (celeb.image) deleteMediaFromAppwrite(celeb.image).catch(() => {});
      if (celeb.bottleThumb) deleteMediaFromAppwrite(celeb.bottleThumb).catch(() => {});
      const updated = celebrities.filter((_, i) => i !== idx);
      try {
        await api.saveCelebrities({
          title: celebritySectionTitle,
          items: updated
        });
        setCelebrities(updated);
        window.dispatchEvent(new Event('neesh_celebrities_updated'));
        showToast('Celebrity removed.');
      } catch (err: any) {
        await showAlert({
          title: 'Error',
          message: 'Failed to update database.',
          variant: 'danger'
        });
      }
    }
  };

  // -------------------------------------------------------------
  // PERFUMER MODAL HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddPerfModal = () => {
    setEditingPerf(null);
    setPerfFormName('');
    setPerfFormAward('Master Nose');
    setPerfFormQuote('Perfumery is the art of memory and emotion.');
    setPerfFormBio('Renowned artisanal nose with decades of experience formulating signature luxury blends.');
    setPerfFormImage('');
    setIsPerfModalOpen(true);
  };

  const handleOpenEditPerfModal = (perf: PerfumerItem) => {
    setEditingPerf(perf);
    setPerfFormName(perf.name || '');
    setPerfFormAward(perf.award || '');
    setPerfFormQuote(perf.quote || '');
    setPerfFormBio(perf.bio || '');
    setPerfFormImage(perf.image || '');
    setIsPerfModalOpen(true);
  };

  const handleSavePerfModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfFormName.trim()) {
      await showAlert({
        title: 'Name Required',
        message: 'Please provide a perfumer name.',
        variant: 'warning'
      });
      return;
    }

    setSavingPerf(true);
    try {
      let updatedPerfumers: PerfumerItem[] = [];

      if (editingPerf) {
        updatedPerfumers = perfumers.map((p) =>
          p.id === editingPerf.id
            ? {
                ...p,
                name: perfFormName.trim(),
                award: perfFormAward.trim(),
                quote: perfFormQuote.trim(),
                bio: perfFormBio.trim(),
                image: perfFormImage.trim()
              }
            : p
        );
      } else {
        const newPerf: PerfumerItem = {
          id: `perfumer-${Date.now()}`,
          name: perfFormName.trim(),
          award: perfFormAward.trim(),
          quote: perfFormQuote.trim(),
          bio: perfFormBio.trim(),
          image: perfFormImage.trim()
        };
        updatedPerfumers = [...perfumers, newPerf];
      }

      await api.savePerfumers(updatedPerfumers);
      setPerfumers(updatedPerfumers);
      setIsPerfModalOpen(false);
      showToast(editingPerf ? 'Perfumer updated successfully!' : 'New perfumer added successfully!');
    } catch (err: any) {
      await showAlert({
        title: 'Save Failed',
        message: err.message || 'Failed to save perfumer.',
        variant: 'danger'
      });
    } finally {
      setSavingPerf(false);
    }
  };

  const handleRemovePerfumer = async (idx: number) => {
    const perf = perfumers[idx];
    const confirmed = await showConfirm({
      title: 'Remove Perfumer',
      message: `Are you sure you want to remove "${perf.name || 'this perfumer'}"?`,
      confirmText: 'Remove',
      variant: 'danger'
    });
    if (confirmed) {
      if (perf.image) deleteMediaFromAppwrite(perf.image).catch(() => {});
      const updated = perfumers.filter((_, i) => i !== idx);
      try {
        await api.savePerfumers(updated);
        setPerfumers(updated);
        showToast('Perfumer removed.');
      } catch (err: any) {
        await showAlert({
          title: 'Error',
          message: 'Failed to update database.',
          variant: 'danger'
        });
      }
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#d6a750]" />
          {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Perfumers & Celebrities Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage master nose biographies, awards, and celebrity fragrance endorsements.
          </p>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Tab Switcher */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setActiveSection('celebrities')}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                activeSection === 'celebrities'
                  ? 'bg-[#c59b48] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Celebrities ({celebrities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('perfumers')}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                activeSection === 'perfumers'
                  ? 'bg-[#c59b48] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Master Perfumers ({perfumers.length})
            </button>
          </div>

          {activeSection === 'celebrities' ? (
            <button
              type="button"
              onClick={handleOpenAddCelebModal}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Add Celebrity</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddPerfModal}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Add Perfumer</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Loading...
        </div>
      ) : activeSection === 'celebrities' ? (
        <div className="space-y-4">
          {/* Section Heading Card with dedicated Save button */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <label className="block text-xs font-bold text-slate-800">
                Celebrities Section Heading (Storefront Title)
              </label>
              <button
                type="button"
                onClick={handleSaveTitleOnly}
                disabled={savingTitle}
                className="self-end sm:self-auto px-4 py-1.5 bg-[#c59b48] hover:bg-[#b58b38] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {savingTitle ? 'Saving...' : 'Save Heading'}
              </button>
            </div>
            <input
              type="text"
              value={celebritySectionTitle}
              onChange={(e) => setCelebritySectionTitle(e.target.value)}
              placeholder="e.g. Worn by 100k+ fragheads, including"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Click &quot;Save Heading&quot; to update the title text above the celebrity cards on the storefront.
            </p>
          </div>

          {/* Celebrities List / Grid */}
          {celebrities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <h3 className="font-bold text-slate-900 text-base">No Celebrity Spotlights Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Highlight celebrity endorsements and VIP brand lovers with dedicated fragrance bottles.
              </p>
              <button
                type="button"
                onClick={handleOpenAddCelebModal}
                className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              >
                + Add First Celebrity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {celebrities.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  {/* Portrait Media Preview */}
                  <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        No Photo
                      </div>
                    )}

                    {/* Bottom Overlay Badge Preview */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 flex items-center gap-2.5">
                      {c.bottleThumb && (
                        <div className="w-10 h-10 rounded-lg bg-white border border-white/50 overflow-hidden shrink-0 shadow-md">
                          <img
                            src={c.bottleThumb}
                            alt="Bottle"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="font-serif font-bold text-xs text-white truncate">{c.name}</h4>
                        <p className="text-[10px] uppercase tracking-wider text-slate-200 truncate">
                          {c.perfume}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Target Path */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                    {c.targetUrl && (
                      <p className="text-[10px] font-mono text-slate-500 truncate" title={c.targetUrl}>
                        URL: {c.targetUrl}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCelebModal(c)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCelebrity(idx)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PERFUMERS TAB */
        <div className="space-y-4">
          {perfumers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <h3 className="font-bold text-slate-900 text-base">No Master Perfumers Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Introduce the world-renowned noses behind your signature fragrance formulations.
              </p>
              <button
                type="button"
                onClick={handleOpenAddPerfModal}
                className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              >
                + Add Master Perfumer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {perfumers.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          No Photo
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{p.name}</h4>
                      <p className="text-xs text-[#b58b38] font-medium truncate">{p.award}</p>
                      {p.quote && (
                        <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                          &ldquo;{p.quote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPerfModal(p)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePerfumer(idx)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* CELEBRITY ADD / EDIT MODAL DIALOG                              */}
      {/* ============================================================= */}
      {isCelebModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCeleb ? 'Edit Celebrity Spotlight' : 'Add Celebrity Spotlight'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCelebModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCelebModal} className="space-y-4 text-xs">
              {/* Link Store Fragrance Dropdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  Link Store Fragrance (Auto-Fill Fragrance & URL)
                </label>
                <select
                  value={celebFormProductId}
                  onChange={(e) => handleSelectProductForCeleb(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d6a750]"
                >
                  <option value="">-- Select Store Fragrance (Optional) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Rs. {Number(p.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Auto-populates the fragrance title, bottle thumbnail, and target product URL.
                </p>
              </div>

              {/* 1. Celebrity Photo */}
              <MediaUploader
                label="1. Celebrity Portrait Photo *"
                value={celebFormImage}
                onChange={(url) => setCelebFormImage(url)}
                helperText="Upload 3:4 portrait of the celebrity (Auto-compressed to AVIF/WebP)."
              />

              {/* 2. Fragrance Bottle Thumbnail */}
              <MediaUploader
                label="2. Fragrance Bottle Image (Small Thumbnail) *"
                value={celebFormBottleThumb}
                onChange={(url) => setCelebFormBottleThumb(url)}
                helperText="Small square bottle thumbnail displayed beside celebrity name."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Celebrity Name *</label>
                  <input
                    type="text"
                    required
                    value={celebFormName}
                    onChange={(e) => setCelebFormName(e.target.value)}
                    placeholder="e.g. Allu Arjun, Kiara Advani"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Endorsed Fragrance Name</label>
                  <input
                    type="text"
                    value={celebFormPerfume}
                    onChange={(e) => setCelebFormPerfume(e.target.value)}
                    placeholder="e.g. Signature Extrait"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Click URL Path (When visitor clicks card)
                </label>
                <input
                  type="text"
                  value={celebFormTargetUrl}
                  onChange={(e) => setCelebFormTargetUrl(e.target.value)}
                  placeholder="e.g. /products/signature-extrait or /collections/men"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                />
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Clicking the celebrity card on the storefront will open this URL.
                </p>
              </div>

              {/* Action Buttons: Cancel and Save */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCelebModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCeleb}
                  className="px-6 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingCeleb ? 'Saving...' : editingCeleb ? 'Save Changes' : 'Save Celebrity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* PERFUMER ADD / EDIT MODAL DIALOG                               */}
      {/* ============================================================= */}
      {isPerfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPerf ? 'Edit Master Perfumer' : 'Add Master Perfumer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPerfModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePerfModal} className="space-y-4 text-xs">
              <MediaUploader
                label="Perfumer Portrait Photo"
                value={perfFormImage}
                onChange={(url) => setPerfFormImage(url)}
                helperText="Upload portrait photo of the master perfumer."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perfumer Name *</label>
                  <input
                    type="text"
                    required
                    value={perfFormName}
                    onChange={(e) => setPerfFormName(e.target.value)}
                    placeholder="e.g. Christian Provenzano"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Award / Title</label>
                  <input
                    type="text"
                    value={perfFormAward}
                    onChange={(e) => setPerfFormAward(e.target.value)}
                    placeholder="e.g. Master Nose & Global Creator"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signature Quote</label>
                <input
                  type="text"
                  value={perfFormQuote}
                  onChange={(e) => setPerfFormQuote(e.target.value)}
                  placeholder="e.g. A fragrance should evoke an unforgettable sensation."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biography</label>
                <textarea
                  rows={3}
                  value={perfFormBio}
                  onChange={(e) => setPerfFormBio(e.target.value)}
                  placeholder="Brief artistic background..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                />
              </div>

              {/* Action Buttons: Cancel and Save */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPerfModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPerf}
                  className="px-6 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingPerf ? 'Saving...' : editingPerf ? 'Save Changes' : 'Save Perfumer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
