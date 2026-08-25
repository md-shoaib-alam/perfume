import React, { useState } from 'react';

export const PerfumersCelebritiesManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'perfumers' | 'celebrities'>('perfumers');
  const [saved, setSaved] = useState(false);

  const [perfumers, setPerfumers] = useState([
    {
      id: 'julien',
      name: 'Julien Rasquinet',
      quote: 'Fragrance is architecture in liquid form. Every accord must be balanced with absolute precision.',
      award: 'Best Italian Perfumer Award - 2025',
      bio: 'Trained under legendary Master Perfumer Pierre Bourdon. Created iconic vintage formulations for world-renowned haute perfumery houses.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'christian',
      name: 'Christian Provenzano',
      quote: 'The secret to unmatched longevity is the age and purity of the natural resins and raw agarwood.',
      award: 'Global Master Perfumer of the Year',
      bio: 'Over 40 years of mastery blending exotic Middle Eastern ouds with classical French fine perfumery.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ]);

  const [celebrities, setCelebrities] = useState([
    {
      id: 'allu',
      name: 'Allu Arjun',
      perfume: 'SIGNATURE SCENT',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      bottleThumb: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'raashii',
      name: 'Raashii Khanna',
      perfume: 'MEHR',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      bottleThumb: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'jim',
      name: 'Jim Sarbh',
      perfume: 'GLAZED WATER',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      bottleThumb: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'gauahar',
      name: 'Gauahar Khan',
      perfume: 'HAUTE TOBACCO',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      bottleThumb: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=200&q=80'
    }
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'perfumers' ? 'bg-[#c59b48] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Master Perfumers
          </button>
          <button
            onClick={() => setActiveSection('celebrities')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'celebrities' ? 'bg-[#c59b48] text-black' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Celebrity Spotlights
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
          ✓ Profile changes updated successfully!
        </div>
      )}

      {activeSection === 'perfumers' ? (
        <form onSubmit={handleSave} className="space-y-4">
          {perfumers.map((p, idx) => (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-3 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-2 border-[#d6a750] p-1 overflow-hidden bg-slate-100 shadow-md">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm mt-3">{p.name}</h4>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded mt-1">
                  {p.award}
                </span>
              </div>

              <div className="md:col-span-9 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Award / Honor Title</label>
                  <input
                    type="text"
                    value={p.award}
                    onChange={(e) => {
                      const upd = [...perfumers];
                      upd[idx].award = e.target.value;
                      setPerfumers(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Signature Quote</label>
                  <input
                    type="text"
                    value={p.quote}
                    onChange={(e) => {
                      const upd = [...perfumers];
                      upd[idx].quote = e.target.value;
                      setPerfumers(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Biography</label>
                  <textarea
                    rows={2}
                    value={p.bio}
                    onChange={(e) => {
                      const upd = [...perfumers];
                      upd[idx].bio = e.target.value;
                      setPerfumers(upd);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md"
            >
              Save Perfumers
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {celebrities.map((c, idx) => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img src={c.image} alt={c.name} className="w-14 h-16 object-cover rounded shadow-xs bg-slate-100" />
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-sm">{c.name}</h4>
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                    {c.perfume}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Celebrity Name</label>
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => {
                    const upd = [...celebrities];
                    upd[idx].name = e.target.value;
                    setCelebrities(upd);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perfume Title</label>
                <input
                  type="text"
                  value={c.perfume}
                  onChange={(e) => {
                    const upd = [...celebrities];
                    upd[idx].perfume = e.target.value;
                    setCelebrities(upd);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>
            </div>
          ))}

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md"
            >
              Save Celebrities
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
