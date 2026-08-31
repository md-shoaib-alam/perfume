'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useCart } from '../hooks/useCart';

const CartDrawer = dynamic(() => import('../components/CartDrawer').then((m) => m.CartDrawer), { ssr: false });
const MenuDrawer = dynamic(() => import('../components/MenuDrawer').then((m) => m.MenuDrawer), { ssr: false });
const AuthModal = dynamic(() => import('../auth/AuthModal').then((m) => m.AuthModal), { ssr: false });

export default function ContactPage() {
  const router = useRouter();
  const { cartItems, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, totalCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    saveInfo: false
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg('Please write your message or inquiry.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmitted(true);
      if (!formData.saveInfo) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          saveInfo: false
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#caa04c]/20">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Storefront Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        isCartOpen={isCartOpen}
        isMenuOpen={isMenuOpen}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthOpen(true);
        }}
        onOpenAccount={() => router.push('/account')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => {
          if (q.trim()) router.push(`/collections/all?q=${encodeURIComponent(q.trim())}`);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeItem}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
      />

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onOpenAccount={() => router.push('/account')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Main Contact Section */}
      <main className="flex-1 min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-220px)] flex flex-col justify-center py-14 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          {/* Centered Breadcrumbs & Header */}
          <div className="text-center mb-12 sm:mb-16 space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 tracking-tight font-normal">
              Contact us
            </h1>
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-[#caa04c] transition-colors">
                Home
              </Link>
              <span className="text-slate-300">›</span>
              <span className="text-slate-800 font-semibold">Contact us</span>
            </nav>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-serif text-slate-800">
                  Fill out the form below for any queries and feedback
                </h2>
              </div>

              {submitted ? (
                <div className="p-6 bg-[#faf9f6] rounded-2xl border border-amber-200/80 shadow-xs space-y-3 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Message Received</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Thank you for reaching out to our boutique concierge. Our fragrance advisors will review your query and reply via email or phone within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs font-bold text-[#caa04c] hover:underline cursor-pointer"
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      {errorMsg}
                    </div>
                  )}

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <textarea
                      rows={5}
                      placeholder="Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#caa04c] focus:ring-1 focus:ring-[#caa04c] transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Save Info Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="saveInfo"
                      checked={formData.saveInfo}
                      onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#caa04c] focus:ring-[#caa04c] cursor-pointer"
                    />
                    <label htmlFor="saveInfo" className="text-xs text-slate-500 select-none cursor-pointer">
                      Save my name, email, and website in this browser for the next time I comment.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Submit Now'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Contact Details (5 cols) */}
            <div className="lg:col-span-5 space-y-7 text-xs text-slate-600 lg:pl-6">
              
              {/* Address */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-sm font-bold text-slate-900 tracking-tight">
                  Address
                </h3>
                <p className="font-medium text-slate-700">BakhoorBliss Perfumes Private Limited</p>
                <p className="leading-relaxed text-slate-500">
                  Plot No. 31, HSIIDC Industrial Estate, Jagadhari Road, Ambala, Haryana, 133006
                </p>
              </div>

              {/* Information */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-sm font-bold text-slate-900 tracking-tight">
                  Information
                </h3>
                <p>
                  <a href="mailto:wecare@neeshperfumes.com" className="text-slate-700 hover:text-[#caa04c] transition-colors">
                    wecare@neeshperfumes.com
                  </a>
                </p>
                <p>
                  <a href="tel:+917206277777" className="text-slate-700 hover:text-[#caa04c] font-medium transition-colors">
                    +91 72062 77777
                  </a>
                </p>
              </div>

              {/* Social Media */}
              <div className="space-y-2">
                <h3 className="font-serif text-sm font-bold text-slate-900 tracking-tight">
                  Social Media
                </h3>
                <div className="flex items-center gap-3 text-slate-700">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* We're Open */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-sm font-bold text-slate-900 tracking-tight">
                  We&apos;re Open
                </h3>
                <p className="leading-relaxed text-slate-500">
                  Our customer advisors are available by phone at <span className="font-semibold text-slate-800">+91 72062 77777</span> Monday to Saturday from 11:00 AM to 5:00 PM (IST).
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
