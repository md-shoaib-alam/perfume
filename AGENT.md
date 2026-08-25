# NEESH™ Luxury Perfumery - Agent & Development Guidelines

## 1. Zero Emoji Policy (Strict)
- **NEVER use raw Unicode emojis anywhere in the UI** (e.g. 🗑️, ⚠️, ✨, ✦, 🛍️, etc.).
- Always use **clean, minimalist, precision-crafted vector SVG icons** (stroke-based, 1.5px - 2px stroke width, matching the luxury aesthetic).
- Emojis cheapen high-end luxury brand presentation and must not be used in alerts, buttons, headers, cards, or microcopy.

## 2. Luxury Aesthetic & UI Architecture
- **Light & Minimalist Luxury Theme**: Clean white/cream surfaces (`bg-white`, `bg-slate-50`), crisp dark slate typography (`text-slate-900`, `text-slate-800`), and signature champagne gold accents (`#d6a750` / `#caa04c` / `#b88f3e`).
- **Modal Dialogs & Alerts**:
  - Always rendered in refined **Light Mode** (`bg-white border border-slate-200 shadow-2xl shadow-slate-900/15`).
  - Subtle backdrop blur (`bg-black/50 backdrop-blur-sm`).
  - High-precision SVG status icons (Danger, Warning, Success, Info).
- **Responsive & Touch-Friendly**: All components must be responsive with mobile swipe gestures and smooth transitions.

## 3. Backend & Data Authority (Appwrite Cloud)
- **100% Appwrite Driven**: Products, Orders, Reviews, Coupons, Hero Slides, Story Collections, and Settings are dynamically fetched and stored in Appwrite Database (`perfumedb`).
- **Media Uploads**: All images and videos must be uploaded to Appwrite Cloud Storage bucket (`perfume_media`) via `uploadMediaToAppwrite()`.
- **No Hardcoded Data**: Never use hardcoded fallback product arrays that mask live database state or hinder cross-profile synchronization.

## 4. Asset Caching & Ultra-Fast Loading
- **Image Optimization & Cache**: All images must have `loading="lazy"` and `decoding="async"`.
- **Next.js Caching Headers**: In `next.config.ts`, remote patterns for Appwrite and CDNs have `minimumCacheTTL: 31536000` (1 year) and next-gen compression formats (`avif`, `webp`).
- **Static Asset Headers**: Heavy static assets are cached with `Cache-Control: public, max-age=31536000, immutable`.

## 5. Always Use Latest Documentation & Modern UI Terminology (Strict)
- **Never give outdated docs, deprecated methods, or obsolete terminology**:
  - **Appwrite Cloud (Latest)**: Always use current UI terms: **"Columns"** (not legacy "Attributes"), **"Rows"** (not legacy "Documents"), **"Buckets"**, and latest SDK v14+ patterns.
  - **Next.js**: Use `./proxy.ts` convention (not `middleware.ts`), App Router standards, and Server Components/Route Handlers.
  - **Clerk**: Use latest Clerk v6+ React hooks (`useUser`, `useClerk`, `useSignIn`, `useSignUp`).
- Always double check and provide the most current, up-to-date documentation and instructions.
