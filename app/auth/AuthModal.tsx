'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useClerk } from '@clerk/nextjs';
import { api } from '../services/api';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

type AuthStep = 'identifier' | 'link_email' | 'otp';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const [step, setStep] = useState<AuthStep>('identifier');
  const [activeAuthType, setActiveAuthType] = useState<'signin' | 'signup'>('signup');
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const clerk = useClerk();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('identifier');
      setActiveAuthType('signup');
      setMobileNumber('');
      setEmailAddress('');
      setOtp(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
      setResendTimer(30);
    }
  }, [isOpen]);

  // Reset loading state when window regains focus or navigates back (e.g. OAuth cancelled)
  useEffect(() => {
    const handleReturnToTab = () => {
      setIsLoading(false);
    };

    window.addEventListener('focus', handleReturnToTab);
    window.addEventListener('visibilitychange', handleReturnToTab);
    window.addEventListener('pageshow', handleReturnToTab);

    return () => {
      window.removeEventListener('focus', handleReturnToTab);
      window.removeEventListener('visibilitychange', handleReturnToTab);
      window.removeEventListener('pageshow', handleReturnToTab);
    };
  }, []);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Save phone number and user profile to storage / Appwrite database
  const savePhoneToDB = (phone: string, email?: string) => {
    try {
      const identifier = email || phone;
      api.saveUserProfile(identifier, { phone, email: email || '' });
      api.syncUserWithAppwrite({
        userId: identifier,
        email: email || '',
        phone
      });
    } catch (e) {
      console.warn('Failed to save to profile API:', e);
    }
  };

  // Helper to ensure Clerk client is ready
  const getClerkClient = async () => {
    if (clerk?.client) return clerk.client;
    if (typeof window !== 'undefined' && (window as any).Clerk?.client) {
      return (window as any).Clerk.client;
    }
    const start = Date.now();
    while (Date.now() - start < 3500) {
      await new Promise((r) => setTimeout(r, 80));
      if (clerk?.client) return clerk.client;
      if (typeof window !== 'undefined' && (window as any).Clerk?.client) {
        return (window as any).Clerk.client;
      }
    }
    return clerk?.client || (typeof window !== 'undefined' ? (window as any).Clerk?.client : null);
  };

  // Step 1: Handle Initial Identifier (Mobile or Email)
  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = mobileNumber.trim();
    if (!val) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }

    setErrorMsg('');
    const isEmail = val.includes('@');

    if (isEmail) {
      setEmailAddress(val);
      await sendClerkOtp(val);
    } else {
      setIsLoading(true);
      savePhoneToDB(val);
      setTimeout(() => {
        setStep('link_email');
        setIsLoading(false);
      }, 300);
    }
  };

  // Step 2: Handle Link Email & Send Clerk OTP
  const handleLinkEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailAddress.trim();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    savePhoneToDB(mobileNumber, email);
    await sendClerkOtp(email);
  };

  // Robust Direct Clerk Email OTP Dispatcher
  const sendClerkOtp = async (targetEmail: string) => {
    setIsLoading(true);
    setErrorMsg('');
    const cleanEmail = targetEmail.trim();

    try {
      const client = await getClerkClient();
      if (!client) {
        throw new Error('Authentication service is initializing. Please wait a moment and try again.');
      }

      // Priority A: Try Sign-Up (New User)
      try {
        const signUpAttempt = await client.signUp.create({
          emailAddress: cleanEmail,
        });

        await signUpAttempt.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        setActiveAuthType('signup');
        setStep('otp');
        setResendTimer(30);
        setIsLoading(false);
        return;
      } catch (signUpErr: any) {
        console.log('SignUp result:', signUpErr);
        const errorCode = signUpErr?.errors?.[0]?.code;

        // Priority B: If user already exists in Clerk, switch to Sign-In
        if (errorCode === 'form_identifier_exists' || errorCode === 'session_exists') {
          const signInAttempt = await client.signIn.create({
            identifier: cleanEmail,
          });

          const emailFactor = signInAttempt.supportedFirstFactors?.find(
            (f: any) => f.strategy === 'email_code'
          );

          if (emailFactor && 'emailAddressId' in emailFactor) {
            await signInAttempt.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: emailFactor.emailAddressId,
            });

            setActiveAuthType('signin');
            setStep('otp');
            setResendTimer(30);
            setIsLoading(false);
            return;
          } else {
            throw new Error('Email OTP is not enabled for this account. Please sign in with password or Google.');
          }
        }

        // Check if an existing signup is already active for this email on client
        if (client.signUp && client.signUp.status === 'missing_requirements') {
          await client.signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });
          setActiveAuthType('signup');
          setStep('otp');
          setResendTimer(30);
          setIsLoading(false);
          return;
        }

        throw signUpErr;
      }
    } catch (err: any) {
      console.error('Clerk OTP Send Error:', err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Failed to send OTP to email. Please verify your email address.';
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  // Step 3: Handle OTP Input & Verification
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedDigits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('').trim();
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const client = await getClerkClient();
      if (!client) {
        throw new Error('Authentication client is not available.');
      }

      if (activeAuthType === 'signup' && client.signUp) {
        try {
          const result = await client.signUp.attemptEmailAddressVerification({ code });
          if (result.status === 'complete' && clerk.setActive) {
            await clerk.setActive({ session: result.createdSessionId });
            setSuccessMsg('Account created & verified! Welcome to NEESH.');
            setTimeout(() => {
              setIsLoading(false);
              onClose();
            }, 800);
            return;
          }
        } catch (signupVerifyErr) {
          console.log('SignUp verify note, trying signIn factor:', signupVerifyErr);
        }
      }

      if (client.signIn) {
        const result = await client.signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });

        if (result.status === 'complete' && clerk.setActive) {
          await clerk.setActive({ session: result.createdSessionId });
          setSuccessMsg('Signed in successfully! Welcome to NEESH.');
          setTimeout(() => {
            setIsLoading(false);
            onClose();
          }, 800);
          return;
        }
      }

      setErrorMsg('Invalid or expired OTP code. Please try again.');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Verification error:', err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid OTP code. Please check and try again.';
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  // Handle Social OAuth (Google / Apple)
  const handleOAuth = async (provider: 'oauth_google' | 'oauth_apple') => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const ssoCallbackUrl = origin ? `${origin}/sso-callback` : '/sso-callback';
      const homeUrl = origin ? `${origin}/` : '/';

      const oauthParams = {
        strategy: provider,
        redirectUrl: ssoCallbackUrl,
        redirectUrlComplete: homeUrl,
        continueSignUpUrl: homeUrl,
      };

      // Priority 1: Top-level Clerk universal redirect (handles new & existing users for both Apple & Google)
      if (typeof clerk?.authenticateWithRedirect === 'function') {
        await clerk.authenticateWithRedirect(oauthParams);
        return;
      }

      if (typeof (window as any)?.Clerk?.authenticateWithRedirect === 'function') {
        await (window as any).Clerk.authenticateWithRedirect(oauthParams);
        return;
      }

      const client = await getClerkClient();

      if (client?.signIn) {
        await client.signIn.authenticateWithRedirect(oauthParams);
        return;
      }

      if (client?.signUp) {
        await client.signUp.authenticateWithRedirect(oauthParams);
        return;
      }

      setErrorMsg('Failed to open social login. Please try again.');
      setIsLoading(false);
    } catch (err: any) {
      console.error('OAuth redirect error:', err);
      const providerName = provider === 'oauth_apple' ? 'Apple' : 'Google';
      const rawMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        '';
      
      const msg = rawMsg.toLowerCase().includes('not supported') || rawMsg.toLowerCase().includes('not enabled')
        ? `${providerName} Sign-In is not enabled in your Clerk Dashboard yet. Please turn on ${providerName} under SSO Connections in Clerk.`
        : rawMsg || `Failed to start ${providerName} sign-in. Please ensure it is enabled in your Clerk Dashboard.`;
      
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in-up">
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl p-7 sm:p-9 shadow-2xl text-slate-900 font-sans border border-slate-100 transition-all duration-300">
        
        {/* Top Navigation: Back Button (on steps 2 & 3) & Close Button */}
        <div className="flex items-center justify-between mb-4">
          {step !== 'identifier' ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                if (step === 'otp') setStep('link_email');
                else if (step === 'link_email') setStep('identifier');
              }}
              className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 transition-colors p-1 cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: Welcome Back / Identifier Input                       */}
        {/* ------------------------------------------------------------- */}
        {step === 'identifier' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#1f2937] tracking-tight mb-2">
                Welcome back!
              </h2>
              <p className="text-sm text-slate-500">
                Log in to access your account.
              </p>
            </div>

            <form onSubmit={handleIdentifierSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email or Mobile No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="0764492697"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#d09e44] focus:ring-1 focus:ring-[#d09e44] transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center font-medium">{errorMsg}</p>
              )}

              {/* Clerk Bot Protection / CAPTCHA Mount Element */}
              <div id="clerk-captcha" />

              {/* Action Button: shows "Processing..." during loading */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400">
                or continue with
              </span>
            </div>

            {/* Social OAuth Icons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleOAuth('oauth_google')}
                className="w-13 h-13 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-2xs"
                title="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('oauth_apple')}
                className="w-13 h-13 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-2xs text-black"
                title="Continue with Apple"
              >
                <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 50 50">
                  <path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z" />
                </svg>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mb-5">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-slate-600">
                Terms of Service
              </a>
              .
            </p>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <span>Secured by</span>
              <span className="font-extrabold tracking-wider text-slate-800">AXENTRA</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: Link Your Email (Screenshot-Matched)                 */}
        {/* ------------------------------------------------------------- */}
        {step === 'link_email' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#1f2937] tracking-tight mb-2">
                Link Your Email
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed px-2">
                This mobile number isn&apos;t connected to an account. Enter your email to receive a one-time password for verification.
              </p>
            </div>

            <form onSubmit={handleLinkEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#d09e44] focus:ring-1 focus:ring-[#d09e44] transition-all placeholder:text-slate-400"
                  autoFocus
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center font-medium">{errorMsg}</p>
              )}

              {/* Action Button: Send OTP */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-8">
              <span>Secured by</span>
              <span className="font-extrabold tracking-wider text-slate-800">AXENTRA</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: OTP Verification                                      */}
        {/* ------------------------------------------------------------- */}
        {step === 'otp' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#1f2937] tracking-tight mb-2">
                Verify OTP
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Enter the 6-digit code sent to <br />
                <span className="font-semibold text-slate-800">{emailAddress}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 OTP Input Boxes */}
              <div className="flex justify-between gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#d09e44] focus:ring-2 focus:ring-[#d09e44]/20 transition-all text-slate-900"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 text-center font-medium">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-xs text-emerald-600 text-center font-semibold">{successMsg}</p>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <span>Verify & Proceed</span>
                )}
              </button>

              {/* Resend Countdown */}
              <div className="text-center text-xs text-slate-500">
                {resendTimer > 0 ? (
                  <span>Resend code in <strong className="text-slate-700">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sendClerkOtp(emailAddress);
                    }}
                    className="text-[#d8a753] hover:underline font-semibold cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-6">
              <span>Secured by</span>
              <span className="font-extrabold tracking-wider text-slate-800">AXENTRA</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
