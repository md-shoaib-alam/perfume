import type { Product, Review } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'haute-vetiver',
    name: 'Haute Vetiver',
    subtitle: 'Fresh, Earthy, woody • Citrus Rain, Wild Vetiver, Raw Cacao',
    category: 'extrait-de-parfum',
    gender: 'For Him',
    price: 8500,
    originalPrice: 9900,
    rating: 4.9,
    reviewsCount: 342,
    volume: '100ml / 3.4 fl. oz.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    isBestseller: true,
    isPreOrder: true,
    shippingNote: 'Shipping Starts From 31st August',
    buttonText: 'PRE-ORDER',
    tagline: 'Creation by Julien Rasquinet',
    badgeText: 'GLOBAL AWARD WINNING',
    badgeSubtext: 'Celebrity Perfumer',
    notes: {
      top: ['Citrus Rain', 'Bergamot', 'Grapefruit'],
      heart: ['Wild Vetiver', 'Raw Cacao', 'Cardamom'],
      base: ['Cedarwood', 'Ambroxan', 'Musk']
    },
    description: 'Creation by Julien Rasquinet. A global award-winning masterpiece featuring wild earthy vetiver and raw cacao.',
    sizeOptions: [
      { size: '15ml', price: 1900, originalPrice: 2400, isSoldOut: true },
      { size: '50ml', price: 5200, originalPrice: 6200, isSoldOut: false },
      { size: '100ml', price: 8500, originalPrice: 9900, isSoldOut: false }
    ]
  },
  {
    id: 'tsunara',
    name: 'Tsunara',
    subtitle: 'Marine, Beastly, Clean, Woody • A potent freshie that\'s violent like a Tsunami',
    category: 'extrait-de-parfum',
    gender: 'For Him',
    price: 7990,
    originalPrice: 8990,
    rating: 5.0,
    reviewsCount: 418,
    volume: '100ml / 3.4 fl. oz.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    isBestseller: true,
    tagline: 'ARGUABLY THE LONGEST-LASTING',
    badgeText: 'FRESHIE ON THE PLANET',
    badgeSubtext: '- Forbes',
    notes: {
      top: ['Oceanic Breeze', 'Icy Citrus', 'Sea Salt'],
      heart: ['Aquatic Accord', 'Wild Lavender', 'Geranium'],
      base: ['Seaweed Absolute', 'Ambergris', 'Driftwood']
    },
    description: 'Arguably the longest-lasting freshie on the planet as praised by Forbes. A potent oceanic explosion.',
    sizeOptions: [
      { size: '15ml', price: 1900, originalPrice: 2200, isSoldOut: false },
      { size: '50ml', price: 4990, originalPrice: 5800, isSoldOut: false },
      { size: '100ml', price: 7990, originalPrice: 8990, isSoldOut: false }
    ]
  },
  {
    id: 'mehr',
    name: 'Mehr',
    subtitle: 'Golden Amber, Bourbon Vanilla, Jasmine Sambac • Velvet Royalty',
    category: 'extrait-de-parfum',
    gender: 'For Her',
    price: 8200,
    originalPrice: 9500,
    rating: 4.9,
    reviewsCount: 290,
    volume: '100ml / 3.4 fl. oz.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=80',
    isBestseller: true,
    tagline: 'FEMININE MAJESTY',
    badgeText: 'WORN BY RAASHII KHANNA',
    badgeSubtext: 'Signature Floral',
    notes: {
      top: ['Sunlit Mandarin', 'Peach Nectar', 'Saffron'],
      heart: ['Night Blooming Jasmine', 'Ylang Ylang', 'Damask Rose'],
      base: ['Bourbon Vanilla', 'Golden Amber', 'Benzoin']
    },
    description: 'Golden floral majesty wrapped in liquid amber and warm bourbon vanilla.',
    sizeOptions: [
      { size: '15ml', price: 1900, originalPrice: 2400, isSoldOut: false },
      { size: '50ml', price: 5100, originalPrice: 6000, isSoldOut: false },
      { size: '100ml', price: 8200, originalPrice: 9500, isSoldOut: false }
    ]
  },
  {
    id: 'milky-way',
    name: 'Milky Way',
    subtitle: 'Lactonic, woody, gourmand • Arguably the longest lasting cardamom perfume',
    category: 'extrait-de-parfum',
    gender: 'For Her',
    price: 8500,
    originalPrice: 9500,
    rating: 4.8,
    reviewsCount: 220,
    volume: '100ml / 3.4 fl. oz.',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    isBestseller: true,
    tagline: 'VERY LONG LASTING',
    badgeText: 'LACTONIC GOURMAND',
    badgeSubtext: 'Cardamom Scent',
    notes: {
      top: ['Green Cardamom', 'Warm Milk Accord', 'Nutmeg'],
      heart: ['Iris Root', 'Cashmere Wood', 'Vanilla Pod'],
      base: ['Sandalwood', 'White Amber', 'Musk']
    },
    description: 'A comforting lactonic gourmand perfume with rich green cardamom and creamy cashmere wood.',
    sizeOptions: [
      { size: '15ml', price: 1900, originalPrice: 2200, isSoldOut: false },
      { size: '50ml', price: 5200, originalPrice: 6200, isSoldOut: false },
      { size: '100ml', price: 8500, originalPrice: 9500, isSoldOut: false }
    ]
  },
  {
    id: 'signature-scent',
    name: 'Signature Scent',
    subtitle: 'Fresh, fruity, spicy • An unforgettable signature',
    category: 'extrait-de-parfum',
    gender: 'For Him',
    price: 6850,
    originalPrice: 7850,
    rating: 4.9,
    reviewsCount: 512,
    volume: '100ml / 3.4 fl. oz.',
    image: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    isBestseller: true,
    tagline: 'FRESH BEAST',
    badgeText: 'MOST POPULAR',
    badgeSubtext: 'All-Day Wear',
    notes: {
      top: ['Crisp Apple', 'Pink Pepper', 'Bergamot'],
      heart: ['Pineapple', 'Birch Tar', 'Jasmine'],
      base: ['Oakmoss', 'Ambergris', 'Patchouli']
    },
    description: 'An unforgettable signature scent worn by celebrities worldwide. Fresh, fruity, and magnetic.',
    sizeOptions: [
      { size: '15ml', price: 1900, originalPrice: 2200, isSoldOut: false },
      { size: '50ml', price: 4400, originalPrice: 5200, isSoldOut: false },
      { size: '100ml', price: 6850, originalPrice: 7850, isSoldOut: false }
    ]
  },
  {
    id: 'discovery-set',
    name: 'Imperial Discovery Box',
    subtitle: '5x15ml Luxury Extrait Discovery Coffret with Collector Box',
    category: 'gift-set',
    gender: 'Gift Sets',
    price: 3490,
    originalPrice: 4500,
    rating: 5.0,
    reviewsCount: 380,
    volume: '5 x 15ml (75ml Total)',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    isBestseller: true,
    tagline: 'PERFECT LUXURY GIFT',
    badgeText: '5 LUXURY EXTRAITS',
    badgeSubtext: 'Includes ₹1000 Voucher',
    notes: {
      top: ['Glazed Water', 'Tsunara', 'Mehr'],
      heart: ['Haute Vetiver', 'Signature Scent'],
      base: ['Collector Box', 'Certificate of Authenticity']
    },
    description: 'The ultimate luxury gifting set containing 5 iconic NEESH extrait de parfum miniatures.',
    sizeOptions: [
      { size: '5 x 15ml Box', price: 3490, originalPrice: 4500, isSoldOut: false }
    ]
  }
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Vikramaditya S.',
    rating: 5,
    date: '2 days ago',
    title: 'Unmatched Projection & Longevity!',
    comment: 'Tsunara easily lasts 14+ hours on my skin. The aquatic ocean and ambergris opening is unbelievable. Worth every rupee.',
    verified: true,
    productName: 'Tsunara'
  },
  {
    id: '2',
    author: 'Ananya R.',
    rating: 5,
    date: '1 week ago',
    title: 'Pure Royalty in a Bottle',
    comment: 'Haute Vetiver is so smooth! Just two spritzes on pulse points and I get compliments everywhere I go.',
    verified: true,
    productName: 'Haute Vetiver'
  }
];
