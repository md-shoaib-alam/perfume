'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useConfirm } from '../components/CustomConfirmModal';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';

const DEFAULT_ANNOUNCEMENTS = [
  'FLAT 15% OFF | USE CODE: LUXE15',
  'FREE SHIPPING ON ORDERS OVER RS. 1,500',
  'LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE',
  '7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML'
];

export const AnnouncementBarManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useConfirm();

  const [announcementList, setAnnouncementList] = useState<string[]>(DEFAULT_ANNOUNCEMENTS);
  const [announcementCode, setAnnouncementCode] = useState('LUXE15');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        if (data) {
          if (data.announcementCode) {
            setAnnouncementCode(data.announcementCode);
          }

          if (data.announcementMessages) {
            let parsed: string[] = [];
            if (typeof data.announcementMessages === 'string') {
              try {
                parsed = JSON.parse(data.announcementMessages);
              } catch (e) {}
            } else if (Array.isArray(data.announcementMessages)) {
              parsed = data.announcementMessages;
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAnnouncementList(parsed.map((m: any) => String(m)).filter(Boolean));
              return;
            }
          }

          if (data.announcementText) {
            setAnnouncementList([
              data.announcementText,
              'FREE SHIPPING ON ORDERS OVER RS. 1,500',
              'LUXURY EXTRAIT DE PARFUM | 10+ HOURS LINGERING GUARANTEE',
              '7 DAYS NO QUESTIONS ASKED RETURNS ON 100ML & 50ML'
            ]);
          }
        }
      } catch (err: any) {
        console.warn('Failed to load announcement settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleAddPhrase = () => {
    setAnnouncementList((prev) => [...prev, 'NEW PROMOTIONAL OFFER | USE CODE: SAVE10']);
  };

  const handleUpdatePhrase = (index: number, text: string) => {
    setAnnouncementList((prev) => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  };

  const handleRemovePhrase = (index: number) => {
    setAnnouncementList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhrase = (index: number, direction: 'up' | 'down') => {
    setAnnouncementList((prev) => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanList = announcementList.map((m) => m.trim()).filter(Boolean);
      const payload = {
        announcementText: cleanList[0] || 'FLAT 15% OFF | USE CODE: LUXE15',
        announcementCode: announcementCode.trim().toUpperCase(),
        announcementMessages: JSON.stringify(cleanList.length > 0 ? cleanList : DEFAULT_ANNOUNCEMENTS)
      };

      await api.updateSettings(payload);

      window.dispatchEvent(new Event('neesh_settings_updated'));
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save announcement bar settings:', err);
      await showAlert({
        title: 'Save Failed',
        message: `Could not save announcement bar settings: ${err.message || 'Unknown error'}`,
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#caa04c] shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
            <span>Top Announcement Bar Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the continuous luxury gold scrolling marquee ticker displayed at the top of every store page.
          </p>
        </div>

        {saved && (
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-fade-in-up">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Storefront Updated Live</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Live Visual Preview Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Live Storefront Ticker Preview</h3>
              <p className="text-[11px] text-slate-500">
                This exact banner scrolls at the top of Home, Collections, Product Details, and Customer Account pages.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-[#caa04c] border border-amber-200/80 rounded-lg text-[10.5px] font-bold shrink-0">
              {announcementList.length} Active Phrases
            </span>
          </div>

          <div className="bg-[#caa04c] text-[#222222] font-semibold text-[11px] py-2.5 px-4 rounded-xl overflow-hidden uppercase tracking-widest whitespace-nowrap border border-[#b88f3e]/40 shadow-xs flex items-center gap-6 select-none">
            {announcementList.length === 0 ? (
              <span className="text-slate-800/80 italic">No announcement messages added. Click "Add New Ticker Phrase" below.</span>
            ) : (
              announcementList.map((msg, idx) => (
                <React.Fragment key={idx}>
                  <span className="flex items-center gap-2 shrink-0">
                    {idx === 0 && <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />}
                    <span>{msg || '(Empty message)'}</span>
                  </span>
                  <span className="text-slate-900/60 font-bold shrink-0">✦</span>
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* Settings & Phrases Management Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Coupon Code */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-0.5">Primary Coupon Promo Code</label>
              <p className="text-[11px] text-slate-500">Customers will be able to copy or apply this coupon code directly.</p>
            </div>
            <input
              type="text"
              value={announcementCode}
              onChange={(e) => setAnnouncementCode(e.target.value.toUpperCase())}
              placeholder="e.g. LUXE15"
              className="w-full sm:w-56 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-[#d6a750] transition-all"
            />
          </div>

          {/* Dynamic Phrases List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Ticker Phrases Sequence</h4>
                <p className="text-[11px] text-slate-500">Order of messages that loop in the marquee.</p>
              </div>
              <button
                type="button"
                onClick={handleAddPhrase}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Ticker Phrase</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {announcementList.map((phrase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/80 font-bold text-[11px] text-[#caa04c] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => handleUpdatePhrase(index, e.target.value)}
                    placeholder={`Announcement phrase #${index + 1}`}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#d6a750] transition-all"
                  />

                  {/* Reorder Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMovePhrase(index, 'up')}
                    title="Move Up"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    disabled={index === announcementList.length - 1}
                    onClick={() => handleMovePhrase(index, 'down')}
                    title="Move Down"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhrase(index)}
                    title="Remove Phrase"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {announcementList.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-xs space-y-2">
                  <p>No ticker phrases configured.</p>
                  <button
                    type="button"
                    onClick={() => setAnnouncementList(DEFAULT_ANNOUNCEMENTS)}
                    className="font-bold text-[#caa04c] hover:underline cursor-pointer"
                  >
                    Load Luxury Default Phrases
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAnnouncementList(DEFAULT_ANNOUNCEMENTS)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Publishing Live...' : 'Save & Publish Live'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
