'use client';

import React, { useState } from 'react';
import { toast } from '@/components/lightswind/use-toast';

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image?: string;
  } | null;
}

export const NotifyModal: React.FC<NotifyModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [contactValue, setContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = contactValue.trim();
    if (!val) {
      setErrorMsg('Please enter your email or phone number.');
      return;
    }

    const isEmail = val.includes('@');
    if (isEmail && !val.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          email: isEmail ? val : '',
          phone: !isEmail ? val : ''
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok && data.error) {
        throw new Error(data.error);
      }

      toast.success(
        `You're on the priority list! We'll notify you the moment ${product.name} is available.`
      );
      setContactValue('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to register alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Logo & Title */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center items-center pt-2">
            <img 
              src="/assets/bakhoorblissnav.avif" 
              alt="Bakhoor Bliss" 
              className="h-10 sm:h-11 w-auto object-contain" 
            />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notify Me When Available
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Be the first to know when <span className="font-semibold text-slate-800">{product.name}</span> launches or restocks.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address or Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder="e.g. name@example.com or 9876543210"
              autoFocus
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-[#d09e44] focus:ring-1 focus:ring-[#d09e44] transition-all placeholder:text-slate-400"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 text-center font-medium">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-75"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </span>
            ) : (
              <span>Notify Me</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          We respect your privacy. No spam, only priority fragrance launch updates.
        </p>
      </div>
    </div>
  );
};
