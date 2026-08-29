'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useConfirm } from './CustomConfirmModal';

export const Footer: React.FC = () => {
  const { showAlert } = useConfirm();
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await showAlert({
      title: 'Welcome to Bakhoor Bliss',
      message: `Thank you for subscribing with ${email}! You will now receive private concierge notifications and exclusive fragrance drops.`,
      variant: 'success'
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#222222] text-white font-sans border-t border-slate-800">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Main 4-Column Section for Desktop / Collapsible for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
          
          {/* Column 1: Bakhoor Bliss Logo */}
          <div className="md:col-span-3 flex justify-start items-center pb-2 md:pb-0">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/bakhoorbliss.avif"
                alt="Bakhoor Bliss"
                width={160}
                height={80}
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>
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
                    <a href="#stores" className="hover:text-[#d6a750] transition-colors">Bakhoor Bliss in Offline Stores</a>
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
                  
                  <form onSubmit={handleSubscribe} suppressHydrationWarning className="relative w-full">
                    <input
                      type="email"
                      suppressHydrationWarning
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      className="w-full bg-white text-slate-900 text-xs px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#d6a750] transition-all placeholder:text-slate-500 rounded-none shadow-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-0 h-full px-4 bg-[#d6a750] text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-[#c59843] transition-colors cursor-pointer"
                    >
                      Join
                    </button>
                  </form>                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Divider Line */}
        <div className="border-t border-slate-700/80 mt-10 mb-6" />

        {/* Copyright */}
        <div className="text-center font-sans text-xs text-slate-300 tracking-wide">
          COPYRIGHT © 2026, Bakhoor Bliss Private Limited
        </div>

      </div>
    </footer>
  );
};
