'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onOpenAccount?: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  cartCount: _cartCount = 0,
  onOpenCart: _onOpenCart,
  onOpenAdmin,
  onOpenAuth,
  onOpenAccount
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();

  // Prevent background page scrolling when menu drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen to window scroll to position menu drawer below Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset sub-menu state when the drawer closes to start fresh next time
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setActiveSubMenu(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const menuItems = [
    { name: 'Shop All', hasArrow: false },
    { name: 'Shop by Collection', hasArrow: true },
    { name: 'Trial Sets', hasArrow: false },
    { name: 'Collector\'s Edition', hasArrow: true },
    { name: 'Combo', hasArrow: true },
    { name: 'My Closet (4x10ml)', hasArrow: false },
    { name: 'NEESH Gift Sets', hasArrow: false },
    { name: 'NEESH in Offline Stores', hasArrow: false },
    { name: 'Our Story', hasArrow: false },
  ];

  const subMenus: Record<string, string[]> = {
    'Shop by Collection': [
      'Bureau Collection',
      'Luxe Collection',
      'Haute Collection',
      'Miss Neesh Collection'
    ],
    'Collector\'s Edition': [
      'Tsunara Extrait De Parfum',
      'Glazed Oud Special',
      'Oriental Leather'
    ],
    'Combo': [
      'Luxury Duo Pack',
      'Daily Wear Combo',
      'Signature Trio Pack'
    ]
  };

  const topPositionClass = isScrolled ? 'top-[56px] sm:top-[64px]' : 'top-[88px] sm:top-[96px]';

  return (
    <div className={`fixed inset-0 z-40 overflow-hidden font-sans transition-all duration-300 ${isOpen ? 'visible' : 'invisible delay-300'}`}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed ${topPositionClass} inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className={`fixed ${topPositionClass} bottom-0 left-0 max-w-full flex transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-[80vw] max-w-sm bg-white text-slate-900 shadow-2xl flex flex-col overflow-hidden">
          
          {/* Sliding container holding both main menu and sub-menu */}
          <div className="flex-1 relative overflow-hidden">
            <div className={`w-[200%] h-full flex transition-transform duration-300 ease-in-out ${activeSubMenu ? '-translate-x-1/2' : 'translate-x-0'}`}>
              
              {/* Panel 1: Main Menu */}
              <div className="w-1/2 h-full flex flex-col justify-between px-6 pt-6 pb-6 overflow-y-auto">
                <nav className="space-y-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.name}
                      href="#bestsellers"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.hasArrow && subMenus[item.name]) {
                          setActiveSubMenu(item.name);
                        } else {
                          onClose();
                          document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center justify-between text-base font-normal tracking-wide text-slate-800 hover:text-[#d6a13d] py-1 transition-colors group"
                    >
                      <span>{item.name}</span>
                      {item.hasArrow && (
                        <svg 
                          className="w-4 h-4 text-slate-400 group-hover:text-[#d6a13d] transition-colors" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </a>
                  ))}
                </nav>

                {/* My Account section at the bottom (Mobile Only) */}
                <div className="sm:hidden mt-8 pt-4 border-t border-slate-100 space-y-2.5">
                  <h4 className="font-serif text-lg font-bold text-slate-900 mb-3">My Account</h4>
                  
                  {isLoaded && isSignedIn ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-[#d6a750] bg-white flex items-center justify-center text-sm font-serif overflow-hidden">
                          {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-[#b69254]">
                              {user?.firstName ? user.firstName[0] : (
                                <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.primaryEmailAddress?.emailAddress}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">Silver Member • 50 Pts</p>
                        </div>
                      </div>

                      <Link
                        href="/account"
                        onClick={onClose}
                        className="w-full py-3 bg-[#d09e44] hover:bg-[#bd8c37] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Account Dashboard</span>
                      </Link>

                      <button
                        onClick={async () => {
                          onClose();
                          await signOut();
                        }}
                        className="w-full py-2.5 bg-white hover:bg-red-50 text-red-500 border border-red-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuth?.('signin');
                        }}
                        className="w-full py-3.5 bg-[#d09e44] hover:bg-[#bd8c37] active:bg-[#a97b2d] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors shadow-sm cursor-pointer"
                      >
                        LOG IN
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuth?.('signup');
                        }}
                        className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-sans font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors shadow-2xs cursor-pointer"
                      >
                        CREATE ACCOUNT
                      </button>
                    </>
                  )}

                  {onOpenAdmin && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="w-full py-2.5 bg-[#1a1a1a] hover:bg-black text-[#d6a750] border border-[#d6a750]/30 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-3"
                    >
                      <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Admin Console</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Panel 2: Sub-menu */}
              <div className="w-1/2 h-full flex flex-col px-6 pt-6 pb-6 overflow-y-auto">
                <div className="flex flex-col mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setActiveSubMenu(null)}
                      className="text-slate-700 hover:text-black p-1 rounded hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                      aria-label="Back to main menu"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <span className="font-serif text-lg font-bold text-slate-900">{activeSubMenu || 'Collection'}</span>
                  </div>
                  <div className="border-b border-slate-200/80 w-full" />
                </div>

                <nav className="space-y-5">
                  {(activeSubMenu ? subMenus[activeSubMenu] : [])?.map((subItem) => (
                    <a
                      key={subItem}
                      href="#bestsellers"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block text-base font-normal tracking-wide text-slate-800 hover:text-[#d6a13d] py-1.5 transition-colors"
                    >
                      {subItem}
                    </a>
                  ))}
                </nav>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
