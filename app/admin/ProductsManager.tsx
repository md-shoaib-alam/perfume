'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Product, ProductSizeOption } from '../types';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';
import { deleteMediaFromAppwrite } from '@/lib/appwrite';
import { getProductSlug } from '../utils/slug';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useCollectionsQuery } from '../hooks/useQueries';

export const ProductsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: reactiveCollections = [] } = useCollectionsQuery();
  const { showConfirm, showAlert } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
    category: 'extrait-de-parfum',
    gender: 'For Him',
    collection: 'haute',
    price: 3600,
    originalPrice: 4200,
    volume: '100ml',
    image: '',
    hoverImage: '',
    description: '',
    notes: { top: [], heart: [], base: [] },
    isBestseller: false,
    isNew: false,
    isPreOrder: false,
    stock: 100,
    sizeOptions: [
      { size: '15ml', price: 1900, isSoldOut: false },
      { size: '50ml', price: 2900, isSoldOut: false },
      { size: '100ml', price: 3600, isSoldOut: false }
    ],
    storyBlocks: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, colsData] = await Promise.all([
        api.getProducts(),
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

  // Derive collection options dynamically from Appwrite collections
  const activeCollections = (collections && collections.length > 0) ? collections : reactiveCollections;

  const collectionOptions = useMemo(() => {
    if (activeCollections && activeCollections.length > 0) {
      return activeCollections
        .map((c: any) => {
          const name = (c.name || '').trim();
          const subname = (c.subname || '').trim();
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
        .filter((c: any) => Boolean(c.slug && c.name));
    }
    return [];
  }, [activeCollections]);

  // Derive categories dynamically ONLY from database catalog products (no mock categories)
  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();

    (products || []).forEach((p) => {
      if (p.category && p.category.trim() && !map.has(p.category.trim())) {
        const catKey = p.category.trim();
        const formattedName = catKey
          .split(/[-_]/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        map.set(catKey, formattedName);
      }
    });

    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const formatCategoryName = (cat?: string) => {
    if (!cat) return 'Uncategorized';
    const match = availableCategories.find((c) => c.slug === cat);
    if (match) return match.name;
    return cat
      .split(/[-_]/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
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

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsCustomCategory(availableCategories.length === 0);
    setFormData({
      name: '',
      subtitle: '',
      category: availableCategories[0]?.slug || '',
      gender: 'For Him',
      collection: '',
      price: 3600,
      originalPrice: 4200,
      volume: '100ml',
      image: '',
      hoverImage: '',
      description: '',
      notes: { top: [], heart: [], base: [] },
      isBestseller: false,
      isNew: false,
      isPreOrder: false,
      stock: 100,
      sizeOptions: [
        { size: '15ml', price: 1900, isSoldOut: false },
        { size: '50ml', price: 2900, isSoldOut: false },
        { size: '100ml', price: 3600, isSoldOut: false }
      ],
      storyBlocks: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const inDbCategories = availableCategories.some((c) => c.slug === product.category);
    setIsCustomCategory(!inDbCategories || !product.category);
    setFormData({
      ...product,
      gender: product.gender || 'For Him',
      collection: product.collection || '',
      category: product.category || '',
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
    try {
      await api.deleteProduct(id);
      
      // Clean up orphaned images from Appwrite Storage to prevent wasted storage resources
      if (productToDelete) {
        if (productToDelete.image) deleteMediaFromAppwrite(productToDelete.image).catch(() => {});
        if (productToDelete.hoverImage) deleteMediaFromAppwrite(productToDelete.hoverImage).catch(() => {});
        if (productToDelete.storyBlocks) {
          productToDelete.storyBlocks.forEach(b => {
            if (b.image) deleteMediaFromAppwrite(b.image).catch(() => {});
          });
        }
      }

      await loadData();
    } catch (err: any) {
      await showAlert({
        title: 'Error Deleting Product',
        message: `Failed to delete product: ${err.message}`,
        variant: 'danger'
      });
    }
  };

  const handleAddSizeOption = () => {
    const current = formData.sizeOptions || [];
    setFormData({
      ...formData,
      sizeOptions: [
        ...current,
        { size: 'New Size', price: 2500, isSoldOut: false }
      ]
    });
  };

  const handleUpdateSizeOption = (idx: number, field: keyof ProductSizeOption, val: any) => {
    const current = [...(formData.sizeOptions || [])];
    current[idx] = { ...current[idx], [field]: val };
    
    // Auto-update base price if 100ml is changed
    let updatedPrice = formData.price;
    if (field === 'price' && current[idx].size === '100ml') {
      updatedPrice = Number(val);
    }

    setFormData({ ...formData, sizeOptions: current, price: updatedPrice });
  };

  const handleRemoveSizeOption = (idx: number) => {
    const current = (formData.sizeOptions || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, sizeOptions: current });
  };

  const handleAddStoryBlock = () => {
    const current = formData.storyBlocks || [];
    if (current.length >= 10) {
      showAlert({
        title: 'Maximum Limit Reached',
        message: 'You can upload up to 10 visual storytelling blocks per fragrance.',
        variant: 'warning'
      });
      return;
    }
    setFormData({
      ...formData,
      storyBlocks: [
        ...current,
        { image: '', title: '', description: '' }
      ]
    });
  };

  const handleUpdateStoryBlock = (idx: number, field: string, val: string) => {
    const current = [...(formData.storyBlocks || [])];
    current[idx] = { ...current[idx], [field]: val };
    setFormData({ ...formData, storyBlocks: current });
  };

  const handleRemoveStoryBlock = (idx: number) => {
    const current = (formData.storyBlocks || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, storyBlocks: current });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      await showAlert({
        title: 'Missing Required Fields',
        message: 'Please fill name and price',
        variant: 'warning'
      });
      return;
    }

    try {
      if (editingProduct) {
        // 1. Perform database persistence first
        await api.updateProduct(editingProduct.id, formData);

        // 2. Only after database persistence succeeds, clean up replaced or removed media from Appwrite Storage
        if (editingProduct.image && editingProduct.image !== formData.image) {
          deleteMediaFromAppwrite(editingProduct.image).catch(() => {});
        }
        if (editingProduct.hoverImage && editingProduct.hoverImage !== formData.hoverImage) {
          deleteMediaFromAppwrite(editingProduct.hoverImage).catch(() => {});
        }
        if (editingProduct.storyBlocks && editingProduct.storyBlocks.length > 0) {
          const newStoryImages = new Set(
            (formData.storyBlocks || []).map((b) => b.image).filter(Boolean)
          );
          editingProduct.storyBlocks.forEach((oldBlock) => {
            if (
              oldBlock.image &&
              !newStoryImages.has(oldBlock.image) &&
              oldBlock.image !== formData.image &&
              oldBlock.image !== formData.hoverImage
            ) {
              deleteMediaFromAppwrite(oldBlock.image).catch(() => {});
            }
          });
        }
      } else {
        await api.createProduct(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      await showAlert({
        title: 'Error Saving Product',
        message: `Failed to save product: ${err.message}`,
        variant: 'danger'
      });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesCollection = collectionFilter === 'all' || p.collection === collectionFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
                          (p.collection && p.collection.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesGender && matchesCollection && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fragrance Catalog Manager</h2>
          <p className="text-xs text-slate-500">Configure fragrance collections, gender targeting, multi-volume pricing, and inventory.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all shrink-0 cursor-pointer"
        >
          + Add New Fragrance
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750]"
        >
          <option value="all">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
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
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Gender / Target</th>
                <th className="px-4 py-3.5">Volume Options & Prices</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading catalog...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">No products found for this filter.</td>
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {formatCategoryName(prod.category)}
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
                        {!prod.isBestseller && !prod.isPreOrder && (
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {editingProduct ? `Edit Fragrance` : 'Add New Fragrance'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingProduct ? editingProduct.name : 'Create a new artisanal perfume listing in the store catalog'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editingProduct && (
                  <a
                    href={`/products/${editingProduct.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#c59b48]/10 hover:bg-[#c59b48]/20 text-[#916618] font-bold text-xs rounded-xl border border-[#c59b48]/30 flex items-center gap-1.5 transition-all shadow-2xs"
                    title="Preview live product page and hero scroll showcase"
                  >
                    <svg className="w-3.5 h-3.5 text-[#916618]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Preview Storefront UI</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Details: Fragrance Name, Collection, Category, Target Gender, Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fragrance Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Haute Vetiver"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Collection / Story Line</label>
                  {collectionOptions.length > 0 ? (
                    <select
                      value={formData.collection || ''}
                      onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">None / Standalone</option>
                      {collectionOptions.map((col) => (
                        <option key={col.slug} value={col.slug}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={formData.collection || ''}
                        onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                        placeholder="e.g. signature-line, attar-collection"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">No collection</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 whitespace-nowrap">
                      Product Category <span className="text-rose-500">*</span>
                    </label>
                    {availableCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) {
                            setFormData({ ...formData, category: '' });
                          } else {
                            setFormData({ ...formData, category: availableCategories[0]?.slug || '' });
                          }
                        }}
                        className="text-[10.5px] text-[#916618] hover:underline font-bold cursor-pointer whitespace-nowrap shrink-0 ml-1"
                      >
                        {isCustomCategory ? '← Choose Category' : '+ Custom Category'}
                      </button>
                    )}
                  </div>
                  {availableCategories.length === 0 || isCustomCategory ? (
                    <div>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Extrait De Parfum, Attar, Gift Set"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                        required
                      />
                      {availableCategories.length === 0 && (
                        <p className="text-[10px] text-slate-400 mt-1">No category</p>
                      )}
                    </div>
                  ) : (
                    <select
                      value={formData.category || availableCategories[0]?.slug || ''}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setFormData({ ...formData, category: '' });
                        } else {
                          setFormData({ ...formData, category: e.target.value as any });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="__custom__">+ Add New Custom Category...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Gender *</label>
                  <select
                    value={formData.gender || 'For Him'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="For Him">For Him (Men)</option>
                    <option value="For Her">For Her (Women)</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Gift Sets">Gift Sets</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Concentration / Notes Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Extrait De Parfum • Fresh, Earthy, Woody"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Volume Sizes & Pricing Matrix */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Volume Sizes & Pricing Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure bottle volumes (15ml, 50ml, 100ml), individual prices, and stock availability.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeOption}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Size Variant</span>
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  {formData.sizeOptions?.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-2 sm:flex sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
                      <div className="col-span-1 sm:w-28">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Volume Size</label>
                        <input
                          type="text"
                          value={opt.size}
                          onChange={(e) => handleUpdateSizeOption(idx, 'size', e.target.value)}
                          placeholder="e.g. 100ml"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                        />
                      </div>

                      <div className="col-span-1 sm:w-32">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => handleUpdateSizeOption(idx, 'price', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                        />
                      </div>

                      <div className="col-span-1 sm:w-32">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Original MRP (₹)</label>
                        <input
                          type="number"
                          value={opt.originalPrice || 0}
                          onChange={(e) => handleUpdateSizeOption(idx, 'originalPrice', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-between sm:pt-4 sm:ml-auto gap-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={opt.isSoldOut || false}
                            onChange={(e) => handleUpdateSizeOption(idx, 'isSoldOut', e.target.checked)}
                            className="w-4 h-4 accent-rose-600 rounded"
                          />
                          <span className={opt.isSoldOut ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {opt.isSoldOut ? 'Sold Out' : 'In Stock'}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveSizeOption(idx)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove size"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URLs & Media Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MediaUploader
                  label="Main Product Image *"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  helperText="Primary bottle photo displayed on store cards."
                />

                <MediaUploader
                  label="Hover Secondary Image"
                  value={formData.hoverImage || ''}
                  onChange={(url) => setFormData({ ...formData, hoverImage: url })}
                  helperText="Packaging / alternative lifestyle photo shown on hover."
                />
              </div>

              {/* Visual Storytelling Blocks (Max 10 Images with Title & Description) */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Product Story & Detail Gallery (Max 10)
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                        {formData.storyBlocks?.length || 0} / 10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload high-resolution lifestyle images (16:9 / 9:16) with centered titles and craftsmanship stories displayed on the product page.
                    </p>
                  </div>

                  {(formData.storyBlocks?.length || 0) < 10 && (
                    <button
                      type="button"
                      onClick={handleAddStoryBlock}
                      className="px-3.5 py-1.5 bg-[#c59b48] hover:bg-[#b58b38] text-white font-semibold text-xs tracking-wider rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Story Block</span>
                    </button>
                  )}
                </div>

                {(!formData.storyBlocks || formData.storyBlocks.length === 0) ? (
                  <div className="py-6 text-center bg-white rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                    No visual story blocks added yet. Click &quot;Add Story Block&quot; to upload lifestyle photos with titles.
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    {formData.storyBlocks.map((block, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                            Story Block #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStoryBlock(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Story Block"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <MediaUploader
                          label="Story Visual Photo (Appwrite Storage) *"
                          value={block.image || ''}
                          onChange={(url) => handleUpdateStoryBlock(idx, 'image', url)}
                          helperText="High-res lifestyle photo featuring the bottle in nature, model hands, or ingredients."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Block Title <span className="text-slate-400 font-normal">(Optional Serif Header)</span>
                            </label>
                            <input
                              type="text"
                              value={block.title || ''}
                              onChange={(e) => handleUpdateStoryBlock(idx, 'title', e.target.value)}
                              placeholder="e.g. Lingers like a star trail"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Block Subtitle <span className="text-slate-400 font-normal">(Optional Champagne Accent)</span>
                            </label>
                            <input
                              type="text"
                              value={block.subtitle || ''}
                              onChange={(e) => handleUpdateStoryBlock(idx, 'subtitle', e.target.value)}
                              placeholder="e.g. Master Perfumer Craftsmanship"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Story Description / Narrative Text <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            rows={2}
                            value={block.description || ''}
                            onChange={(e) => handleUpdateStoryBlock(idx, 'description', e.target.value)}
                            placeholder="e.g. For perfumer Kevin Mathys, a signature is about being distinct without the need to be unorthodox. A vibrant projection crafted with high concentration..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Accords / Tagline Preview</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Fresh Aquatic • Ambroxan • Bergamot"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750] focus:bg-white transition-all"
                />
              </div>

              {/* Badges and Pre-order Settings */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs hover:border-[#d6a750]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller || false}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="w-4 h-4 accent-[#d6a750] rounded"
                  />
                  <span>Bestseller Tag</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs hover:border-[#d6a750]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isPreOrder || false}
                    onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                    className="w-4 h-4 accent-[#d6a750] rounded"
                  />
                  <span>Pre-Order Active</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs hover:border-[#d6a750]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isNew || false}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 accent-[#d6a750] rounded"
                  />
                  <span>New Release</span>
                </label>
              </div>

              {formData.isPreOrder && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shipping Note Text</label>
                    <input
                      type="text"
                      value={formData.shippingNote || ''}
                      onChange={(e) => setFormData({ ...formData, shippingNote: e.target.value })}
                      placeholder="e.g. Shipping Starts From 31st August"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText || 'PRE-ORDER'}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#d6a750] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Fragrance Changes' : 'Create Fragrance'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
              handleOpenEdit(p);
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
    </div>
  );
};
