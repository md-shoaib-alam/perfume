import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 font-sans">
      
      {/* Top Newsletter Strip */}
      <div className="border-b border-slate-100 bg-[#fffdf7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-xl">
          <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">Join The Imperial Club</h3>
          <p className="text-xs text-slate-500 mb-6">
            Subscribe for exclusive vintage drop alerts, private sales, and complimentary samples.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="flex-1 bg-white border border-slate-300 text-slate-900 text-xs px-4 py-3 rounded-md focus:outline-none focus:border-[#d6a13d]"
            />
            <button className="px-6 py-3 bg-[#c59b48] hover:bg-[#b69254] text-black font-bold text-xs uppercase tracking-wider rounded-md transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <a href="#" className="inline-block">
            <span className="font-serif text-2xl font-extrabold tracking-widest text-[#d6a13d]">
              NEESH
            </span>
            <span className="block text-[9px] tracking-[0.3em] uppercase text-[#c59b48] font-semibold">
              HAUS OF PERFUMES
            </span>
          </a>
          <p className="text-xs text-slate-500 leading-relaxed">
            Crafted between Paris, Grasse, and India. Formulated with rare aged woods, precious floral absolutes, and 30% Extrait de Parfum oil concentration.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Collections</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Extrait De Parfum (100ml)</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Imperial Concentrated Attars</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Haute Discovery Box</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Custom Travel Atomizers</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Royal Gifting Chests</a></li>
          </ul>
        </div>

        {/* Client Care */}
        <div>
          <h4 className="font-serif text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Client Care</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Track Your Order</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Fragrance Finder Quiz</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Shipping & Returns Policy</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Contact Our Perfume Concierge</a></li>
            <li><a href="#" className="hover:text-[#d6a13d] transition-colors">Store Locator</a></li>
          </ul>
        </div>

        {/* Guarantee */}
        <div className="space-y-4">
          <h4 className="font-serif text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">100% Originality</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All NEESH creations are certified 100% original, cruelty-free, and IFRA compliant.
          </p>
          <div className="pt-2 text-xs text-[#c59b48] font-mono font-semibold">
            📞 Concierge: +91 (800) 555-NEESH
          </div>
        </div>

      </div>

      {/* Copyright Strip */}
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400 bg-slate-50">
        © {new Date().getFullYear()} NEESH PERFUMES. ALL RIGHTS RESERVED. CRAFTED WITH ROYAL ELEGANCE.
      </div>

    </footer>
  );
};
