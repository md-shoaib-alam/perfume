import React from 'react';

const CELEBRITIES = [
  {
    name: 'Allu Arjun',
    perfume: 'SIGNATURE SCENT',
    bottleThumb: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Raashii Khanna',
    perfume: 'MEHR',
    bottleThumb: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Jim Sarbh',
    perfume: 'GLAZED WATER',
    bottleThumb: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Gauahar Khan',
    perfume: 'HAUTE TOBACCO',
    bottleThumb: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
  }
];

export const CelebritySection: React.FC = () => {
  return (
    <section className="py-16 bg-white text-slate-900 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-normal tracking-wide text-slate-800">
          Worn by 100k+ fragheads, including
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CELEBRITIES.map((celeb, idx) => (
          <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden group shadow-md">
            <img
              src={celeb.image}
              alt={celeb.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-md border border-white/20 w-full">
                <img
                  src={celeb.bottleThumb}
                  alt={celeb.perfume}
                  className="w-8 h-10 object-cover rounded bg-slate-800"
                />
                <div>
                  <h3 className="font-serif text-sm font-bold text-white leading-tight">{celeb.name}</h3>
                  <span className="font-sans text-[9px] uppercase tracking-widest text-amber-300 font-bold block">
                    {celeb.perfume}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
