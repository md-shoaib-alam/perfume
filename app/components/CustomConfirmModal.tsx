'use client';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: DialogVariant;
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
        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      );
    case 'warning':
      return (
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
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
        <div className="w-11 h-11 rounded-2xl bg-amber-50/70 border border-[#caa04c]/40 flex items-center justify-center text-[#b88f3e] shrink-0">
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
  const [resolver, setResolver] = useState<((val: boolean) => void) | null>(null);
  const [handlers, setHandlers] = useState<{
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  }>({});
  const [loading, setLoading] = useState(false);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setTitle(options.title || (options.variant === 'danger' ? 'Confirm Action' : 'Please Confirm'));
      setMessage(options.message);
      setConfirmText(options.confirmText || (options.variant === 'danger' ? 'Delete' : 'Confirm'));
      setCancelText(options.cancelText || 'Cancel');
      setVariant(options.variant || 'danger');
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
        setHandlers({});
      } else {
        setTitle(options.title || 'Notice');
        setMessage(options.message);
        setConfirmText(options.buttonText || 'OK');
        setVariant(options.variant || 'info');
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
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4"
        >
          {/* Backdrop with Subtle Blur */}
          <div
            onClick={!isAlertMode ? handleCancel : handleConfirm}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-fade-in"
          />

          {/* Simple Clean Modern Dialog Card */}
          <div className="relative bg-white border border-slate-200 text-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl shadow-slate-900/15 font-sans z-10 animate-scale-up space-y-4">
            
            {/* Header with Icon and Simplified Text */}
            <div className="flex items-start gap-3">
              <DialogIcon variant={variant} />

              <div className="flex-1 min-w-0 pt-0.5">
                <h3 id="dialog-title" className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                <p id="dialog-description" className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions Button Group */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {!isAlertMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {cancelText}
                </button>
              )}

              <button
                ref={primaryBtnRef}
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-[#caa04c] hover:bg-[#b88f3e] text-white shadow-amber-500/20'
                }`}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>

          </div>
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
