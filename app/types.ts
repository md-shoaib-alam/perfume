export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductSizeOption {
  size: string; // e.g. '15ml', '50ml', '100ml'
  price: number;
  originalPrice?: number;
  isSoldOut?: boolean;
}

export interface ProductStoryBlock {
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  gender?: 'For Him' | 'For Her' | 'Unisex' | 'Gift Sets';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  volume: string;
  image: string;
  hoverImage: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isPreOrder?: boolean;
  shippingNote?: string;
  buttonText?: string;
  tagline?: string;
  badgeText?: string;
  badgeSubtext?: string;
  notes: FragranceNotes;
  description: string;
  stock?: number;
  collection?: string;
  sizeOptions?: ProductSizeOption[];
  storyBlocks?: ProductStoryBlock[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  unitPrice?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  productName: string;
  approved?: boolean;
}

export interface HeroSlide {
  id: string;
  name: string;
  desktopImage: string;
  mobileImage: string;
  linkUrl: string;
  position?: number;
}

export interface NoteItem {
  name: string;
  role: string;
  source: string;
  image: string;
}

export interface PyramidTier {
  title: string;
  duration: string;
  description: string;
  notes: NoteItem[];
}

export type FragrancePyramidData = Record<'top' | 'heart' | 'base', PyramidTier>;

export interface StoreSettings {
  announcementText: string;
  announcementCode: string;
  freeGiftThreshold: number;
  contactEmail: string;
  contactPhone: string;
  returnsBadgeText?: string;
  returnsTitle?: string;
  returnsDescription?: string;
  deliveryTitle?: string;
  deliveryDescription?: string;
  guaranteeTitle?: string;
  guaranteeDescription?: string;
  fragranceTiers?: string | FragrancePyramidData;
}
