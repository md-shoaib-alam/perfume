'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import { useConfirm } from '../../components/CustomConfirmModal';
import { getProductSlug, slugify } from '../../utils/slug';
import { addRecentlyViewed } from '../../utils/recentlyViewed';
import type { Product, Review } from '../../types';
import { resolveProductSizeOptions, resolveProductUnitPrice } from '@/lib/pricing';

import { useProductsQuery, useProductQuery, useReviewsQuery, queryKeys } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function ProductDetailPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';
  const productId = decodeURIComponent(rawId);
  const { showAlert } = useConfirm();

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

  // TanStack Queries (Cached with 0ms redundant DB hits)
  const { data: allProducts = [] } = useProductsQuery();
  const { data: queryProduct, isLoading: isProductLoading } = useProductQuery(productId);
  
  // Resolve product from query or fallback catalog search
  const product = useMemo(() => {
    if (queryProduct) return queryProduct;
    if (!productId || allProducts.length === 0) return null;
    const normalizedParam = slugify(productId);
    return (
      allProducts.find(
        (p) =>
          p.id === productId ||
          slugify(p.name) === normalizedParam ||
          slugify(p.name) === slugify(productId)
      ) || null
    );
  }, [queryProduct, productId, allProducts]);

  const { data: fetchedReviews = [] } = useReviewsQuery(product?.name || '');
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const reviews = useMemo(() => [...localReviews, ...fetchedReviews], [localReviews, fetchedReviews]);

  const loading = isProductLoading && !product;
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('100ml');

  // Review Form State
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Global Shell States
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Reset scroll to top on navigation to product
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [productId]);

  // Sync selected image and recently viewed when product is ready
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      const sizeOpts = resolveProductSizeOptions(product);
      const defaultSize = sizeOpts.length > 0 ? sizeOpts[0].size : product.volume || '100ml';
      setSelectedSize(defaultSize);

      // Record into recently viewed local storage
      addRecentlyViewed(product);

      // Update browser tab title
      document.title = `${product.name} – BakhoorBliss`;
    }
  }, [product]);

  const sizeOptions = useMemo(() => {
    return product ? resolveProductSizeOptions(product) : [];
  }, [product]);

  // Derived price & size option
  const currentOption = useMemo(() => {
    if (!product) return null;
    const match = sizeOptions.find((opt) => opt.size === selectedSize);
    if (match) return match;
    return {
      size: selectedSize || product.volume || '100ml',
      price: resolveProductUnitPrice(product, selectedSize),
      originalPrice: product.originalPrice || product.price,
      isSoldOut: false
    };
  }, [product, sizeOptions, selectedSize]);

  const currentPrice = currentOption?.price ?? product?.price ?? 0;
  const originalPrice = currentOption?.originalPrice ?? product?.originalPrice ?? 0;
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  // Recommended Products (Complementary or same category/gender)
  const recommendedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];
    return allProducts
      .filter((p) => p.id !== product.id)
      .sort((a, b) => {
        // Prioritize same category or same gender
        const aScore = (a.category === product.category ? 2 : 0) + (a.gender === product.gender ? 1 : 0);
        const bScore = (b.category === product.category ? 2 : 0) + (b.gender === product.gender ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [product, allProducts]);

  const imagesList = useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();
    if (product.image) set.add(product.image);
    if (product.hoverImage) set.add(product.hoverImage);
    if (Array.isArray(product.storyBlocks)) {
      product.storyBlocks.forEach((b) => {
        if (b.image) set.add(b.image);
      });
    }
    return Array.from(set);
  }, [product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newAuthor.trim() || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const created = await api.createReview({
        productName: product.name,
        author: newAuthor.trim(),
        title: newTitle.trim() || 'Verified Experience',
        comment: newComment.trim(),
        rating: newRating,
        verified: true,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      setLocalReviews((prev) => [created, ...prev]);
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(product.name) });
      setIsWritingReview(false);
      setNewTitle('');
      setNewComment('');
      setNewAuthor('');
      setNewRating(5);

      await showAlert({
        title: 'Review Submitted',
        message: 'Thank you for sharing your olfactory journey! Your verified review has been published.',
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: 'Submission Error',
        message: `Could not save review: ${err.message || 'Please try again later'}`,
        variant: 'danger'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
        <AnnouncementBar />
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
        <div className="py-32 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-[#d6a750] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-sans text-sm">Loading fragrance details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
        <AnnouncementBar />
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
        <div className="py-24 max-w-lg mx-auto text-center px-4 space-y-4">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900">Fragrance Not Found</h2>
          <p className="text-sm text-slate-500">
            The requested extrait formulation or collection item could not be found.
          </p>
          <Link
            href="/collections/all"
            className="inline-block px-8 py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Explore All Fragrances
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <title>{product ? `${product.name} – BakhoorBliss` : 'BakhoorBliss | Luxury Fragrance'}</title>
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#d6a13d] selection:text-black">
        {/* 1. Header & Navigation */}
        <AnnouncementBar />
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

      {/* 2. Main Product Section */}
      <main className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Product Gallery: Vertical Left Thumbnail Rail on Desktop, Main Image on Right */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 items-start">
            {/* Desktop Vertical Thumbnails / Mobile Horizontal Rail */}
            {imagesList.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto w-full md:w-20 md:shrink-0 md:max-h-[580px] pb-2 md:pb-0 scrollbar-thin">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-slate-50 ${
                      (selectedImage || product.image) === img
                        ? 'border-[#c59b48] shadow-sm ring-1 ring-[#c59b48]'
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Image Display */}
            <div className="relative aspect-square w-full flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {discountPercent}% OFF
                </div>
              )}

              {product.isBestseller && (
                <div className="absolute top-4 right-4 bg-[#c59b48] text-white font-sans text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Bestseller
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details & Purchase Controls (6-7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#caa04c]">
                  {product.category === 'extrait-de-parfum' ? 'Extrait De Parfum' : product.category}
                </span>
                {product.gender && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {product.gender}
                  </span>
                )}
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-sm text-slate-500 font-sans mt-2 leading-relaxed">
                {product.subtitle}
              </p>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-[#caa04c]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {product.rating || '4.9'}
                </span>
                <span className="text-xs text-slate-400">
                  ({reviews.length > 0 ? reviews.length : (product.reviewsCount || 128)} verified reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-4">
              <span className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Rs.{currentPrice.toLocaleString('en-IN')}.00
              </span>
              {originalPrice > currentPrice && (
                <span className="font-sans text-sm text-slate-400 line-through">
                  Rs.{originalPrice.toLocaleString('en-IN')}.00
                </span>
              )}
              <span className="text-xs text-slate-500 ml-auto font-sans">
                Inclusive of all taxes & duties
              </span>
            </div>

            {/* Size Selector Pills */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Bottle Size:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizeOptions.map((opt) => (
                    <button
                      key={opt.size}
                      type="button"
                      onClick={() => setSelectedSize(opt.size)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        selectedSize === opt.size
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {opt.size} {opt.price ? `— Rs.${opt.price.toLocaleString('en-IN')}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Counter & Add to Bag */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-white px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-black font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-black font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={() => addToCart(product, selectedSize, currentPrice, quantity)}
                  className="flex-1 py-3.5 bg-[#c59b48] hover:bg-[#b58b38] active:bg-[#a57b28] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>ADD TO BAG</span>
                </button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center gap-2.5">
                <svg className="w-5 h-5 text-[#caa04c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-slate-800 leading-tight">10+ Hours Lingering</span>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center gap-2.5">
                <svg className="w-5 h-5 text-[#caa04c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-slate-800 leading-tight">7 Days Returns</span>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center gap-2.5">
                <svg className="w-5 h-5 text-[#caa04c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-4 0a1 1 0 01-1-1m-1 0a1 1 0 00-1 1" />
                </svg>
                <span className="font-semibold text-slate-800 leading-tight">Complimentary Sample</span>
              </div>
            </div>

            {/* Olfactory Pyramid (Fragrance Notes) - Light Luxury Theme */}
            {product.notes && (
              <div className="p-5 sm:p-6 bg-[#faf9f6] text-slate-900 rounded-2xl border border-amber-200/50 space-y-4 shadow-2xs">
                <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d6a750]" />
                  <span>Olfactory Notes Pyramid</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  {product.notes.top && product.notes.top.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
                        Top Notes (Immediate Projection)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.notes.top.map((n, i) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-full text-slate-800 border border-slate-200/80 shadow-2xs font-sans text-xs font-medium">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.notes.heart && product.notes.heart.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#b88f3e] font-bold block mb-1.5">
                        Heart Notes (Signature Character)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.notes.heart.map((n, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-50/80 text-[#916618] rounded-full border border-amber-200/70 shadow-2xs font-sans text-xs font-semibold">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.notes.base && product.notes.base.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
                        Base Notes (10+ Hours Longevity)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.notes.base.map((n, i) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-full text-slate-800 border border-slate-200/80 shadow-2xs font-sans text-xs font-medium">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description Text */}
            {product.description && (
              <div className="space-y-2 pt-2 text-xs text-slate-600 leading-relaxed">
                <h4 className="font-sans text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">About this Formulation</h4>
                <p>{product.description}</p>
              </div>
            )}

          </div>

        </div>

        {/* 3.5 Visual Storytelling & Craftsmanship Details (Full-Width Cinematic Showcase) */}
        {product.storyBlocks && product.storyBlocks.length > 0 && (
          <section className="my-16 sm:my-24 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-hidden space-y-16 sm:space-y-24">
            {product.storyBlocks.map((block, idx) => (
              <div key={idx} className="w-full space-y-8">
                {/* Full-Bleed Cinematic Showcase Banner (Hero Showcase Style) */}
                <div className="w-full relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.35/1] max-h-[85vh] sm:max-h-[640px] overflow-hidden bg-[#faf9f6]">
                  <img
                    src={block.image}
                    alt={block.title || product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Centered Editorial Subtitle, Title & Story Narrative */}
                {(block.title || block.subtitle || block.description) && (
                  <div className="text-center space-y-2.5 px-4 max-w-3xl mx-auto">
                    {block.subtitle && (
                      <span className="text-[11px] uppercase tracking-[0.25em] text-[#b88f3e] font-bold block">
                        {block.subtitle}
                      </span>
                    )}
                    {block.title && (
                      <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                        {block.title}
                      </h3>
                    )}
                    {block.description && (
                      <p className="text-xs sm:text-sm font-sans text-slate-600 leading-relaxed font-normal pt-1">
                        {block.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* 4. Trust Banner Bar */}
        <div className="my-14">
          <GoldTrustBanner />
        </div>

        {/* 5. Recommended Fragrances / You May Also Like */}
        {recommendedProducts.length > 0 && (
          <section className="my-16">
            <div className="text-center mb-8 font-sans">
              <span className="text-xs uppercase tracking-widest text-[#caa04c] font-bold block mb-1">
                Curated Recommendations
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                You May Also Admire
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((rec) => (
                <div key={rec.id} className="h-full">
                  <ProductCard
                    product={rec}
                    onAddToCart={(p, size, price) => addToCart(p, size, price)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Customer Reviews Section */}
        <section className="my-16 pt-10 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-slate-900">
                Customer Impressions & Reviews
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real feedback from connoisseurs of {product.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isWritingReview ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Write a Review Form */}
          {isWritingReview && (
            <form onSubmit={handleReviewSubmit} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-2xl mx-auto mb-10 space-y-4 text-xs animate-fade-in-up">
              <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900">Share Your Fragrance Experience</h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer text-[#caa04c]"
                    >
                      <svg className={`w-6 h-6 ${star <= newRating ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="font-bold text-slate-800 ml-2">{newRating} Stars</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Rohail Khan"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headline / Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Unbelievable sillage and longevity"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Detailed Review</label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Describe the projection, compliment factor, and notes on your skin..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3 bg-[#c59b48] hover:bg-[#b58b38] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting Review...' : 'Publish Verified Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <p>Be the first connoisseur to review <span className="font-bold text-slate-800">{product.name}</span>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#caa04c]">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans">{rev.date}</span>
                  </div>

                  <h4 className="font-sans font-bold text-slate-900 text-sm">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{rev.comment}</p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-semibold text-slate-800">{rev.author}</span>
                    {rev.verified && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* 7. Footer */}
      <Footer />

      {/* 8. Global Modals & Slide-out Drawers */}
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
