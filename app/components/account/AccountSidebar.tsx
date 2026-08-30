'use client';

import React from 'react';
import type { TabKey } from '../../hooks/useAccountData';

interface MenuItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

interface AccountSidebarProps {
  user?: any;
  displayName: string;
  firstName?: string;
  email: string;
  activeTab: TabKey;
  menuItems: MenuItem[];
  onSelectTab: (key: TabKey) => void;
  onLogout: () => void;
  logoutIcon: React.ReactNode;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  user,
  displayName,
  firstName,
  email,
  activeTab,
  menuItems,
  onSelectTab,
  onLogout,
  logoutIcon
}) => {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 p-6 flex-col shrink-0">
      {/* User Avatar Circle with Gold Ring */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
        <div className="relative w-22 h-22 rounded-full border-2 border-[#d09e44] p-1 flex items-center justify-center bg-white shadow-xs mb-3">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              loading="lazy"
              decoding="async"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-2xl font-serif text-slate-600">
              {firstName ? firstName[0].toUpperCase() : (displayName ? displayName[0].toUpperCase() : '?')}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-sm text-slate-900 truncate max-w-[200px]">
          {displayName}
        </h3>
        <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
          {email}
        </p>

        {/* Social Icons - opens official BakhoorBliss Instagram & Facebook */}
        <div className="flex items-center gap-3 mt-3 text-slate-400 text-xs">
          <a
            href="https://www.instagram.com/neeshperfumes"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:text-[#d09e44] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Follow us on Instagram"
            aria-label="Instagram"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://www.facebook.com/neeshperfumes"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:text-[#d09e44] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Follow us on Facebook"
            aria-label="Facebook"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Navigation Tab Links */}
      <nav className="mt-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#caa04c] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-[#caa04c] hover:text-white'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <span>{logoutIcon}</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
