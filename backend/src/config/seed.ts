import { Product } from '../models/Product';
import { Collection } from '../models/Collection';
import { Perfumer } from '../models/Perfumer';
import { Celebrity } from '../models/Celebrity';
import { Review } from '../models/Review';
import { StoreSettings } from '../models/StoreSettings';
import { Order } from '../models/Order';

export const SEED_PRODUCTS = [
  {
    id: 'glaze-water',
    name: 'Glazed Water',
    subtitle: 'Extrait De Parfum',
    category: 'extrait-de-parfum',
    price: 4950,
    originalPrice: 6200,
    rating: 4.9,
    reviewsCount: 184,
    volume: '100ml',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    isBestseller: true,
    tagline: 'Fresh Aquatic • Ambroxan • Bergamot',
    badgeText: 'AWARD WINNING',
    badgeSubtext: 'BEST FRESH SCENT 2025',
    notes: {
      top: ['Calabrian Bergamot', 'Aquatic Accord', 'Mandarin'],
      heart: ['Clary Sage', 'Geranium', 'Rosemary'],
      base: ['Ambroxan', 'Mineral Amber', 'Patchouli']
    },
    description: 'An effervescent, crisp oceanic perfume with luminous citrus and crystalline amber.',
    stockQuantity: 45
  },
  {
    id: 'haute-vetiver',
    name: 'Haute Vetiver',
    subtitle: 'Extrait De Parfum',
    category: 'extrait-de-parfum',
    price: 5400,
    originalPrice: 6800,
    rating: 5.0,
    reviewsCount: 96,
    volume: '100ml',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
    isNew: true,
    isPreOrder: true,
    shippingNote: 'Shipping Starts From 31st August',
    buttonText: 'PRE-ORDER',
    tagline: 'Smoky Vetiver • Haitian Woods • Leather',
    badgeText: 'LIMITED BATCH',
    badgeSubtext: 'VINTAGE 2026 HARVEST',
    notes: {
      top: ['Pink Pepper', 'Grapefruit', 'Cardamom'],
      heart: ['Haitian Vetiver', 'Iris Concrete', 'Cedarwood'],
      base: ['Dark Leather', 'Olibanum', 'Aged Oakmoss']
    },
    description: 'A masterpiece created by Julien Rasquinet featuring raw Haitian vetiver.',
    stockQuantity: 15
  },
  {
    id: 'signature-scent',
    name: 'Signature Scent',
    subtitle: 'Imperial Extrait',
    category: 'extrait-de-parfum',
    price: 5200,
    originalPrice: 6500,
    rating: 4.8,
    reviewsCount: 230,
    volume: '100ml',
    image: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=600&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    isBestseller: true,
    tagline: 'Royal Oud • Saffron • Turkish Rose',
    notes: {
      top: ['Royal Saffron', 'Nutmeg', 'Lavender'],
      heart: ['Turkish Rose Absolute', 'Oud Wood'],
      base: ['Ambergris', 'White Musk', 'Sandalwood']
    },
    description: 'The defining icon of NEESH. A regal blend of rich oriental oud and spicy saffron.',
    stockQuantity: 60
  },
  {
    id: 'mehr',
    name: 'Mehr',
    subtitle: 'Extrait De Parfum',
    category: 'extrait-de-parfum',
    price: 4800,
    originalPrice: 6000,
    rating: 4.9,
    reviewsCount: 142,
    volume: '100ml',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=600&q=80',
    isBestseller: true,
    tagline: 'Golden Amber • Jasmine Sambac • Vanilla',
    notes: {
      top: ['Sunlit Mandarin', 'Peach Blossom'],
      heart: ['Night Blooming Jasmine', 'Ylang Ylang'],
      base: ['Warm Bourbon Vanilla', 'Golden Amber', 'Benzoin']
    },
    description: 'Warm, golden, sensual florals wrapped in velvety bourbon vanilla.',
    stockQuantity: 38
  }
];

export const SEED_COLLECTIONS = [
  {
    id: 'bureau',
    name: 'Bureau',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    link: '#bureau',
    order: 1
  },
  {
    id: 'luxe',
    name: 'Luxe',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80',
    link: '#luxe',
    order: 2
  },
  {
    id: 'haute',
    name: 'Haute',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
    link: '#haute',
    order: 3
  },
  {
    id: 'miss-neesh',
    name: 'Miss NEESH',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    link: '#miss-neesh',
    order: 4
  }
];

export const SEED_CELEBRITIES = [
  {
    id: 'allu-arjun',
    name: 'Allu Arjun',
    perfume: 'SIGNATURE SCENT',
    bottleThumb: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    order: 1
  },
  {
    id: 'raashii-khanna',
    name: 'Raashii Khanna',
    perfume: 'MEHR',
    bottleThumb: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    order: 2
  },
  {
    id: 'jim-sarbh',
    name: 'Jim Sarbh',
    perfume: 'GLAZED WATER',
    bottleThumb: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    order: 3
  },
  {
    id: 'gauahar-khan',
    name: 'Gauahar Khan',
    perfume: 'HAUTE TOBACCO',
    bottleThumb: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=200&q=80',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    order: 4
  }
];

export const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding initial products...');
      await Product.insertMany(SEED_PRODUCTS);
    }

    const collectionCount = await Collection.countDocuments();
    if (collectionCount === 0) {
      console.log('Seeding initial collections...');
      await Collection.insertMany(SEED_COLLECTIONS);
    }

    const celebCount = await Celebrity.countDocuments();
    if (celebCount === 0) {
      console.log('Seeding initial celebrities...');
      await Celebrity.insertMany(SEED_CELEBRITIES);
    }

    const settingsCount = await StoreSettings.countDocuments();
    if (settingsCount === 0) {
      console.log('Seeding initial store settings...');
      await StoreSettings.create({});
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('Seeding demo orders for analytics...');
      await Order.create([
        {
          orderNumber: 'NSH-10821',
          customer: {
            name: 'Aarav Sharma',
            email: 'aarav@example.com',
            phone: '+91 98765 43210',
            address: '42 Marine Drive, Nariman Point',
            city: 'Mumbai',
            postalCode: '400021'
          },
          items: [
            {
              productId: 'glaze-water',
              name: 'Glazed Water',
              size: '100ml',
              price: 4950,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=200&q=80'
            }
          ],
          subtotal: 4950,
          discount: 742.5,
          shipping: 0,
          total: 4207.5,
          paymentMethod: 'UPI / Credit Card',
          paymentStatus: 'Paid',
          orderStatus: 'Delivered'
        },
        {
          orderNumber: 'NSH-10822',
          customer: {
            name: 'Priyanka Sen',
            email: 'priyanka@example.com',
            phone: '+91 91234 56789',
            address: '88 Park Street',
            city: 'Kolkata',
            postalCode: '700016'
          },
          items: [
            {
              productId: 'haute-vetiver',
              name: 'Haute Vetiver',
              size: '100ml',
              price: 5400,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80'
            }
          ],
          subtotal: 5400,
          discount: 0,
          shipping: 0,
          total: 5400,
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          orderStatus: 'Processing'
        }
      ]);
    }

    console.log('Database seeding verified successfully.');
  } catch (err) {
    console.error('Error during database seed:', err);
  }
};
