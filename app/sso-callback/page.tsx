'use client';

import React, { useEffect, Suspense } from 'react';
import Image from 'next/image';
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

function SSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useUser();

  const redirectUrl = searchParams?.get('redirect_url') || '/';

  // Safety fallback: if user is already authenticated or callback finishes, auto-route
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const timer = setTimeout(() => {
        router.replace(redirectUrl);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, redirectUrl, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-slate-900 px-4 relative overflow-hidden selection:bg-[#caa04c]/20">
      {/* Subtle luxury ambient gold glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#caa04c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Luxury Modal Card */}
      <div className="relative z-10 bg-white border border-slate-200/80 shadow-2xl shadow-slate-900/5 rounded-2xl p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center">
        {/* Brand Logo */}
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/assets/bakhoorblissnav.avif"
            alt="BakhoorBliss"
            width={140}
            height={52}
            priority
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </div>

        {/* Dual Champagne Gold Spinning Halo */}
        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-amber-200/50" />
          <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#caa04c] border-r-[#d6a750] animate-spin" />
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Typography & Status Messaging */}
        <div className="space-y-2 max-w-xs mx-auto">
          <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.25em] text-[#caa04c] uppercase block">
            House of BakhoorBliss
          </span>
          <h1 className="font-serif text-2xl sm:text-[26px] font-normal text-slate-900 tracking-tight">
            Authenticating
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-sans leading-relaxed">
            Securely verifying your account credentials and preparing your private experience...
          </p>
        </div>

        {/* Security Trust Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-sans">
          <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>End-to-End Encrypted Session</span>
        </div>
      </div>

      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl={redirectUrl} 
        signUpForceRedirectUrl={redirectUrl} 
        signInFallbackRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
        continueSignUpUrl={redirectUrl}
      />
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-slate-900 px-4">
        <div className="w-12 h-12 border-3 border-[#caa04c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  );
}
