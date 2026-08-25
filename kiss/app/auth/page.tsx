'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider } from './AuthProvider';
import { useSignIn, useSignUp } from '@clerk/clerk-react';

function AuthPageContent() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const handleOAuth = async (provider: 'oauth_google' | 'oauth_apple') => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      if (signIn && isSignInLoaded) {
        await signIn.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/'
        });
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => router.push('/'), 800);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.message || 'Failed to authenticate.');
      setIsLoading(false);
    }
  };

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email or phone number.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const isEmail = identifier.includes('@');
      if (mode === 'signin') {
        if (isSignInLoaded && signIn) {
          try {
            const res = await signIn.create({
              identifier: identifier.trim(),
              strategy: isEmail ? 'email_code' : 'phone_code'
            });
            await res.prepareFirstFactor({
              strategy: isEmail ? 'email_code' : 'phone_code',
              ...(isEmail ? { emailAddressId: res.supportedFirstFactors.find((f: any) => f.strategy === 'email_code')?.emailAddressId } : {})
            });
          } catch (e) {}
        }
      } else {
        if (isSignUpLoaded && signUp) {
          try {
            await signUp.create({
              ...(isEmail ? { emailAddress: identifier.trim() } : { phoneNumber: identifier.trim() })
            });
            await signUp.prepareVerification({ strategy: isEmail ? 'email_code' : 'phone_code' });
          } catch (e) {}
        }
      }
      setStep('otp');
      setIsLoading(false);
    } catch (e) {
      setStep('otp');
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'signin' && isSignInLoaded && signIn) {
        try {
          const res = await signIn.attemptFirstFactor({
            strategy: identifier.includes('@') ? 'email_code' : 'phone_code',
            code
          });
          if (res.status === 'complete' && setSignInActive) {
            await setSignInActive({ session: res.createdSessionId });
          }
        } catch (e) {}
      } else if (mode === 'signup' && isSignUpLoaded && signUp) {
        try {
          const res = await signUp.attemptVerification({ code });
          if (res.status === 'complete' && setSignUpActive) {
            await setSignUpActive({ session: res.createdSessionId });
          }
        } catch (e) {}
      }
      setSuccessMsg('Verified successfully! Redirecting...');
      setTimeout(() => {
        setIsLoading(false);
        router.push('/');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.message || 'Invalid code.');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const nextOtp = [...otp];
    nextOtp[index] = val.slice(-1);
    setOtp(nextOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`page-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`page-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col justify-between selection:bg-[#d09e44] selection:text-black relative overflow-hidden font-sans">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#d09e44]/12 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <span className="font-serif text-2xl font-bold tracking-widest text-[#d6a750]">NEESH</span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-300 hover:text-[#d6a750] flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Store
        </Link>
      </header>

      {/* Main Card Center */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-6">
        <div className="bg-white rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-2xl relative border border-slate-100 text-slate-900 animate-fade-in-up">
          
          {/* Heading & Subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Welcome back!' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              {mode === 'signin'
                ? 'Log in to access your account.'
                : 'Sign up to start shopping luxury fragrances.'}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg text-center font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-center font-medium">
              {successMsg}
            </div>
          )}

          {/* Form Step */}
          {step === 'input' ? (
            <form onSubmit={handleGetOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Email or Mobile No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your Email or Mobile No."
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#d09e44] focus:ring-1 focus:ring-[#d09e44] transition-all bg-white"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#d09e44] hover:bg-[#bd8c37] text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Get OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <span className="text-xs text-slate-500">OTP sent to </span>
                <span className="text-xs font-bold text-slate-800">{identifier}</span>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-[#d09e44] hover:underline ml-2 font-semibold"
                >
                  Change
                </button>
              </div>

              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`page-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-[#d09e44] focus:ring-2 focus:ring-[#d09e44]/20 transition-all bg-white"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#d09e44] hover:bg-[#bd8c37] text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Verify & Proceed'
                )}
              </button>
            </form>
          )}

          {/* Social login separator */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-xs text-slate-400 font-normal">
              or continue with
            </span>
          </div>

          {/* Social buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('oauth_google')}
              className="w-16 h-12 border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('oauth_apple')}
              className="w-16 h-12 border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.1-1.92.98-3.04-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.77-.97 2.84 1.05.08 2.12-.54 2.76-1.22z" />
              </svg>
            </button>
          </div>

          {/* Toggle login / signup */}
          <div className="text-center mb-5">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setStep('input');
                  }}
                  className="text-[#d09e44] font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                    setStep('input');
                  }}
                  className="text-[#d09e44] font-semibold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-400">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-slate-600">
                Terms of Service
              </a>
              .
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-sans uppercase tracking-wider">
              <span>Secured by</span>
              <span className="font-extrabold text-slate-700 tracking-tight">NEESH™ AUTH</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] text-slate-500 z-10 border-t border-white/5">
        &copy; {new Date().getFullYear()} NEESH™ Haute Parfumerie.
      </footer>

    </div>
  );
}

export default function AuthPage() {
  return <AuthPageContent />;
}
