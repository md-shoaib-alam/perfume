'use client';

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';

interface AuthStatusProps {
  className?: string;
  showAdminLink?: boolean;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
  className = '',
  showAdminLink = true
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-full border border-[#d6a750]/50 shadow-sm'
              }
            }}
          />
          {showAdminLink && (
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-700 hover:text-[#d6a750] transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-black text-[#d6a750] border border-[#d6a750]/30 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <Link
            href="/auth"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline"
          >
            Create Account
          </Link>
        </div>
      </SignedOut>
    </div>
  );
};
