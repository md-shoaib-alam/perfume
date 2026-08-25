'use client';
import React, { useState, useEffect } from 'react';
import type { Product, ProductSizeOption } from '../types';
import { api } from '../services/api';
import { MediaUploader } from '../components/MediaUploader';
import { useConfirm } from '../components/CustomConfirmModal';


export const ProductsManager: React.FC = () => {
  const { showConfirm, showAlert } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    subtitle: '',
    category: 'extrait-de-parfum',
    gender: 'For Him',
    price: 4950,
    originalPrice: 6200,
    volume: '100ml',
    image: '',
    hoverImage: '',
    isBestseller: false,
    isNew: false,
    isPreOrder: false,
    shippingNote: '',
    buttonText: 'ADD TO BAG',
    tagline: '',
    description: '',
    notes: { top: [], heart: [], base: [] },
    sizeOptions: [
      { size: '15ml', price: 1900, originalPrice: 2400, isSoldOut: false },
      { size: '50ml', price: 3200, originalPrice: 4200, isSoldOut: false },
      { size: '100ml', price: 4950, originalPrice: 6200, isSoldOut: false }
    ]
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      subtitle: 'Extrait De Parfum',
      category: 'extrait-de-parfum',
      gender: 'For Him',
      price: 4950,
      originalPrice: 6200,
      volume: '100ml',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
      hoverImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
      isBestseller: true,
      isNew: false,
      isPreOrder: false,
      shippingNote: '',
      buttonText: 'ADD TO BAG',
      tagline: 'Rare Woods • Golden Amber',
      description: 'Handcrafted luxury fragrance formulation with 30% oil concentration.',
      notes: { top: ['Bergamot', 'Saffron'], heart: ['Turkish Rose'], base: ['Oud', 'Amber'] },
      sizeOptions: [
        { size: '15ml', price: 1900, originalPrice: 2400, isSoldOut: false },
        { size: '50ml', price: 3200, originalPrice: 4200, isSoldOut: false },
        { size: '100ml', price: 4950, originalPrice: 6200, isSoldOut: false }
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      gender: product.gender || 'For Him',
      sizeOptions: product.sizeOptions && product.sizeOptions.length > 0
        ? product.sizeOptions
        : [
            { size: '15ml', price: 1900, isSoldOut: false },
            { size: '50ml', price: Math.round(product.price * 0.58), isSoldOut: false },
            { size: '100ml', price: product.price, isSoldOut: false }
          ]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Perfume',
      message: 'Are you sure you want to remove this perfume from catalog?',
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    await api.deleteProduct(id);
    await loadProducts();
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

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, formData);
    } else {
      await api.createProduct(formData);
    }
    setIsModalOpen(false);
    await loadProducts();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.subtitle?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesGender && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Fragrance Catalog Manager</h2>
          <p className="text-xs text-slate-500">Configure fragrance gender targeting, multi-volume pricing, and inventory.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md transition-all shrink-0 cursor-pointer"
        >
          + Add New Fragrance
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search perfumes by name or accords..."
          className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#d6a750]"
        />

        {/* Gender / Audience Filter */}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750]"
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
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#d6a750]"
        >
          <option value="all">All Categories</option>
          <option value="extrait-de-parfum">Extrait De Parfum</option>
          <option value="attar">Imperial Attar</option>
          <option value="gift-set">Gift & Discovery Set</option>
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
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif text-sm font-bold text-slate-900 truncate">
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
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{prod.subtitle}</p>
                  
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
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(prod)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Products Table (hidden on mobile, visible on >= md) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-4 py-3">Audience / Gender</th>
                <th className="px-4 py-3">Volume Options & Prices</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">Loading catalog...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No products found for this filter.</td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-11 h-11 object-cover rounded border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div>
                        <div className="font-bold text-slate-900 font-serif text-sm">{prod.name}</div>
                        <div className="text-[11px] text-slate-500">{prod.subtitle}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {prod.sizeOptions && prod.sizeOptions.length > 0 ? (
                          prod.sizeOptions.map((opt, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
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
                    <td className="px-4 py-3.5">
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
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded transition-colors cursor-pointer"
                      >
                        Delete
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
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                {editingProduct ? `Edit Fragrance: ${editingProduct.name}` : 'Add New Fragrance'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fragrance Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category / Gender *</label>
                  <select
                    value={formData.gender || 'For Him'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                  >
                    <option value="For Him">For Him (Men)</option>
                    <option value="For Her">For Her (Women)</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Gift Sets">Gift Sets / Discovery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Concentration / Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Extrait De Parfum"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                  />
                </div>
              </div>

              {/* Volume Sizes & Pricing Matrix */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Volume Sizes & Pricing Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500">Configure different bottle volumes (15ml, 50ml, 100ml), individual prices, and stock availability.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeOption}
                    className="px-3 py-1.5 bg-[#d6a750] hover:bg-[#b58b38] text-black font-bold text-[10px] uppercase tracking-wider rounded shadow-xs cursor-pointer"
                  >
                    + Add Size Variant
                  </button>
                </div>

                <div className="space-y-2.5 pt-2">
                  {formData.sizeOptions?.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="col-span-1 sm:w-28">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Volume Size</label>
                        <input
                          type="text"
                          value={opt.size}
                          onChange={(e) => handleUpdateSizeOption(idx, 'size', e.target.value)}
                          placeholder="e.g. 100ml"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#d6a750]"
                        />
                      </div>

                      <div className="col-span-1 sm:w-32">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Price (₹)</label>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => handleUpdateSizeOption(idx, 'price', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#d6a750]"
                        />
                      </div>

                      <div className="col-span-1 sm:w-32">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Original MRP (₹)</label>
                        <input
                          type="number"
                          value={opt.originalPrice || 0}
                          onChange={(e) => handleUpdateSizeOption(idx, 'originalPrice', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 focus:outline-none focus:border-[#d6a750]"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-between sm:pt-4 sm:ml-auto gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={opt.isSoldOut || false}
                            onChange={(e) => handleUpdateSizeOption(idx, 'isSoldOut', e.target.checked)}
                            className="accent-red-600"
                          />
                          <span className={opt.isSoldOut ? 'text-red-600 font-bold' : ''}>Sold Out</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveSizeOption(idx)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold p-1 cursor-pointer"
                          title="Remove size"
                        >
                          ✕
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accords / Tagline Preview</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Fresh Aquatic • Ambroxan • Bergamot"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                />
              </div>

              {/* Badges and Pre-order Settings */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller || false}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="accent-[#d6a750]"
                  />
                  <span>Bestseller Tag</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isPreOrder || false}
                    onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
                    className="accent-[#d6a750]"
                  />
                  <span>Pre-Order Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isNew || false}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="accent-[#d6a750]"
                  />
                  <span>New Release</span>
                </label>
              </div>

              {formData.isPreOrder && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Note Text</label>
                    <input
                      type="text"
                      value={formData.shippingNote || ''}
                      onChange={(e) => setFormData({ ...formData, shippingNote: e.target.value })}
                      placeholder="e.g. Shipping Starts From 31st August"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText || 'PRE-ORDER'}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d6a750]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#c59b48] hover:bg-[#b58b38] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Save Fragrance Changes' : 'Create Fragrance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
