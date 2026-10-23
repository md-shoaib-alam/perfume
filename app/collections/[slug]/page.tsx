'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnnouncementBar } from '../../components/AnnouncementBar';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/ProductCardSkeleton';
import { GoldTrustBanner } from '../../components/GoldTrustBanner';

const CartDrawer = dynamic(() => import('../../components/CartDrawer').then((m) => m.CartDrawer), { ssr: false });
const MenuDrawer = dynamic(() => import('../../components/MenuDrawer').then((m) => m.MenuDrawer), { ssr: false });
const AuthModal = dynamic(() => import('../../auth/AuthModal').then((m) => m.AuthModal), { ssr: false });
const AccountDashboard = dynamic(() => import('../../components/AccountDashboard').then((m) => m.AccountDashboard), { ssr: false });

import { api } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { LuxurySelect } from '../../components/ui/LuxurySelect';
import { getProductSlug } from '../../utils/slug';
import type { Product } from '../../types';

interface CollectionMetadata {
  title: string;
  badge: string;
  subtitle: string;
  editorial: string;
  bannerImage: string;
  categoryFilter?: string;
  genderFilter?: string;
}

const COLLECTION_INFO_MAP: Record<string, CollectionMetadata> = {
  'for-her': {
    badge: 'FLORELLE & FEMME COLLECTION',
    title: 'Pour Femme',
    subtitle: 'Sensual floral extraits, golden ambers, and velvety nectar compositions.',
    editorial: 'The Pour Femme Collection showcases a range of sensual and lasting aromas for the modern woman who embodies and exudes elegance, charisma, and grace. Each fragrance of floral extracts steeped in pristine oils is handcrafted to invoke the essence of sophisticated haute perfumery from the opulent palaces of the Mediterranean to the royal courts of the East.',
    bannerImage: '',
    genderFilter: 'For Her'
  },
  'for-him': {
    badge: 'HOMME & NOIR COLLECTION',
    title: 'Pour Homme',
    subtitle: 'Commanding agarwoods, spicy aromatics, and crisp architectural woods.',
    editorial: 'The Pour Homme Collection captures unyielding presence, refined power, and magnetic depth. Formulated with high-concentration aged agarwood, Venetian saffron, and crisp Calabrian bergamot, each extrait creates an authoritative sillage tailored for the distinguished gentleman.',
    bannerImage: '',
    genderFilter: 'For Him'
  },
  'unisex': {
    badge: 'EXCLUSIVE ARTISAN BLENDS',
    title: 'Unisex Haute Parfumerie',
    subtitle: 'Genderless liquid architecture blending rare resins, spices, and exotic florals.',
    editorial: 'Transcend conventional fragrance boundaries with our unisex compositions. Formulated with vintage resins, smoky incense, and rare floral absolutes that evolve uniquely on pulse points throughout the day.',
    bannerImage: '',
    genderFilter: 'Unisex'
  },
  'extrait-de-parfum': {
    badge: 'HAUTE EXTRAIT (30%+ CONCENTRATION)',
    title: 'Extrait De Parfum',
    subtitle: 'Ultra-concentrated 30%+ pure oil perfume formulations guaranteeing 12+ hours of lingering sillage.',
    editorial: 'Crafted with master perfumers from Grasse and Dubai, our Extrait De Parfum line is macerated for 90 days in dark oak casks, ensuring unparalleled projection, complexity, and longevity.',
    bannerImage: '',
    categoryFilter: 'extrait-de-parfum'
  },
  'attar': {
    badge: 'IMPERIAL PURE PERFUME OILS',
    title: 'Imperial Attars',
    subtitle: 'Distilled aged agarwoods, Taif roses, and precious musks in non-alcoholic pure oil concentrations.',
    editorial: 'Centuries of heritage preserved in artisanal flacons. Each drop of our non-alcoholic Imperial Attars represents pure hydro-distilled botanicals and wild-harvested resins.',
    bannerImage: '',
    categoryFilter: 'attar'
  },
  'discovery-set': {
    badge: 'OLFACTORY TASTING SETS',
    title: 'Discovery Sets',
    subtitle: 'Explore the complete olfactive spectrum with complimentary voucher redeemable on your full bottle.',
    editorial: 'Experience the entire collection before selecting your signature scent. Each discovery coffret includes travel-ready atomizers accompanied by an exclusive full-bottle redemption voucher.',
    bannerImage: '',
    categoryFilter: 'discovery-set'
  },
  'gift-set': {
    badge: 'LUXURY GIFTING COFFRETS',
    title: 'Gifting Collections',
    subtitle: 'Handcrafted presentation boxes for special celebrations, anniversaries, and distinguished milestones.',
    editorial: 'Unwrap the magic of haute perfumery. Encased in velvet-lined champagne gold presentation coffrets, our gifting sets represent the ultimate expression of gratitude and luxury.',
    bannerImage: '',
    categoryFilter: 'gift-set'
  },
  'travel-set': {
    badge: 'PORTABLE 4X10ML REFILLS',
    title: 'My Closet & Travel Sets',
    subtitle: 'Portable 4x10ml atomizers and pocket extraits for global jetsetters and connoisseurs on the go.',
    editorial: 'Never compromise on your olfactory presence wherever your travels lead. Precision engineered leak-proof pocket atomizers loaded with concentrated Extrait formulations.',
    bannerImage: ''
  },
  'bureau': {
    badge: 'BUREAU COLLECTION',
    title: 'Bureau Collection',
    subtitle: 'Refined, versatile office and boardroom extraits designed for authoritative yet unobtrusive elegance.',
    editorial: 'The Bureau Collection presents a range of therapy perfumes crafted for business meetings and day-to-day work experience. Light yet commanding scents with crisp bergamot, fresh lavender, and warm cedarwood.',
    bannerImage: ''
  },
  'luxe': {
    badge: 'LUXE COLLECTION',
    title: 'Luxe Collection',
    subtitle: 'Rare vintage agarwoods, golden ambers, and regal spice accords crafted for black-tie soirees.',
    editorial: 'The Luxe Collection is built around the most precious raw natural agarwoods, bourbon vanilla, and golden ambers in high extrait concentrations for evening galas and unforgettable moments.',
    bannerImage: ''
  },
  'haute': {
    badge: 'HAUTE COLLECTION',
    title: 'Haute Collection',
    subtitle: 'Avant-garde artisan compositions created by world-renowned Master Perfumers.',
    editorial: 'The artisanal crown jewel of the House of BakhoorBliss. Formulated in Grasse with ultra-rare natural resins and distilled botanical isolates for the true connoisseur.',
    bannerImage: ''
  },
  'miss_neesh': {
    badge: 'MISS BAKHOORBLISS COLLECTION',
    title: 'Miss BakhoorBliss Collection',
    subtitle: 'Radiant, youthful floral bouquets and shimmering gourmand nectar formulations.',
    editorial: 'Youthful vivacity meets haute elegance. Sparkling fruity-floral accords blended with white musks and pink peonies for an uplifting, luminous daytime aura.',
    bannerImage: ''
  },
  'all': {
    badge: 'HOUSE OF BAKHOORBLISS',
    title: 'All Haute Fragrances',
    subtitle: 'Explore the complete universe of BakhoorBliss Extrait de Parfums, Imperial Attars, and Discovery Sets.',
    editorial: 'Discover the entire compendium of luxury perfumes, discovery sets, and pure oils formulated with Royal Indian traditions and Parisian fine perfumery finesse.',
    bannerImage: ''
  }
};

import { useProductsQuery, useCollectionsQuery } from '../../hooks/useQueries';

export default function CollectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSlug = (params?.slug as string) || 'all';
  const slug = rawSlug.toLowerCase();
  const isAllCollection = slug === 'all' || slug === 'shop-all';
  const querySearch = searchParams?.get('q') || '';

  const {
    cartItems,
    totalCartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  const { data: queryProducts = [], isLoading: isProductsLoading } = useProductsQuery();
  const { data: dbCollections = [], isLoading: isCollectionsLoading } = useCollectionsQuery();
  const productsList = queryProducts;
  const loading = (isProductsLoading || isCollectionsLoading) && productsList.length === 0;

  const [sortBy, setSortBy] = useState<'bestseller' | 'price-asc' | 'price-desc' | 'rating'>('bestseller');
  const [searchQuery, setSearchQuery] = useState<string>(querySearch);

  // Global Shell States
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (querySearch) {
      setSearchQuery(querySearch);
    }
  }, [querySearch]);

  const defaultMeta = COLLECTION_INFO_MAP[slug] || {
    badge: 'HOUSE OF BAKHOORBLISS',
    title: `${slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Collection`,
    subtitle: 'Handcrafted luxury extraits and rare botanical blends from the House of BakhoorBliss.',
    editorial: 'Each perfume in this curation is blended with the highest concentration of fragrance oils to guarantee lingering longevity and sublime presence.',
    bannerImage: ''
  };

  // Merge live Appwrite collection data if configured by admin
  const meta = useMemo(() => {
    const dbMatch = dbCollections.find(
      (c) =>
        c.slug === slug ||
        (c.name && c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) ||
        (c.id && c.id === slug)
    );

    // Only use the real banner image saved in database or explicitly configured in metadata (no mock product image fallbacks)
    const resolvedBanner = (dbMatch?.bannerImage || defaultMeta.bannerImage || '').trim();

    return {
      ...defaultMeta,
      title: dbMatch?.name || defaultMeta.title,
      subtitle: dbMatch?.subtitle || defaultMeta.subtitle,
      editorial: dbMatch?.editorial || defaultMeta.editorial,
      bannerImage: resolvedBanner,
      badge: dbMatch?.badge || defaultMeta.badge
    };
  }, [dbCollections, slug, defaultMeta]);

  useEffect(() => {
    if (meta?.title) {
      document.title = `${meta.title} – BakhoorBliss`;
    }
  }, [meta?.title]);

  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // 1. Slug based filtering
    if (meta.genderFilter) {
      list = list.filter((p) => p.gender === meta.genderFilter || p.gender === 'Unisex');
    } else if (meta.categoryFilter) {
      list = list.filter((p) => p.category === meta.categoryFilter);
    } else if (slug === 'travel-set') {
      list = list.filter(
        (p) =>
          p.category === 'discovery-set' ||
          p.name.toLowerCase().includes('closet') ||
          p.name.toLowerCase().includes('travel') ||
          p.subtitle?.toLowerCase().includes('travel')
      );
    } else if (slug !== 'all' && slug !== 'shop-all') {
      const cleanSlug = slug.replace(/[-_]/g, ' ');
      list = list.filter(
        (p) =>
          (p.collection || '').toLowerCase() === slug ||
          p.name.toLowerCase().includes(cleanSlug) ||
          p.subtitle?.toLowerCase().includes(cleanSlug) ||
          p.description?.toLowerCase().includes(cleanSlug)
      );
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else {
      list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return list;
  }, [productsList, slug, meta, searchQuery, sortBy]);

  const crossCollectionsList = useMemo(() => {
    // Only collections that hold at least one live product; a seeded row with no
    // products would otherwise render as a dead-end showcase.
    return dbCollections
      .filter((c) => {
        const keys = [c.slug, c.id, c.name]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase().trim());
        const isCurrent = keys.includes(slug);
        return !isCurrent && productsList.some((p) => keys.includes((p.collection || '').toLowerCase().trim()));
      })
      .slice(0, 3)
      .map((c) => ({
        id: c.slug || c.id,
        title: c.name,
        badge: c.badge || '',
        image: (c.image || c.bannerImage || '').trim(),
        href: `/collections/${c.slug || c.id}`
      }));
  }, [dbCollections, slug, productsList]);

  return (
    <>
      <title>{`${meta.title} – BakhoorBliss`}</title>
      <meta name="description" content={meta.subtitle || meta.editorial || 'Explore BakhoorBliss luxury fragrances and artisanal perfumes.'} />
      <link rel="canonical" href={`https://bakhoorbliss.in/collections/${slug}`} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta property="og:title" content={`${meta.title} – BakhoorBliss`} />
      <meta property="og:description" content={meta.subtitle || meta.editorial || 'Explore BakhoorBliss luxury fragrances and artisanal perfumes.'} />
      <meta property="og:url" content={`https://bakhoorbliss.in/collections/${slug}`} />
      <meta property="og:type" content="website" />
      {meta.bannerImage && <meta property="og:image" content={meta.bannerImage} />}
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#d6a13d] selection:text-black">
        {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(!isCartOpen)}
        onOpenMenu={() => setIsMenuOpen(!isMenuOpen)}
        isCartOpen={isCartOpen}
        isMenuOpen={isMenuOpen}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthModalOpen(true);
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => {
          const query = (q || searchQuery).trim();
          if (query) router.replace(`/collections/all?q=${encodeURIComponent(query)}`);
        }}
      />

      {/* 3. Hero Visual Lifestyle Banner (Mobile 16:9 & Expanded Desktop Height) */}
      {Boolean(meta.bannerImage && meta.bannerImage.trim()) && (
        <section className="relative w-full aspect-[16/9] md:aspect-auto md:h-[520px] lg:h-[600px] xl:h-[680px] overflow-hidden bg-slate-100 select-none">
          <Image
            src={meta.bannerImage}
            alt={meta.title}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-center"
          />
        </section>
      )}

      {/* 4. Collection Title & Centered Editorial Story (Light Luxury Surface) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-5 sm:pt-10 sm:pb-6 text-center space-y-2.5 sm:space-y-3">
        {meta.badge && (
          <span className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#caa04c] uppercase">
            {meta.badge}
          </span>
        )}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-normal text-slate-900 tracking-tight">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-[11px] sm:text-sm text-slate-500 font-medium max-w-2xl mx-auto italic">
            {meta.subtitle}
          </p>
        )}
        {meta.editorial && !isAllCollection && (
          <p className="text-[11.5px] sm:text-sm font-sans text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal pt-1">
            {meta.editorial}
          </p>
        )}
      </div>

      {/* 5. Clean Toolbar: Sort & Count (Sticky under Navbar on Scroll) */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 mb-5 sm:mb-6 shadow-2xs transition-all">
        <div className="max-w-[1680px] mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4 text-xs font-sans">
          <span className="text-slate-500 font-medium text-[11.5px] sm:text-xs">
            Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'Fragrance' : 'Fragrances'}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Sort By:</span>
            <LuxurySelect
              id="sort-select"
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              position="bottom"
              align="right"
              options={[
                { value: 'bestseller', label: 'Featured / Bestseller' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' }
              ]}
              triggerClassName="py-1.5 px-3 text-[11.5px] sm:text-xs font-semibold rounded-lg border-slate-200"
              contentClassName="min-w-[180px]"
            />
          </div>
        </div>
      </div>

      {/* 6. Product Grid (2 Columns on Mobile, 3 Columns on Tablet/Desktop) */}
      <main className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : filteredProducts.length === 0 ? (
          <div className="pt-2 pb-10 sm:pt-4 sm:pb-14 px-6 text-center max-w-lg mx-auto space-y-3">
            <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 mx-auto flex items-center justify-center">
              <img
                src="/assets/empty-fragrance.avif"
                alt="No fragrance found"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain mix-blend-multiply opacity-95"
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                {searchQuery ? `No Fragrances Matching "${searchQuery}"` : 'No Fragrances Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try searching with different keywords or clear your search.'
                  : 'No products available in this selection.'}
              </p>
            </div>

            {searchQuery && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard
                  product={product}
                  onAddToCart={(p, size, price) => addToCart(p, size, price)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 7. Shop by Collection (only collections that hold live products) */}
      {crossCollectionsList.length > 0 && (
        <section className="bg-[#fafafa] py-12 sm:py-16 border-t border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-slate-900 text-center mb-8 sm:mb-10">
              Shop by Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {crossCollectionsList.map((col) => (
                <Link
                  key={col.id}
                  href={col.href}
                  className="group block bg-white border border-slate-200/80 rounded-md overflow-hidden transition-colors hover:border-[#d6a750]"
                >
                  {col.image && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <Image
                        src={col.image}
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className={`px-5 text-center ${col.image ? 'py-5' : 'py-10 sm:py-12'}`}>
                    {col.badge && (
                      <span className="block text-[10px] font-sans font-bold text-[#b69254] tracking-[0.2em] uppercase mb-1.5">
                        {col.badge}
                      </span>
                    )}
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-slate-900">
                      {col.title}
                    </h3>
                    <span className="mt-2 inline-block text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-slate-500 group-hover:text-[#b88f3e] transition-colors">
                      Shop All
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Gold Trust Banner */}
      <GoldTrustBanner />

      {/* 9. Footer */}
      <Footer />

      {/* 10. Global Modals & Slide-out Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onOpenAuth={(selectedMode) => {
          setAuthMode(selectedMode || 'signin');
          setIsAuthModalOpen(true);
        }}
      />

      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(selectedMode) => {
          setAuthMode(selectedMode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <AccountDashboard
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onAddToCart={addToCart}
      />
    </div>
    </>
  );
}
