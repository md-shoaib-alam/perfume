import React, { useState, useEffect } from 'react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

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

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-300 ${isOpen ? 'visible' : 'invisible delay-300'}`}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className={`fixed inset-y-0 left-0 max-w-full flex transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-screen max-w-sm bg-white text-slate-900 shadow-2xl flex flex-col overflow-hidden">
          
          {/* Close Button - Stays fixed at the top */}
          <div className="flex justify-end px-6 pt-6 pb-2">
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-black p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close Menu"
            >
              <svg className="w-6.5 h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sliding container holding both main menu and sub-menu */}
          <div className="flex-1 relative overflow-hidden">
            <div className={`w-[200%] h-full flex transition-transform duration-300 ease-in-out ${activeSubMenu ? '-translate-x-1/2' : 'translate-x-0'}`}>
              
              {/* Panel 1: Main Menu */}
              <div className="w-1/2 h-full flex flex-col px-6 pb-6 overflow-y-auto">
                <nav className="space-y-5">
                  {menuItems.map((item) => (
                    <a
                      key={item.name}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.hasArrow && subMenus[item.name]) {
                          setActiveSubMenu(item.name);
                        } else {
                          onClose();
                        }
                      }}
                      className="flex items-center justify-between text-base font-normal tracking-wide text-slate-800 hover:text-[#d6a13d] py-1.5 transition-colors group"
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
              </div>

              {/* Panel 2: Sub-menu */}
              <div className="w-1/2 h-full flex flex-col px-6 pb-6 overflow-y-auto">
                <div className="flex flex-col mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setActiveSubMenu(null)}
                      className="text-slate-700 hover:text-black p-1 rounded hover:bg-slate-100 transition-colors flex items-center justify-center"
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
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
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
