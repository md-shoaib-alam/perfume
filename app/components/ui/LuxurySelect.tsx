'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  position?: 'top' | 'bottom' | 'auto';
  align?: 'left' | 'right';
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
  'aria-label'?: string;
}

export const LuxurySelect: React.FC<LuxurySelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  position = 'bottom',
  align = 'left',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  id,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (!opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
          }
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1 < options.length ? prev + 1 : 0));
        }
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : options.length - 1));
        }
      }
    },
    [isOpen, highlightedIndex, options, onChange]
  );

  const isPositionTop = position === 'top';
  const isAlignRight = align === 'right';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full inline-flex items-center justify-between gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300 focus:border-[#d6a750] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 transition-all shadow-2xs cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#d6a750]/30 ${triggerClassName}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? (isPositionTop ? 'rotate-0' : 'rotate-180') : (isPositionTop ? 'rotate-180' : 'rotate-0')
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Content Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className={`absolute ${isAlignRight ? 'right-0' : 'left-0'} w-full min-w-[170px] bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${
            isPositionTop ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${contentClassName}`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isSelected
                    ? 'bg-amber-50/70 text-slate-900 font-bold'
                    : isHighlighted
                    ? 'bg-slate-50 text-slate-900 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col truncate">
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</span>
                  )}
                </div>

                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-[#c59b48] shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
