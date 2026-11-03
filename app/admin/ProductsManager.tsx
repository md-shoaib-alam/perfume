'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '../types';
import { ProductEditor } from './ProductEditor';
import { api } from '../services/api';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { useConfirm } from '../components/CustomConfirmModal';
import { getProductSlug } from '../utils/slug';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useCollectionsQuery } from '../hooks/useQueries';
import { STANDARD_LANDING_PAGES, COLLECTION_LANDING_SLUGS } from './collections/types';
import { ProductsRouteProvider } from './products/productsRoute';

export const ProductsManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: reactiveCollections = [] } = useCollectionsQuery();
  const { showConfirm, showAlert } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [actionMenu, setActionMenu] = useState<{
    id: string;
    product: Product;
    top: number;
    right: number;
  } | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setActionMenu(null);
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('scroll', handleCloseMenu, true);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('scroll', handleCloseMenu, true);
    };
  }, []);

  const handleToggleActionMenu = (e: React.MouseEvent<HTMLButtonElement>, prod: Product) => {
    e.stopPropagation();
    if (actionMenu?.id === prod.id) {
      setActionMenu(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setActionMenu({
        id: prod.id,
        product: prod,
        top: rect.bottom + 6,
        right: Math.max(16, window.innerWidth - rect.right)
      });
    }
  };
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    subtitle: 'Extrait De Parfum',
    gender: 'For Him',
    collection: 'haute',
    price: 3600,
    originalPrice: 4200,
    volume: '100ml',
    image: '',
    hoverImage: '',
    showcaseImages: [],
    description: '',
    notes: { top: [], heart: [], base: [] },
    isBestseller: false,
    isNew: false,
    isPreOrder: false,
    isComingSoon: false,
    stock: 100,
    sizeOptions: [
      { size: '15ml', price: 1900, isSoldOut: false },
      { size: '50ml', price: 2900, isSoldOut: false },
      { size: '100ml', price: 3600, isSoldOut: false }
    ],
    storyBlocks: []
  });

  const loadData = async (isInitial = false) => {
    if (isInitial || products.length === 0) {
      setLoading(true);
    }
    try {
      const [prodsData, colsData] = await Promise.all([
        api.getProducts(undefined, undefined, { fresh: true }),
        api.getCollections().catch(() => [])
      ]);
      setProducts(prodsData || []);
      setCollections(colsData || []);
      queryClient.invalidateQueries({ queryKey: queryKeys.allProducts });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    } catch (err: any) {
      console.error('Failed to load products/collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Built-in collection pages merged with the Appwrite collections table
  const activeCollections = (collections && collections.length > 0) ? collections : reactiveCollections;

  const collectionOptions = useMemo(() => {
    // Mirror the admin Collections tab: collection-type landing pages (Extrait De Parfum,
    // Imperial Attars) plus custom story collections. Gender/category pages (For Him,
    // For Her, Unisex, Gift Sets, Discovery Sets) stay out — they are driven by the
    // product's gender/category, not by the collection field. Shop All is not assignable.
    const collectionPageSlugs = COLLECTION_LANDING_SLUGS.filter(
      (slug) => slug !== 'all' && slug !== 'shop-all'
    );

    const landingOptions = collectionPageSlugs.map((slug) => {
      const preset = STANDARD_LANDING_PAGES.find((page) => page.slug === slug);
      const dbMatch = (activeCollections || []).find((c: any) => c.slug === slug);
      const dbName = (dbMatch?.name || '').replace(/\s+/g, ' ').trim();
      return { slug, name: dbName || preset?.name || slug };
    });

    const presetSlugs = new Set(
      STANDARD_LANDING_PAGES.map((page) => page.slug).filter(Boolean)
    );

    const customOptions = (activeCollections || [])
      .map((c: any) => {
        const name = (c.name || '').replace(/\s+/g, ' ').trim();
        const subname = (c.subname || '').replace(/\s+/g, ' ').trim();
        const label =
          name.toLowerCase().includes('collection') || subname.toLowerCase().includes('collection')
            ? (subname ? `${name} ${subname}` : name)
            : `${name} ${subname || 'Collection'}`.trim();
        const slug = (
          c.slug ||
          name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
          c.id ||
          ''
        ).trim();
        return {
          slug: slug,
          name: label || slug || 'Unnamed Collection'
        };
      })
      .filter((c: any) => Boolean(c.slug && c.name))
      .filter((c: any) => !presetSlugs.has(c.slug));

    return [...landingOptions, ...customOptions];
  }, [activeCollections]);

  const handleCollectionCreated = (created: { id: string; slug: string; name: string }) => {
    setCollections((prev) =>
      prev.some((c) => c.slug === created.slug || (created.id && c.id === created.id))
        ? prev
        : [created, ...prev]
    );
    queryClient.invalidateQueries({ queryKey: queryKeys.collections });
  };

  const getCollectionName = (colSlug?: string) => {
    if (!colSlug) return 'Standalone';
    const match = collectionOptions.find(
      (c) => c.slug === colSlug || c.slug === colSlug.replace('-collection', '')
    );
    return match ? match.name : colSlug.replace(/[-_]/g, ' ');
  };

  useEffect(() => {
    loadData();
  }, []);

  // Route-driven editor: /admin/products/new and /admin/products/edit/<slug> pages
  // call these actions; the layout keeps this component mounted so there is no remount flicker.
  const [pendingEditParam, setPendingEditParam] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      name: '',
      subtitle: '',
      gender: 'For Him',
      collection: '',
      price: 3600,
      originalPrice: 4200,
      volume: '100ml',
      image: '',
      hoverImage: '',
      showcaseImages: [],
      description: '',
      notes: { top: [], heart: [], base: [] },
      isBestseller: false,
      isNew: false,
      isPreOrder: false,
      isComingSoon: false,
      stock: 100,
      sizeOptions: [
        { size: '15ml', price: 1900, isSoldOut: false },
        { size: '50ml', price: 2900, isSoldOut: false },
        { size: '100ml', price: 3600, isSoldOut: false }
      ],
      storyBlocks: []
    });
    setIsModalOpen(true);
  }, []);

  const openEditByParam = useCallback((param: string) => {
    setPendingEditParam(param);
  }, []);

  const closeEditor = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  // Same-name products would share a slug, so duplicates get a stable numeric suffix
  // (ordered by id to stay deterministic regardless of list order)
  const getEditorSlug = useCallback((product: Product, list: Product[]) => {
    const base = getProductSlug(product);
    const duplicates = list
      .filter((p) => getProductSlug(p) === base)
      .sort((a, b) => a.id.localeCompare(b.id));
    if (duplicates.length <= 1) return base;
    const idx = duplicates.findIndex((p) => p.id === product.id);
    return idx <= 0 ? base : `${base}-${idx + 1}`;
  }, []);

  useEffect(() => {
    if (!loading && pendingEditParam) {
      const prod = products.find(
        (p) => getEditorSlug(p, products) === pendingEditParam || p.id === pendingEditParam
      );
      setPendingEditParam(null);
      if (prod) {
        handleOpenEdit(prod);
      } else {
        router.replace('/admin/products');
        showAlert({
          title: 'Fragrance Not Found',
          message: 'This fragrance could not be found. It may have been deleted from the catalog.',
          variant: 'warning'
        });
      }
    }
  }, [loading, pendingEditParam, products]);

  const handleOpenAdd = () => {
    router.push('/admin/products/new');
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      gender: product.gender || 'For Him',
      collection: product.collection || '',
      sizeOptions: product.sizeOptions && product.sizeOptions.length > 0 
        ? product.sizeOptions 
        : [
            { size: '15ml', price: 1900, isSoldOut: false },
            { size: '50ml', price: Math.round(product.price * 0.58), isSoldOut: false },
            { size: '100ml', price: product.price, isSoldOut: false }
          ],
      storyBlocks: product.storyBlocks || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Perfume',
      message: 'Are you sure you want to remove this perfume from catalog? All associated image assets will be deleted from storage.',
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;

    const productToDelete = products.find(p => p.id === id);
    const previousProducts = [...products];

    // 1. In-place instant removal from table
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await api.deleteProduct(id);
      
      // Clean up orphaned images from Appwrite Storage to prevent wasted storage resources
      if (productToDelete) {
        if (productToDelete.image) deleteMediaFromAppwrite(productToDelete.image).catch(() => {});
        if (productToDelete.hoverImage) deleteMediaFromAppwrite(productToDelete.hoverImage).catch(() => {});
        if (productToDelete.showcaseImages) {
          productToDelete.showcaseImages.forEach(url => {
            deleteMediaFromAppwrite(url).catch(() => {});
          });
        }
        if (productToDelete.storyBlocks) {
          productToDelete.storyBlocks.forEach(b => {
            if (b.image) deleteMediaFromAppwrite(b.image).catch(() => {});
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.allProducts });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    } catch (err: any) {
      // Revert if failed
      setProducts(previousProducts);
      await showAlert({
        title: 'Error Deleting Product',
        message: `Failed to delete product: ${err.message}`,
        variant: 'danger'
      });
    }
  };



  const filteredProducts = products.filter((p) => {
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesCollection = collectionFilter === 'all' || p.collection === collectionFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
                          (p.collection && p.collection.toLowerCase().includes(search.toLowerCase()));
    return matchesGender && matchesCollection && matchesSearch;
  });

  return (
    <ProductsRouteProvider value={{ openAdd, openEditByParam, closeEditor }}>
      <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fragrance Catalog Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure fragrance collections, multi-volume pricing, and inventory.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Fragrance</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search perfumes by name or accords..."
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
        />

        {/* Collection Filter */}
        <select
          value={collectionFilter}
          onChange={(e) => setCollectionFilter(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750]"
        >
          <option value="all">All Collections</option>
          {collectionOptions.map((col) => (
            <option key={col.slug} value={col.slug}>
              {col.name}
            </option>
          ))}
        </select>

        {/* Gender / Audience Filter */}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750]"
        >
          <option value="all">All Targets (Him / Her / Gifts)</option>
          <option value="For Him">For Him (Men)</option>
          <option value="For Her">For Her (Women)</option>
          <option value="Unisex">Unisex</option>
          <option value="Gift Sets">Gift Sets</option>
        </select>

      </div>

      {/* Mobile Products Cards List (< md) */}
      <div className="md:hidden space-y-3.5">
        {loading ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            Loading catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            No products found for this filter.
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5"
            >
              {/* Top Row: Thumbnail + Details + Gender */}
              <div className="flex items-start gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {prod.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                      prod.gender === 'For Her'
                        ? 'bg-pink-100 text-pink-800'
                        : prod.gender === 'Gift Sets'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {prod.gender || 'For Him'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {prod.collection && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-[#916618] border border-amber-200/80 rounded text-[9px] font-bold uppercase tracking-wider">
                        {getCollectionName(prod.collection)}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500 truncate">{prod.subtitle}</p>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {prod.isBestseller && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                        BESTSELLER
                      </span>
                    )}
                    {prod.isPreOrder && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                        PRE-ORDER
                      </span>
                    )}
                    {prod.isComingSoon && (
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded">
                        COMING SOON
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Row: Volume Options & Prices */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Available Sizes & Pricing
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prod.sizeOptions && prod.sizeOptions.length > 0 ? (
                    prod.sizeOptions.map((opt, i) => (
                      <span key={i} className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                        opt.isSoldOut 
                          ? 'bg-red-50 text-red-700 border-red-200 line-through'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}>
                        {opt.size}: ₹{opt.price.toLocaleString('en-IN')}
                      </span>
                    ))
                  ) : (
                    <span className="font-bold text-slate-900 text-xs">₹{prod.price.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <Link
                  href={`/products/${getProductSlug(prod)}`}
                  target="_blank"
                  className="text-xs font-semibold text-[#caa04c] hover:text-[#b88f3e] inline-flex items-center gap-1"
                >
                  <span>View on Store</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>

                <button
                  type="button"
                  onClick={(e) => handleToggleActionMenu(e, prod)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                  title="Actions"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Products Table (hidden on mobile, visible on >= md) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-4 py-3.5">Collection</th>
                <th className="px-4 py-3.5">Gender / Target</th>
                <th className="px-4 py-3.5">Volume Options & Prices</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Loading catalog...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No products found for this filter.</td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          className="w-11 h-11 object-cover rounded border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate max-w-xs">{prod.name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{prod.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-[#916618] border border-amber-200/80 capitalize">
                        {getCollectionName(prod.collection)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        prod.gender === 'For Her'
                          ? 'bg-pink-100 text-pink-800'
                          : prod.gender === 'Gift Sets'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {prod.gender || 'For Him'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {prod.sizeOptions && prod.sizeOptions.length > 0 ? (
                          prod.sizeOptions.map((opt, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${
                              opt.isSoldOut 
                                ? 'bg-red-50 text-red-700 border-red-200 line-through'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}>
                              {opt.size}: ₹{opt.price.toLocaleString('en-IN')}
                            </span>
                          ))
                        ) : (
                          <span className="font-bold text-slate-900">₹{prod.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {prod.isBestseller && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            BESTSELLER
                          </span>
                        )}
                        {prod.isPreOrder && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            PRE-ORDER
                          </span>
                        )}
                        {prod.isComingSoon && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">
                            COMING SOON
                          </span>
                        )}
                        {!prod.isBestseller && !prod.isPreOrder && !prod.isComingSoon && (
                          <span className="text-[11px] text-slate-400 font-medium">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onClick={(e) => handleToggleActionMenu(e, prod)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 inline-flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                        title="Actions"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full-Page Fragrance Editor */}
      {isModalOpen && (
        <ProductEditor
          editingProduct={editingProduct}
          initialData={formData}
          collectionOptions={collectionOptions}
          onClose={() => {
            closeEditor();
            router.replace('/admin/products');
          }}
          onSaveSuccess={loadData}
          onCollectionCreated={handleCollectionCreated}
        />
      )}

      {/* Floating Action Menu with fixed coordinates (prevent clipping by overflow-x-auto) */}
      {actionMenu && (
        <div
          style={{ top: actionMenu.top, right: actionMenu.right }}
          className="fixed w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const p = actionMenu.product;
              setActionMenu(null);
              router.push(`/admin/products/edit/${encodeURIComponent(getEditorSlug(p, products))}`);
            }}
            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Fragrance</span>
          </button>

          <Link
            href={`/products/${getProductSlug(actionMenu.product)}`}
            target="_blank"
            onClick={() => setActionMenu(null)}
            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-[#caa04c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View on Store</span>
          </Link>

          <div className="h-px bg-slate-100 my-1" />

          <button
            type="button"
            onClick={() => {
              const pid = actionMenu.product.id;
              setActionMenu(null);
              handleDelete(pid);
            }}
            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Fragrance</span>
          </button>
        </div>
      )}

      {/* Route-driven page slot (list/new/edit pages render null and signal via context) */}
      {children}
      </div>
    </ProductsRouteProvider>
  );
};
