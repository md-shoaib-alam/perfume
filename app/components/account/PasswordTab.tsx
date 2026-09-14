'use client';

import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

export const PasswordTab: React.FC = () => {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [passwordConfigured, setPasswordConfigured] = useState<boolean>(() => {
    return Boolean((user as any)?.passwordEnabled ?? (user as any)?.hasPassword);
  });

  React.useEffect(() => {
    if (user) {
      const isEnabled = Boolean((user as any)?.passwordEnabled ?? (user as any)?.hasPassword);
      setPasswordConfigured(isEnabled);
    }
  }, [user]);

  if (!isLoaded || !user) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-2xs flex items-center justify-center min-h-[300px]">
        <div className="w-7 h-7 border-2 border-[#caa04c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasPassword = passwordConfigured;
  const userEmail = user.primaryEmailAddress?.emailAddress || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (hasPassword && !currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasPassword) {
        // User is updating their existing password
        await user.updatePassword({
          currentPassword,
          newPassword,
        });
        setSuccessMessage('Your password has been updated successfully.');
      } else {
        // User does not have a password yet - calls /v1/me/change_password with newPassword
        await user.updatePassword({
          newPassword,
        });
        setPasswordConfigured(true);
        setSuccessMessage('Password created successfully! You can now change your password or sign in with it anytime.');
      }

      // Reload Clerk user session to sync user.hasPassword
      if (typeof user.reload === 'function') {
        try {
          await user.reload();
        } catch (e) {}
      }

      // Reset input fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password operation failed:', err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Failed to save password. Please verify your requirements and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!userEmail) {
      setErrorMessage('No primary email found for this account.');
      return;
    }

    setIsSendingReset(true);
    setResetMessage(null);
    setErrorMessage(null);

    try {
      // 1. Sign out active session because Clerk rejects password reset creation while logged in
      await clerk.signOut();

      // 2. Prepare reset_password_email_code
      const client = clerk?.client || (typeof window !== 'undefined' ? (window as any).Clerk?.client : null);
      if (client?.signIn) {
        await client.signIn.create({
          strategy: 'reset_password_email_code',
          identifier: userEmail,
        });
      }

      // 3. Redirect to sign in where user can enter the reset code
      window.location.href = '/auth/sign-in';
    } catch (err: any) {
      console.error('Password reset email error:', err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Failed to trigger password reset.';
      setErrorMessage(msg);
      setIsSendingReset(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {hasPassword ? 'Update Account Password' : 'Set Account Password'}
            </h3>
            <p className="text-xs text-slate-500">
              {hasPassword
                ? 'Change your current password or request a reset email.'
                : 'Add a password to your account for fast 1-step sign-ins.'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-700">
          <span className={`w-2 h-2 rounded-full ${hasPassword ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>
            {hasPassword ? 'Password is configured on this account' : 'No password set yet (signed up via OTP or Social)'}
          </span>
        </div>
      </div>

      {/* Form Alerts */}
      {errorMessage && (
        <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Password Management Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {hasPassword && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                {showCurrentPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            {hasPassword ? 'New Password' : 'Create Password'}
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              {showNewPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={8}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{hasPassword ? 'Update Password' : 'Save Password'}</span>
          )}
        </button>
      </form>

      {/* Alternative: Password Reset via Email Link */}
      {hasPassword && (
        <div className="pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-800">Forgot your current password?</h4>
              <p className="text-[11px] text-slate-500">
                Sign out and send a password reset code to <strong className="text-slate-700">{userEmail}</strong>.
              </p>
              {resetMessage && (
                <p className="text-[11px] font-semibold text-emerald-700 mt-1">{resetMessage}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSendingReset}
              className="shrink-0 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSendingReset ? 'Sending...' : 'Reset via Email'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
