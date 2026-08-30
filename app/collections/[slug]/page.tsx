'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnnouncementBar } from '../../components/AnnouncementBar';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { GoldTrustBanner } from '../../components/GoldTrustBanner';

const CartDrawer = dynamic(() => import('../../components/CartDrawer').then((m) => m.CartDrawer), { ssr: false });
const MenuDrawer = dynamic(() => import('../../components/MenuDrawer').then((m) => m.MenuDrawer), { ssr: false });
const AuthModal = dynamic(() => import('../../auth/AuthModal').then((m) => m.AuthModal), { ssr: false });
const AccountDashboard = dynamic(() => import('../../components/AccountDashboard').then((m) => m.AccountDashboard), { ssr: false });

import { api } from '../../services/api';
import { useCart } from '../../hooks/useCart';
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
    subtitle: 'Ultra-concentrated 30%+ pure oil perfume formulations guaranteeing 10+ hours of lingering sillage.',
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

const CROSS_COLLECTIONS = [
  {
    id: 'haute',
    title: 'Haute Collection',
    badge: 'HAUTE COLLECTION',
    description: 'The crowning achievement in artisan perfumery. Created in collaboration with legendary Master Perfumers, featuring rare aged natural agarwood, Taif rose, and bourbon vanilla.',
    image: '',
    href: '/collections/haute'
  },
  {
    id: 'bureau',
    title: 'Bureau Collection',
    badge: 'BUREAU COLLECTION',
    description: 'The Bureau Collection presents a range of therapeutic office perfumes suited for boardroom meetings, everyday focus, and versatile elegance with crisp aromatic accords.',
    image: '',
    href: '/collections/bureau'
  },
  {
    id: 'miss_neesh',
    title: 'Miss Neesh Collection',
    badge: 'MISS NEESH COLLECTION',
    description: 'Pure femininity meets modern luxury. Radiant floral bouquets, luscious nectar notes, and shimmering musks tailored for effortless daily poise.',
    image: '',
    href: '/collections/miss_neesh'
  }
];

import { useProductsQuery, useCollectionsQuery } from '../../hooks/useQueries';

export default function CollectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSlug = (params?.slug as string) || 'all';
  const slug = rawSlug.toLowerCase();
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

    return {
      ...defaultMeta,
      title: dbMatch?.name || defaultMeta.title,
      subtitle: dbMatch?.subtitle || defaultMeta.subtitle,
      editorial: dbMatch?.editorial || defaultMeta.editorial,
      bannerImage: dbMatch?.bannerImage || defaultMeta.bannerImage,
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
    if (dbCollections.length > 0) {
      const others = dbCollections.filter(
        (c) => (c.slug || c.id) !== slug && c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') !== slug
      );
      if (others.length > 0) {
        return others.slice(0, 3).map((c) => {
          const matchingProduct = productsList.find(
            (p) => p.collection === c.id || p.collection === c.name || p.category === c.slug
          );
          return {
            id: c.slug || c.id,
            title: c.name,
            badge: c.badge || `${c.name.toUpperCase()} COLLECTION`,
            description: c.editorial || c.subtitle || '',
            image: c.bannerImage || c.image || matchingProduct?.image || '',
            href: `/collections/${c.slug || c.id}`
          };
        });
      }
    }
    return CROSS_COLLECTIONS.filter((c) => c.id !== slug).map((c) => {
      const matchingProduct = productsList.find((p) => p.collection === c.id || p.category === c.id);
      return {
        ...c,
        image: c.image || matchingProduct?.image || ''
      };
    });
  }, [dbCollections, slug, productsList]);

  return (
    <>
      <title>{`${meta.title} – BakhoorBliss`}</title>
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

      {/* 3. Hero Visual Lifestyle Banner (Only when bannerImage is configured) */}
      {Boolean(meta.bannerImage && meta.bannerImage.trim()) && (
        <div className="relative w-full min-h-[380px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[660px] max-h-[740px] overflow-hidden bg-slate-100">
          <img
            src={meta.bannerImage}
            alt={meta.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* 4. Collection Title & Centered Editorial Story */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-center space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 tracking-wide">
          {meta.title}
        </h1>
        <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
          {meta.editorial}
        </p>
      </div>

      {/* 5. Clean Toolbar: Sort & Count */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 mb-6">
        <div className="flex items-center justify-between gap-4 text-xs font-sans">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'Fragrance' : 'Fragrances'}
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-slate-500 font-semibold">Sort By:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d6a750] cursor-pointer shadow-2xs"
            >
              <option value="bestseller">Featured / Bestseller</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Product Grid (3 Columns on Desktop - Screenshot Match) */}
      <main className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="py-24 text-center text-slate-400 font-sans text-xs">
            <div className="inline-block w-8 h-8 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif text-sm">Presenting curated collection from Appwrite...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 sm:py-16 px-6 text-center max-w-lg mx-auto space-y-3 my-2">
            <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 mx-auto flex items-center justify-center">
              <img
                src="/empty-fragrance.jpg"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
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

      {/* 7. Alternating Cross-Collection Showcase Banners (Zig-Zag Rows - Screenshot Match) */}
      <section className="bg-[#fafafa] py-16 border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {crossCollectionsList.map((col, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={col.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Image Col (Left on Even, Right on Odd) - Clean Luxury Photography Without Text Overlay */}
                <div className={`md:col-span-6 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                  <Link href={col.href} className="group relative block aspect-[16/9] md:aspect-[4/3] rounded-md overflow-hidden bg-slate-100 shadow-md">
                    {col.image ? (
                      <img
                        src={col.image}
                        alt={col.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50/80 via-slate-50 to-slate-100 flex flex-col items-center justify-center text-center p-6 border border-amber-200/50">
                        <span className="font-serif text-2xl sm:text-3xl text-slate-800 font-bold mb-2">{col.title}</span>
                        <span className="text-xs text-[#b88f3e] tracking-widest uppercase font-semibold">House of BakhoorBliss</span>
                      </div>
                    )}
                  </Link>
                </div>

                {/* Text Content Col */}
                <div className={`md:col-span-6 space-y-4 ${isEven ? 'md:order-2 md:pl-6' : 'md:order-1 md:pr-6'}`}>
                  {col.badge && (
                    <span className="text-[11px] font-sans font-bold text-[#b69254] tracking-[0.2em] uppercase block">
                      {col.badge}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-slate-900">
                    {col.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    {col.description}
                  </p>
                  <div>
                    <Link
                      href={col.href}
                      className="inline-block px-7 py-2.5 bg-[#222222] hover:bg-black text-white font-sans font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-xs"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
