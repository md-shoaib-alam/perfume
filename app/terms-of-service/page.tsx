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

export default function TermsOfServicePage() {
  const router = useRouter();
  const { cartItems, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, totalCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <title>Terms of Service &amp; Purchase Policy – BakhoorBliss</title>
      <meta name="description" content="Review the Terms of Service, shipping policies, returns, and ordering guidelines for BakhoorBliss luxury perfumery." />
      <link rel="canonical" href="https://bakhoorbliss.in/terms-of-service" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
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

      {/* Main Content Area */}
      <main className="flex-1 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Breadcrumbs */}
          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-serif text-slate-900 tracking-tight font-normal">
              Terms of Service
            </h1>
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-[#caa04c] transition-colors">
                Home
              </Link>
              <span className="text-slate-300">›</span>
              <span className="text-slate-800 font-semibold">Terms of Service</span>
            </nav>
          </div>

          {/* Legal Document Content */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[13px] sm:text-sm space-y-8 font-sans">
            
            {/* Introductory Preamble */}
            <div className="bg-[#faf9f6] border border-amber-200/50 rounded-2xl p-6 sm:p-8 space-y-3">
              <p className="font-serif text-base sm:text-lg text-slate-900 font-medium">
                Welcome to BakhoorBliss Luxury Perfumery.
              </p>
              <p>
                This website is owned and operated by BakhoorBliss Perfumes Private Limited. Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to BakhoorBliss. By accessing our website or purchasing from us, you agree to be bound by the following Terms of Service, including all policies referenced herein.
              </p>
              <p className="text-xs text-slate-500">
                If you do not agree to these Terms, you may not access the website or use our services.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                1. Eligibility and Use of Website
              </h2>
              <p>
                By using this website, you confirm that you are at least the age of majority in your state or country of residence, or that you are using the website under the supervision of a parent or legal guardian. You agree to use this website only for lawful purposes and in compliance with all applicable laws and regulations.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                2. Account Information
              </h2>
              <p>
                You may be required to provide personal information to place an order or create an account. You agree that all information provided is accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                3. Products and Fragrance Disclaimers
              </h2>
              <p>
                All products, including artisanal perfumes, concentrated extrait de parfums, attars, and luxury fragrance oils, are subject to availability. We make every effort to display the colors, packaging, and descriptions of our products accurately; however, variations may occur.
              </p>
              <p className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <strong className="text-slate-800">Fragrance Application &amp; Patch Test:</strong> Fragrance perception is subjective and may vary based on skin chemistry, environmental factors, and olfactory sensitivity. Fragrances should be used for external application only. We recommend performing a patch test prior to full application. BakhoorBliss is not liable for any adverse reactions resulting from improper usage or known personal sensitivities.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                4. Pricing and Payment
              </h2>
              <p>
                All prices are listed in Indian Rupees (INR) and are inclusive of applicable goods and services taxes unless specified otherwise. We reserve the right to modify prices at any time without prior notice.
              </p>
              <p>
                Payments must be made through approved secured payment gateways. By submitting payment details, you represent and warrant that you are authorized to use the designated payment method.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                5. Orders and Acceptance
              </h2>
              <p>
                Receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to accept, decline, or cancel any order for any reason, including errors in pricing or product descriptions, suspected fraud, or inventory limitations. In the event of a cancellation after payment processing, a full refund will be issued to the original payment method.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                6. Shipping and Delivery
              </h2>
              <p>
                Shipping timelines and delivery estimates are detailed in our dedicated <Link href="/shipping-policy" className="text-[#caa04c] underline hover:text-[#b58434]">Shipping Policy</Link>. While we endeavor to dispatch and deliver orders within estimated timeframes, delays caused by logistics providers, adverse weather, or regulatory inspections are beyond our direct control.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                7. Returns, Exchanges, and Refunds
              </h2>
              <p>
                Due to personal hygiene and the artisanal nature of fine perfumes, returns or exchanges are governed strictly under our <Link href="/return-policy" className="text-[#caa04c] underline hover:text-[#b58434]">Return Policy</Link>. Opened or used fragrance bottles cannot be accepted for return or exchange unless verified as damaged or defective upon arrival.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                8. Intellectual Property Rights
              </h2>
              <p>
                All content published on this website, including but not limited to brand names, logos, formulations, product packaging graphics, photographic compositions, text, and software code, is the exclusive intellectual property of BakhoorBliss Perfumes Private Limited and is protected under applicable Indian and international copyright and trademark laws.
              </p>
              <p>
                You may not copy, reproduce, modify, distribute, or exploit any material from this site without our express written consent.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                9. User Conduct and Prohibited Uses
              </h2>
              <p>
                You agree not to use the website:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>For any unlawful purpose or to solicit others to perform or participate in unlawful acts.</li>
                <li>To violate any local, national, or international regulations, laws, or local ordinances.</li>
                <li>To infringe upon or violate our intellectual property rights or the rights of others.</li>
                <li>To transmit worms, viruses, malware, or destructive code that may affect the functionality of the service.</li>
                <li>To harvest or collect personal information of other users without authorization.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                10. Third-Party Links
              </h2>
              <p>
                Certain content, products, and services available via our website may include materials from third parties. Third-party links on this site may direct you to external websites that are not affiliated with us. We are not responsible for examining or evaluating content accuracy and will not have any liability for third-party materials or websites.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                11. User Feedback and Reviews
              </h2>
              <p>
                If you submit product reviews, suggestions, creative concepts, or feedback, you grant BakhoorBliss an unrestricted, perpetual, royalty-free license to edit, publish, distribute, and utilize your feedback across our marketing channels without obligation of compensation or confidentiality.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                12. Personal Information &amp; Privacy
              </h2>
              <p>
                Your submission of personal information through the storefront is governed by our <Link href="/privacy-policy" className="text-[#caa04c] underline hover:text-[#b58434]">Privacy Policy</Link>, which outlines our strict protocols for encrypted data storage, customer privacy, and non-disclosure to unauthorized parties.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                13. Errors, Inaccuracies, and Omissions
              </h2>
              <p>
                Occasionally there may be information on our site that contains typographical errors, inaccuracies, or omissions relating to product descriptions, pricing, promotions, transit times, or availability. We reserve the right to correct any errors and to cancel orders if any information on the site is inaccurate at any time without prior notice.
              </p>
            </section>

            {/* Section 14 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                14. Disclaimer of Warranties; Limitation of Liability
              </h2>
              <p>
                We do not guarantee that your use of our service will be uninterrupted, timely, secure, or error-free. The service and all products delivered to you are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; for your personal use.
              </p>
              <p>
                In no case shall BakhoorBliss, our directors, officers, employees, affiliates, or suppliers be liable for any injury, loss, claim, or direct, indirect, incidental, punitive, or consequential damages arising from your use of any product or service procured from our site.
              </p>
            </section>

            {/* Section 15 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                15. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless BakhoorBliss and our parent, subsidiaries, affiliates, partners, officers, agents, contractors, and employees from any claim or demand, including reasonable legal fees, made by any third party due to or arising out of your breach of these Terms of Service.
              </p>
            </section>

            {/* Section 16 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                16. Severability
              </h2>
              <p>
                In the event that any provision of these Terms of Service is determined to be unlawful, void, or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed severed from these Terms without affecting the validity and enforceability of any remaining provisions.
              </p>
            </section>

            {/* Section 17 */}
            <section className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                17. Governing Law and Dispute Resolution
              </h2>
              <p>
                These Terms of Service and any separate agreements whereby we provide you services or products shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes or claims arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Ambala, Haryana, India.
              </p>
              <p className="text-xs text-slate-500">
                For financial fraud reporting or unauthorized cyber incident reporting, patrons may also refer to the national cybercrime portal or call the cybercrime helpline at <strong>1930</strong>.
              </p>
            </section>

            {/* Section 18 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                18. Contact Information and Concierge Support
              </h2>
              <p>
                Questions regarding the Terms of Service should be directed to our customer concierge team:
              </p>
              
              <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-6 space-y-2 text-xs sm:text-sm text-slate-700">
                <p><strong className="text-slate-900">Entity:</strong> BakhoorBliss Perfumes Private Limited</p>
                <p><strong className="text-slate-900">Registered Office:</strong> Plot No. 31, HSIIDC Industrial Estate, Jagadhari Road, Ambala, Haryana, 133006, India</p>
                <p><strong className="text-slate-900">Email:</strong> <a href="mailto:support@bakhoorbliss.in" className="text-[#caa04c] underline hover:text-[#b58434]">support@bakhoorbliss.in</a></p>
                <p><strong className="text-slate-900">Concierge Helpline:</strong> <a href="tel:+917206277777" className="text-slate-900 hover:text-[#caa04c] font-medium">+91 72062 77777</a></p>
                <p><strong className="text-slate-900">Hours:</strong> Monday &ndash; Saturday, 11:00 AM &ndash; 5:00 PM IST</p>
              </div>
            </section>

          </div>

        </div>
      </main>

      {/* Luxury Footer */}
      <Footer />
    </div>
    </>
  );
}
