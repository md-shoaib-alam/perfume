import React, { useState, useEffect, useRef } from 'react';
import neeshLogo from '../assets/neesh_logo_130x40.avif';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenMenu,
  searchQuery,
  onSearchChange
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 60) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ease-in-out transform-gpu ${
        isScrolled || searchOpen
          ? 'bg-white text-slate-900 shadow-sm border-b border-slate-200 py-1' 
          : 'bg-black text-white border-b border-[#b69254]/20 py-1.5'
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between h-11 sm:h-13">
        
        {/* Left: Hamburger Menu / Logo */}
        <div className="flex items-center space-x-4">
          {!searchOpen && (
            <button 
              onClick={onOpenMenu}
              className={`p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
                isScrolled ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
              }`}
              aria-label="Toggle Menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <a href="#" className="flex items-center group cursor-pointer">
            <img 
              src={neeshLogo} 
              alt="NEESH PERFUMES" 
              className={`h-6 sm:h-8 w-auto object-contain transition-all duration-300 ease-out transform group-hover:scale-105 ${
                isScrolled || searchOpen ? 'brightness-0' : 'brightness-100'
              }`} 
            />
          </a>
        </div>

        {/* Center: Search input box (Visible when searchOpen is true) */}
        {searchOpen ? (
          <div ref={searchRef} className="flex-1 max-w-xl mx-4 sm:mx-8 relative animate-fade-in-up">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products"
                className="w-full bg-white text-slate-800 text-sm px-4 py-1.5 pr-10 border border-slate-300 focus:outline-none focus:border-[#d6a750] transition-colors"
                autoFocus
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 text-slate-400 hover:text-[#d6a750] cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right: Icons (Search, User, Heart, Cart) */}
        <div className="flex items-center space-x-2 sm:space-x-5">
          {/* Search Toggle Icon (Only visible when search bar is closed) */}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
                isScrolled ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
              }`}
              title="Search"
            >
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* User Account */}
          <button 
            className={`p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
              isScrolled || searchOpen ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
            }`} 
            title="Account"
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Wishlist Heart Icon */}
          <button 
            className={`p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
              isScrolled || searchOpen ? 'text-slate-900 hover:text-red-500' : 'text-white hover:text-red-500'
            }`} 
            title="Wishlist"
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Shopping Bag with Gold Badge */}
          <button
            onClick={onOpenCart}
            className={`relative p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
              isScrolled || searchOpen ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
            }`}
            title="Bag"
          >
            <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d6a750] text-slate-950 font-sans font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
