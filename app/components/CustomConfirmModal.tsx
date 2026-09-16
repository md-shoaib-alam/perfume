'use client';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  image?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: DialogVariant;
  image?: string;
  onClose?: () => void;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions | string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// Clean, high-precision SVG Icons (Strictly NO Emojis)
const DialogIcon: React.FC<{ variant: DialogVariant }> = ({ variant }) => {
  switch (variant) {
    case 'danger':
      return (
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      );
    case 'warning':
      return (
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    case 'success':
      return (
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'info':
    default:
      return (
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirmText, setConfirmText] = useState('Confirm');
  const [cancelText, setCancelText] = useState('Cancel');
  const [variant, setVariant] = useState<DialogVariant>('danger');
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [resolver, setResolver] = useState<((val: boolean) => void) | null>(null);
  const [handlers, setHandlers] = useState<{
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }>({});
  const [loading, setLoading] = useState(false);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setTitle(options.title || (options.variant === 'danger' ? 'Delete Item?' : 'Please Confirm'));
      setMessage(options.message);
      setConfirmText(options.confirmText || (options.variant === 'danger' ? 'Delete' : 'Confirm'));
      setCancelText(options.cancelText || 'Cancel');
      setVariant(options.variant || 'danger');
      setCustomImage(options.image || (options.variant === 'danger' ? '/assets/delete%20image.avif' : undefined));
      setIsAlertMode(false);
      setHandlers({ onConfirm: options.onConfirm, onCancel: options.onCancel });
      setResolver(() => resolve);
      setIsOpen(true);
    });
  };

  const showAlert = (options: AlertOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        setTitle('Notification');
        setMessage(options);
        setConfirmText('OK');
        setVariant('info');
        setCustomImage(undefined);
        setHandlers({});
      } else {
        setTitle(options.title || 'Notice');
        setMessage(options.message);
        setConfirmText(options.buttonText || 'OK');
        setVariant(options.variant || 'info');
        setCustomImage(options.image);
        setHandlers({ onConfirm: options.onClose });
      }
      setIsAlertMode(true);
      setResolver(() => () => resolve());
      setIsOpen(true);
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await handlers.onConfirm?.();
      resolver?.(true);
    } catch (err) {
      console.error('Error in onConfirm handler:', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    handlers.onCancel?.();
    resolver?.(false);
    setIsOpen(false);
  };

  // Keyboard accessibility: Escape dismissal and auto-focus
  useEffect(() => {
    if (!isOpen) return;

    // Focus primary button when modal opens
    const timer = setTimeout(() => {
      primaryBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isAlertMode) {
          handleConfirm();
        } else {
          handleCancel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isAlertMode, handlers, resolver]);

  return (
    <ConfirmContext.Provider value={{ showConfirm, showAlert }}>
      {children}

      {/* Luxury Light Mode Confirmation & Alert Modal */}
      {isOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          className="fixed inset-0 z-9999999 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop with Soft Luxury Blur */}
          <div
            onClick={!isAlertMode ? handleCancel : handleConfirm}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {variant === 'danger' ? (
            /* Bespoke Luxury Delete Modal (Matching user reference) */
            <div className="relative bg-[#faf8f5] border border-amber-200/50 text-slate-900 w-full max-w-[375px] sm:max-w-[395px] rounded-4xl p-6 sm:p-7 shadow-2xl shadow-black/25 font-sans z-10 animate-scale-up text-center overflow-hidden my-auto">
              
              {/* Close Button Top-Right */}
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close modal"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-200/60 cursor-pointer z-30"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Top Perfume Bottle Illustration (Clean, no background circle or badge) */}
              <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mt-2">
                <img
                  src={customImage || '/assets/delete%20image.avif'}
                  alt="Delete illustration"
                  className="w-full h-full object-contain drop-shadow-md pointer-events-none select-none"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Title */}
              <h3 id="dialog-title" className="text-2xl sm:text-[26px] font-serif font-bold text-slate-900 tracking-tight mt-2">
                {title}
              </h3>

              {/* Delicate Champagne Gold Accent Line */}
              <div className="w-10 h-[1.5px] bg-[#d6a750] mx-auto my-2.5 opacity-80" />

              {/* Description Message */}
              <p id="dialog-description" className="text-xs sm:text-[13px] text-slate-600 font-sans text-center max-w-[280px] mx-auto leading-relaxed">
                {message}
              </p>

              {/* Full-width Stacked Pill Action Buttons */}
              <div className="space-y-2.5 mt-6 w-full">
                <button
                  ref={primaryBtnRef}
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#8c1d24] hover:bg-[#74151b] active:bg-[#5e0f14] text-white text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <span>{loading ? 'Processing...' : confirmText}</span>
                  {!loading && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>

                {!isAlertMode && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-full bg-transparent hover:bg-black/[0.03] border border-[#caa04c]/60 text-slate-800 text-sm font-medium transition-colors cursor-pointer text-center"
                  >
                    {cancelText}
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Standard Luxury Modal Card (for Info, Warning, Success) */
            <div className="relative bg-white border border-slate-200/90 text-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/10 font-sans z-10 animate-scale-up space-y-5 my-auto">
              
              {/* Header with Luxury Badge & Clean Typography */}
              <div className="flex items-start gap-4">
                <DialogIcon variant={variant} />

                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 id="dialog-title" className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                    {title}
                  </h3>
                  <p id="dialog-description" className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Actions Button Group */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {!isAlertMode && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {cancelText}
                  </button>
                )}

                <button
                  ref={primaryBtnRef}
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#d8a753] hover:bg-[#c69542] active:bg-[#b58434] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-75"
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </ConfirmContext.Provider>
  );
};


export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
