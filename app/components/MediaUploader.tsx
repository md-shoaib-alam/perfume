'use client';
import React, { useState, useRef } from 'react';
import { uploadMediaToAppwrite, deleteMediaFromAppwrite } from '@/lib/appwrite';
import { compressImageToWebP } from '@/lib/imageCompressor';

interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  helperText?: string;
  previewType?: 'image' | 'video';
  autoDeleteOldOnReplace?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  helperText = 'Upload image (Auto-compressed to WebP) or video (MP4, WebM)',
  previewType = 'image',
  autoDeleteOldOnReplace = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const previousUrl = value;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 1. Auto-compress heavy images (e.g. 10MB JPG/PNG) to WebP (~200KB)
      setStatusText('Optimizing to WebP...');
      setUploadProgress(15);
      const processedFile = await compressImageToWebP(file);
      
      // 2. Upload to Appwrite with live progress percentage callback
      setStatusText('Uploading...');
      const directUrl = await uploadMediaToAppwrite(processedFile, (pct) => {
        setUploadProgress(Math.max(20, pct));
      });

      // 3. Delete old replaced Appwrite file to prevent wasted storage resources
      if (autoDeleteOldOnReplace && previousUrl && previousUrl !== directUrl) {
        deleteMediaFromAppwrite(previousUrl).catch(() => {});
      }

      onChange(directUrl);
      setStatusText('Done');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload media to Appwrite Storage.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setStatusText('');
      }, 500);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    const currentUrl = value;
    if (currentUrl) {
      // Delete old file from Appwrite storage bucket immediately
      deleteMediaFromAppwrite(currentUrl).catch(() => {});
    }
    onChange('');
  };

  return (
    <div className="space-y-1.5 text-xs font-sans">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-800 tracking-wide text-xs">{label}</label>
        {uploading && (
          <span className="text-[11px] font-bold text-[#b58b38] flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#d6a750] animate-ping" />
            {statusText} {uploadProgress > 0 && uploadProgress < 100 ? `(${uploadProgress}%)` : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors w-full min-w-0">
        {/* Thumbnail Preview */}
        {value ? (
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group">
            {previewType === 'video' || value.endsWith('.mp4') || value.endsWith('.webm') ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute inset-0 bg-black/70 text-white font-medium opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] cursor-pointer gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
            <svg className="w-5 h-5 text-slate-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] mt-0.5 font-medium text-slate-400">Empty</span>
          </div>
        )}

        {/* Input & Upload Controls */}
        <div className="flex-1 w-full space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 w-full min-w-0">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste URL or upload file"
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-mono text-[11px]"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              id={`upload-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
            />

            <label
              htmlFor={`upload-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider cursor-pointer shrink-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                uploading
                  ? 'bg-amber-50 border border-[#d6a750]/50 text-[#b58b38]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-[#d6a750]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{uploadProgress > 0 ? `${uploadProgress}%` : 'Compressing...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload</span>
                </>
              )}
            </label>
          </div>

          {/* Upload Progress Bar Animation */}
          {uploading && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-[#d6a750] via-[#c59b48] to-[#b58b38] h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.max(5, uploadProgress)}%` }}
              />
            </div>
          )}

          <p className="text-[10.5px] text-slate-500 leading-tight">{helperText}</p>
          {error && <p className="text-[10.5px] text-rose-600 font-semibold">{error}</p>}
        </div>
      </div>
    </div>
  );
};
