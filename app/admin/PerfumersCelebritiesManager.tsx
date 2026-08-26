'use client';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useConfirm } from '../components/CustomConfirmModal';

export const PerfumersCelebritiesManager: React.FC = () => {
  const { showAlert } = useConfirm();
  const [activeSection, setActiveSection] = useState<'perfumers' | 'celebrities'>('perfumers');
  const [saved, setSaved] = useState(false);
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
      setPerfumers(perfData || []);
      setCelebrities(celebData || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Perfumers & Celebrities Manager</h2>
          <p className="text-xs text-slate-500">Edit master nose bios, award titles, and celebrity perfume endorsements.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('perfumers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'perfumers' ? 'bg-[#c59b48] text-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Master Perfumers
          </button>
          <button
            onClick={() => setActiveSection('celebrities')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'celebrities' ? 'bg-[#c59b48] text-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Celebrity Spotlights
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
          Changes updated and synchronized successfully!
        </div>
      )}

      {activeSection === 'perfumers' ? (
        <form onSubmit={handleSave} className="space-y-4">
          {perfumers.map((p, idx) => (
            <div key={p.id || idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              <div className="md:col-span-3 flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#d6a750] p-1 overflow-hidden bg-slate-100 shadow-md">
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm mt-3">{p.name}</h4>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full mt-1">
                  {p.award}
                </span>
              </div>

              <div className="md:col-span-9 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Award / Honor Title</label>
                  <input
                    type="text"
                    value={p.award || ''}
                    onChange={(e) => {
                      const upd = [...perfumers];
                      upd[idx].award = e.target.value;
                      setPerfumers(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Biography</label>
                  <textarea
                    rows={2}
                    value={p.bio || ''}
                    onChange={(e) => {
                      const upd = [...perfumers];
                      upd[idx].bio = e.target.value;
                      setPerfumers(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Perfumers
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {celebrities.map((c, idx) => (
            <div key={c.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <img src={c.image} alt={c.name} loading="lazy" decoding="async" className="w-14 h-16 object-cover rounded-xl shadow-xs bg-slate-100 border border-slate-200" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-slate-900 text-sm truncate">{c.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-[#c59b48] font-bold block mt-0.5">{c.perfume}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Celebrity Name</label>
                <input
                  type="text"
                  value={c.name || ''}
                  onChange={(e) => {
                    const upd = [...celebrities];
                    upd[idx].name = e.target.value;
                    setCelebrities(upd);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>
          ))}

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Celebrity Spotlights
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
