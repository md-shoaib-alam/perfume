export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'extrait-de-parfum' | 'attar' | 'discovery-set' | 'gift-set';
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
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
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
}
