'use client';

import React, { useEffect, Suspense } from 'react';
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthSSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useUser();

  const redirectUrl = searchParams?.get('redirect_url') || '/';

  // Safety fallback: if user is already authenticated or callback finishes, auto-route
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const timer = setTimeout(() => {
        router.replace(redirectUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, redirectUrl, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-slate-900 px-4">
      <div className="bg-white border border-slate-200/80 shadow-xl rounded-2xl p-8 max-w-sm w-full flex flex-col items-center text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#caa04c] border-t-transparent rounded-full animate-spin" />
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-bold text-slate-900">Completing Authentication</h2>
          <p className="text-xs text-slate-500 font-sans">Connecting your account and redirecting securely...</p>
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

export default function AuthSSOCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-slate-900 px-4">
        <div className="w-10 h-10 border-3 border-[#caa04c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthSSOCallbackContent />
    </Suspense>
  );
}
