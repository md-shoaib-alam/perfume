import React, { useState } from 'react';

export const HouseOfNeeshCrest: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Dotted & Solid Rings */}
    <circle cx="100" cy="100" r="92" stroke="#d6a750" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="100" cy="100" r="86" stroke="#d6a750" strokeWidth="1.5" />
    <circle cx="100" cy="100" r="66" stroke="#d6a750" strokeWidth="1.2" />

    {/* Top Text Arc: HOUSE OF NEESH */}
    <path id="textPathTop" d="M 32,100 A 68,68 0 0,1 168,100" fill="none" />
    <text fill="#d6a750" fontSize="12" fontWeight="bold" letterSpacing="3.5" fontFamily="serif">
      <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
        HOUSE OF NEESH
      </textPath>
    </text>

    {/* Top Sunburst Rays */}
    <path d="M100 40 L100 48 M90 42 L93 49 M110 42 L107 49 M80 47 L85 52 M120 47 L115 52" stroke="#d6a750" strokeWidth="1.5" strokeLinecap="round" />

    {/* Center Diamond Shield */}
    <polygon points="100,56 132,88 100,120 68,88" fill="#1f1f1f" stroke="#d6a750" strokeWidth="2.5" />
    <polygon points="100,62 126,88 100,114 74,88" fill="none" stroke="#d6a750" strokeWidth="1" strokeDasharray="2 2" />

    {/* Geometric N Icon inside Shield */}
    <path d="M88 76 L88 100 M112 76 L112 100 M88 76 L112 100" stroke="#d6a750" strokeWidth="2.5" strokeLinecap="square" />

    {/* Left Rampant Lion Silhouette */}
    <path d="M52 106 C50 96 42 86 40 76 C39 70 44 66 48 68 C52 70 54 76 56 78 C60 72 66 80 66 86 C62 92 66 100 62 108 C58 116 50 124 44 128 C48 120 54 116 52 106 Z" fill="#d6a750" />
    <path d="M42 92 C36 90 30 96 32 104 C34 108 40 110 44 106" stroke="#d6a750" strokeWidth="2" strokeLinecap="round" />

    {/* Right Rampant Unicorn Silhouette */}
    <path d="M148 106 C150 96 158 86 160 76 C161 70 156 66 152 68 C148 70 146 76 144 78 C140 72 134 80 134 86 C138 92 134 100 138 108 C142 116 150 124 156 128 C152 120 146 116 148 106 Z" fill="#d6a750" />
    <path d="M158 92 C164 90 170 96 168 104 C166 108 160 110 156 106" stroke="#d6a750" strokeWidth="2" strokeLinecap="round" />

    {/* Bottom Ribbon */}
    <path d="M46 138 Q100 152 154 138 L160 152 Q100 166 40 152 Z" fill="#d6a750" />
    <path d="M40 152 L30 144 L46 138 Z M160 152 L170 144 L154 138 Z" fill="#b69254" />
    
    {/* Bottom Ribbon Text */}
    <text x="100" y="148" fill="#1f1f1f" fontSize="7.5" fontWeight="bold" letterSpacing="2" textAnchor="middle" fontFamily="sans-serif">
      EST. 1899
    </text>
  </svg>
);

export const Footer: React.FC = () => {
  const [openSections, setOpenSections] = useState({
    getInTouch: false,
    policies: false,
    newsletter: true
  });
  const [email, setEmail] = useState('');

  const toggleSection = (key: 'getInTouch' | 'policies' | 'newsletter') => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <footer className="bg-[#222222] text-white font-sans border-t border-slate-800">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Main 4-Column Section for Desktop / Collapsible for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
          
          {/* Column 1: House of Neesh Emblem Logo */}
          <div className="md:col-span-3 flex justify-start items-center pb-2 md:pb-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28">
              <HouseOfNeeshCrest className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Column 2: Get in Touch */}
          <div className="md:col-span-3 border-b border-slate-700/60 md:border-b-0 pb-4 md:pb-0">
            <button
              onClick={() => toggleSection('getInTouch')}
              className="w-full flex items-center justify-between font-sans text-sm font-semibold text-white md:pointer-events-none md:cursor-default py-1"
            >
              <span>Get in Touch</span>
              <svg 
                className={`w-3.5 h-3.5 md:hidden text-slate-400 transform transition-transform duration-300 ease-in-out ${openSections.getInTouch ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div 
              className={`grid transition-all duration-300 ease-in-out md:grid-rows-[1fr] ${
                openSections.getInTouch ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:opacity-100'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li>
                    <a href="#story" className="hover:text-[#d6a750] transition-colors">Our story</a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-[#d6a750] transition-colors">Contact us</a>
                  </li>
                  <li>
                    <a href="#stores" className="hover:text-[#d6a750] transition-colors">NEESH in Offline Stores</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: Our Policies */}
          <div className="md:col-span-3 border-b border-slate-700/60 md:border-b-0 pb-4 md:pb-0">
            <button
              onClick={() => toggleSection('policies')}
              className="w-full flex items-center justify-between font-sans text-sm font-semibold text-white md:pointer-events-none md:cursor-default py-1"
            >
              <span>Our Policies</span>
              <svg 
                className={`w-3.5 h-3.5 md:hidden text-slate-400 transform transition-transform duration-300 ease-in-out ${openSections.policies ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div 
              className={`grid transition-all duration-300 ease-in-out md:grid-rows-[1fr] ${
                openSections.policies ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:opacity-100'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li>
                    <a href="#privacy" className="hover:text-[#d6a750] transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#return" className="hover:text-[#d6a750] transition-colors">Return Policy</a>
                  </li>
                  <li>
                    <a href="#shipping" className="hover:text-[#d6a750] transition-colors">Shipping Policy</a>
                  </li>
                  <li>
                    <a href="#terms" className="hover:text-[#d6a750] transition-colors">Terms of Service</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 4: Subscribe to our newsletter */}
          <div className="md:col-span-3 pb-2 md:pb-0">
            <button
              onClick={() => toggleSection('newsletter')}
              className="w-full flex items-center justify-between font-sans text-sm font-semibold text-white md:pointer-events-none md:cursor-default py-1"
            >
              <span>Subscribe to our newsletter</span>
              <svg 
                className={`w-3.5 h-3.5 md:hidden text-slate-400 transform transition-transform duration-300 ease-in-out ${openSections.newsletter ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div 
              className={`grid transition-all duration-300 ease-in-out md:grid-rows-[1fr] ${
                openSections.newsletter ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 md:opacity-100'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-3">
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    subscribe to get notified about product launches, special offers and company news.
                  </p>
                  
                  <form onSubmit={handleSubscribe} className="relative w-full">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      className="w-full bg-white text-slate-900 text-xs px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#d6a750] transition-all placeholder:text-slate-500 rounded-none shadow-sm"
                      required
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Divider Line */}
        <div className="border-t border-slate-700/80 mt-10 mb-6" />

        {/* Copyright */}
        <div className="text-center font-sans text-xs text-slate-300 tracking-wide">
          COPYRIGHT © 2026, Neesh Perfumes Private Limited
        </div>

      </div>
    </footer>
  );
};
