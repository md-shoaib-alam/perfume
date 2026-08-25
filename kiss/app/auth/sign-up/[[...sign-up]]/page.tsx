'use client';

import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/clerk-react';
import { AuthProvider } from '../../AuthProvider';

export default function SignUpRoutePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-[#d6a750] selection:text-black relative">
        <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="font-serif text-2xl font-bold tracking-widest text-[#d6a750]">NEESH</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-300 hover:text-[#d6a750] transition-colors"
          >
            ← Back to Store
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="w-full max-w-md bg-[#121212]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex justify-center">
            <SignUp
              routing="path"
              path="/auth/sign-up"
              signInUrl="/auth/sign-in"
              afterSignUpUrl="/"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none p-0',
                  headerTitle: 'text-white font-serif text-xl',
                  headerSubtitle: 'text-slate-400 text-xs',
                  formButtonPrimary: 'bg-[#d6a750] hover:bg-[#c49232] text-black font-bold text-xs uppercase tracking-wider',
                  socialButtonsBlockButton: 'border-white/20 text-white hover:bg-white/5',
                  socialButtonsBlockButtonText: 'text-white text-xs',
                  formFieldLabel: 'text-slate-300 text-xs font-semibold',
                  formFieldInput: 'bg-white/5 border-white/15 text-white focus:border-[#d6a750]',
                  footerActionLink: 'text-[#d6a750] hover:underline'
                }
              }}
            />
          </div>
        </main>

        <footer className="py-6 text-center text-[11px] text-slate-500 z-10 border-t border-white/5">
          &copy; {new Date().getFullYear()} NEESH™ Perfumes. Encrypted & Secured by Clerk Auth.
        </footer>
      </div>
    </AuthProvider>
  );
}
