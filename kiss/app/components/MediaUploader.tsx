'use client';
import React, { useState, useRef } from 'react';
import { uploadMediaToAppwrite } from '@/lib/appwrite';

interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  helperText?: string;
  previewType?: 'image' | 'video';
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  helperText = 'Upload image (JPG, PNG, WebP) or video (MP4, WebM)',
  previewType = 'image'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setError(null);

    try {
      const directUrl = await uploadMediaToAppwrite(file);
      onChange(directUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload media to Appwrite Storage.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <label className="block font-semibold text-slate-700">{label}</label>

      <div className="flex gap-3 items-start">
        {/* Thumbnail Preview */}
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group">
            {previewType === 'video' || value.endsWith('.mp4') || value.endsWith('.webm') ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 bg-black/60 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
            <svg className="w-5 h-5 mb-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">No Media</span>
          </div>
        )}

        {/* Input & Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or upload from device"
              className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />

            <label
              htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={`px-3 py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-all ${
                uploading
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'bg-[#c59b48] hover:bg-[#b58b38] text-white shadow-xs'
              }`}
            >
              {uploading ? 'Uploading...' : '📁 Upload'}
            </label>
          </div>

          <p className="text-[11px] text-slate-400">{helperText}</p>
          {error && <p className="text-[11px] text-rose-600 font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
};
