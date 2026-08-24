import React, { useState, useEffect, useRef } from 'react';
import neeshLogo from '../assets/neesh_logo_130x40.avif';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  isMenuOpen?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenMenu,
  isMenuOpen = false,
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
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ease-in-out transform-gpu ${
        isScrolled || searchOpen || isMenuOpen
          ? 'bg-white text-slate-900 py-1' 
          : 'bg-black text-white border-b border-[#b69254]/20 py-1.5'
      }`}
    >
      <div className="max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16 relative">
        
        {/* Left: Hamburger Menu */}
        <div className="flex items-center z-10">
          {!searchOpen && (
            <button 
              onClick={onOpenMenu}
              className={`p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
                isScrolled || isMenuOpen ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
              }`}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Center: Search input box (Visible when searchOpen is true) */}
        {searchOpen ? (
          <div ref={searchRef} className="flex-1 max-w-xl mx-4 sm:mx-8 z-20 animate-fade-in-up">
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Center: Absolute Centered Logo */}
        {!searchOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex justify-center items-center">
            <a href="#" className="flex items-center group cursor-pointer">
              <img 
                src={neeshLogo} 
                alt="NEESH PERFUMES" 
                className={`h-8.5 sm:h-10.5 w-auto object-contain transition-all duration-300 ease-out ${
                  isScrolled || searchOpen ? 'brightness-0' : 'brightness-100'
                }`} 
              />
            </a>
          </div>
        )}

        {/* Right: Icons (Search, User, Heart, Cart) */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Search Toggle Icon (Only visible when search bar is closed) */}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
                isScrolled || searchOpen || isMenuOpen ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
              }`}
              title="Search"
            >
              <svg className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* User Account */}
          <button 
            className={`hidden sm:block p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
              isScrolled || searchOpen || isMenuOpen ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
            }`} 
            title="Account"
          >
            <svg className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Shopping Bag with Gold Badge */}
          <button
            onClick={onOpenCart}
            className={`relative p-1.5 transition-all duration-300 ease-out hover:scale-110 cursor-pointer ${
              isScrolled || searchOpen || isMenuOpen ? 'text-slate-900 hover:text-[#d6a13d]' : 'text-white hover:text-[#d6a13d]'
            }`}
            title="Bag"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d6a750] text-slate-950 font-sans font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
