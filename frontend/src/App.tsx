import { useState, useMemo } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { MasterPerfumersSection } from './components/MasterPerfumersSection';
import { ReelShortsSection } from './components/ReelShortsSection';
import { GoldTrustBanner } from './components/GoldTrustBanner';
import { CelebritySection } from './components/CelebritySection';
import { CollectionsCirclesSection } from './components/CollectionsCirclesSection';
import { GenderCampaignBanners } from './components/GenderCampaignBanners';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MenuDrawer } from './components/MenuDrawer';
import { PRODUCTS } from './data/products';
import type { Product, CartItem } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'For Him' | 'For Her' | 'Gift Sets'>('For Him');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Cart operations
  const handleAddToCart = (product: Product, size: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#d6a13d] selection:text-black relative">
      
      {/* 1. Gold Announcement Offer Bar */}
      <AnnouncementBar />

      {/* 2. Header / Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Tsunara Hero Banner */}
      <HeroSection
        onShopNow={() => {
          document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. Our Bestsellers Section */}
      <section id="bestsellers" className="py-16 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="text-center mb-10 font-serif">
          <h2 className="text-3xl sm:text-4xl font-normal text-slate-800 tracking-wide mb-6">
            Our Bestsellers
          </h2>

          {/* Sub-tabs: For Him / For Her / Gift Sets */}
          <div className="flex justify-center items-center gap-8 text-xs font-sans tracking-widest font-medium border-b border-slate-200/80 pb-2 max-w-xs mx-auto">
            {(['For Him', 'For Her', 'Gift Sets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 transition-all border-b-2 ${
                  activeTab === tab
                    ? 'border-[#353534] text-slate-900 font-bold border-b-2'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Container (Horizontal Slider on Mobile, Grid on Desktop) */}
        <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-6 pb-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0">
          {filteredProducts.map((product) => (
            <div key={product.id} className="w-[72vw] max-w-[260px] flex-shrink-0 snap-center sm:w-auto sm:max-w-none">
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setSelectedProductModal(p)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Master Perfumers Section (Julien Rasquinet Italian Perfumer Award) */}
      <MasterPerfumersSection />

      {/* 6. Reel Shorts & Featured In Press Logos */}
      <ReelShortsSection />

      {/* 7. Gold Trust Banner (7 Days Returns / Free Delivery / 10+ Hours Guarantee) */}
      <GoldTrustBanner />

      {/* 8. Worn by 100k+ fragheads, including (Celebrities: Allu Arjun, Raashii Khanna, etc.) */}
      <CelebritySection />

      {/* 8.5 Collections Category Circles (Bureau, Luxe, Haute, Miss NEESH) */}
      <CollectionsCirclesSection />

      {/* 8.6 Gender Campaign Banners (For Him & For Her) */}
      <GenderCampaignBanners />

      {/* 9. Footer */}
      <Footer />

      {/* 10. Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* 10.5 Sliding Hamburger Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />



      {/* Quick View Product Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 relative shadow-2xl border border-slate-200">
            <button
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-black p-2"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <img
                src={selectedProductModal.image}
                alt={selectedProductModal.name}
                className="w-full h-64 object-cover rounded-xl"
              />

              <div className="space-y-3 font-serif">
                <span className="text-xs font-sans uppercase tracking-widest text-[#b69254] font-semibold">{selectedProductModal.volume}</span>
                <h3 className="text-2xl font-bold text-slate-900">{selectedProductModal.name}</h3>
                <p className="text-xs font-sans text-slate-500">{selectedProductModal.subtitle}</p>

                <div className="pt-2">
                  <span className="text-xl font-bold text-slate-900">Rs.{selectedProductModal.price.toLocaleString('en-IN')}.00</span>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProductModal, '100ml');
                    setSelectedProductModal(null);
                  }}
                  className="w-full py-3 bg-[#d6a13d] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#c49232] transition-colors"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
