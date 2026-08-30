'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';

export const PerfumersCelebritiesManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [activeSection, setActiveSection] = useState<'perfumers' | 'celebrities'>('perfumers');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [perfumers, setPerfumers] = useState<any[]>([]);
  const [celebrities, setCelebrities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [perfData, celebData] = await Promise.all([
        api.getPerfumers(),
        api.getCelebrities()
      ]);
      setPerfumers(Array.isArray(perfData) ? perfData : []);
      setCelebrities(Array.isArray(celebData) ? celebData : []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPerfumer = () => {
    const newPerfumer = {
      id: `perfumer-${Date.now()}`,
      name: 'Master Perfumer',
      award: 'Master Nose',
      quote: 'Perfumery is the art of memory and emotion.',
      bio: 'Renowned artisanal nose with decades of experience formulating signature luxury blends.',
      image: ''
    };
    setPerfumers([...perfumers, newPerfumer]);
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
      const updated = perfumers.filter((_, i) => i !== idx);
      setPerfumers(updated);
    }
  };

  const handleAddCelebrity = () => {
    const newCelebrity = {
      id: `celeb-${Date.now()}`,
      name: 'Celebrity Name',
      perfume: 'Signature Extrait',
      image: ''
    };
    setCelebrities([...celebrities, newCelebrity]);
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
      const updated = celebrities.filter((_, i) => i !== idx);
      setCelebrities(updated);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (activeSection === 'perfumers') {
        await api.savePerfumers(perfumers);
      } else {
        await api.saveCelebrities(celebrities);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      await showAlert({
        title: 'Save Failed',
        message: err.message || 'Failed to save changes.',
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Perfumers & Celebrities Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage master nose biographies, awards, and celebrity fragrance endorsements.</p>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Tab Switcher */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex p-1 bg-slate-100 rounded-xl border border-slate-200/70">
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
          </div>

          {/* Add New Button */}
          {activeSection === 'perfumers' ? (
            <button
              type="button"
              onClick={handleAddPerfumer}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Perfumer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddCelebrity}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Celebrity</span>
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Changes saved successfully!</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-6 h-6 border-2 border-[#caa04c] border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading entries...</p>
        </div>
      ) : activeSection === 'perfumers' ? (
        perfumers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/80 mx-auto flex items-center justify-center text-[#caa04c]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">No Master Perfumers Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Add world-renowned master noses, their titles, biographies, and portraits.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPerfumer}
              className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
            >
              + Add First Perfumer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {perfumers.map((p, idx) => (
              <div key={p.id || idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-mono font-bold text-[#b58b38] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                      Perfumer #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 text-xs truncate max-w-xs">{p.name || 'Unnamed Perfumer'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePerfumer(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Remove Perfumer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-4">
                    <MediaUploader
                      label="Perfumer Portrait"
                      value={p.image || ''}
                      onChange={(url) => {
                        const upd = [...perfumers];
                        upd[idx].image = url;
                        setPerfumers(upd);
                      }}
                      helperText="Upload 1:1 portrait photography."
                    />
                  </div>

                  <div className="md:col-span-8 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Perfumer Name *</label>
                        <input
                          type="text"
                          required
                          value={p.name || ''}
                          onChange={(e) => {
                            const upd = [...perfumers];
                            upd[idx].name = e.target.value;
                            setPerfumers(upd);
                          }}
                          placeholder="e.g. Christian Provenzano"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Award / Title</label>
                        <input
                          type="text"
                          value={p.award || ''}
                          onChange={(e) => {
                            const upd = [...perfumers];
                            upd[idx].award = e.target.value;
                            setPerfumers(upd);
                          }}
                          placeholder="e.g. Master Nose & Global Creator"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Signature Quote</label>
                      <input
                        type="text"
                        value={p.quote || ''}
                        onChange={(e) => {
                          const upd = [...perfumers];
                          upd[idx].quote = e.target.value;
                          setPerfumers(upd);
                        }}
                        placeholder="e.g. A fragrance should evoke an unforgettable sensation."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Biography</label>
                      <textarea
                        rows={3}
                        value={p.bio || ''}
                        onChange={(e) => {
                          const upd = [...perfumers];
                          upd[idx].bio = e.target.value;
                          setPerfumers(upd);
                        }}
                        placeholder="Brief artistic background..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving Perfumers...' : 'Save All Perfumers'}
              </button>
            </div>
          </form>
        )
      ) : (
        celebrities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/80 mx-auto flex items-center justify-center text-[#caa04c]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">No Celebrity Spotlights Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Highlight celebrity endorsements and VIP brand lovers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCelebrity}
              className="px-5 py-2.5 bg-[#d6a750] hover:bg-[#c49640] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
            >
              + Add First Celebrity
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {celebrities.map((c, idx) => (
                <div key={c.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-mono font-bold text-[#b58b38] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                      Celebrity #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCelebrity(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <MediaUploader
                    label="Celebrity Photo"
                    value={c.image || ''}
                    onChange={(url) => {
                      const upd = [...celebrities];
                      upd[idx].image = url;
                      setCelebrities(upd);
                    }}
                    helperText="Upload celebrity visual."
                  />

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Celebrity Name *</label>
                    <input
                      type="text"
                      required
                      value={c.name || ''}
                      onChange={(e) => {
                        const upd = [...celebrities];
                        upd[idx].name = e.target.value;
                        setCelebrities(upd);
                      }}
                      placeholder="e.g. Kiara Advani"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Endorsed Fragrance</label>
                    <input
                      type="text"
                      value={c.perfume || ''}
                      onChange={(e) => {
                        const upd = [...celebrities];
                        upd[idx].perfume = e.target.value;
                        setCelebrities(upd);
                      }}
                      placeholder="e.g. Haute Tobacco Extrait"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving Celebrities...' : 'Save All Celebrities'}
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
};
