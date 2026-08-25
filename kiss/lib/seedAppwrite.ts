import { databases, APPWRITE_DATABASE_ID } from './appwrite';
import { ID, Query } from 'appwrite';
import { PRODUCTS, REVIEWS } from '../app/data/products';

const DEFAULT_SLIDES = [
  {
    name: 'Haute Vetiver Campaign',
    desktopImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1920&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    linkUrl: '#bestsellers'
  },
  {
    name: 'Vintage Harvest Edition',
    desktopImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1920&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    linkUrl: '#catalog'
  }
];

const DEFAULT_CIRCLES = [
  {
    name: 'Bureau',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Luxe',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Haute',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Miss NEESH',
    subname: 'Collection',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80'
  }
];

const DEFAULT_COUPONS = [
  {
    code: 'LUXE15',
    discountPercentage: 15,
    discountAmount: 0,
    minOrderAmount: 2000,
    isActive: true
  },
  {
    code: 'ROYAL20',
    discountPercentage: 20,
    discountAmount: 0,
    minOrderAmount: 5000,
    isActive: true
  },
  {
    code: 'FLAT500',
    discountPercentage: 0,
    discountAmount: 500,
    minOrderAmount: 3000,
    isActive: true
  }
];

const DEFAULT_SETTINGS = {
  announcementText: 'FLAT 15% OFF | USE CODE: LUXE15',
  announcementCode: 'LUXE15',
  freeGiftThreshold: 3500,
  contactEmail: 'concierge@neesh.com',
  contactPhone: '+91 (800) 555-NEESH'
};

export async function seedAppwriteDatabase() {
  const results = {
    products: 0,
    reviews: 0,
    coupons: 0,
    hero_slides: 0,
    collections: 0,
    settings: 0,
    errors: [] as string[]
  };

  console.log(`Starting Appwrite database seed on DB: ${APPWRITE_DATABASE_ID}...`);

  // 1. Seed Products
  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'products', [Query.limit(1)]);
    if (existing.total === 0) {
      for (const p of PRODUCTS) {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'products',
          ID.unique(),
          {
            name: p.name,
            subtitle: p.subtitle || '',
            category: p.category,
            gender: p.gender || 'Unisex',
            price: Number(p.price),
            originalPrice: Number(p.originalPrice || p.price),
            rating: Number(p.rating || 4.8),
            reviewsCount: Number(p.reviewsCount || 0),
            volume: p.volume || '100ml',
            image: p.image,
            hoverImage: p.hoverImage || p.image,
            description: p.description || '',
            notes: JSON.stringify(p.notes || {}),
            isBestseller: Boolean(p.isBestseller),
            isNew: Boolean(p.isNew),
            stock: 100
          }
        );
        results.products++;
      }
    } else {
      results.products = existing.total;
    }
  } catch (err: any) {
    console.error('Error seeding products:', err);
    results.errors.push(`Products: ${err.message}`);
  }

  // 2. Seed Reviews
  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'reviews', [Query.limit(1)]);
    if (existing.total === 0) {
      for (const r of REVIEWS) {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'reviews',
          ID.unique(),
          {
            productName: r.productName,
            author: r.author,
            rating: Number(r.rating || 5),
            title: r.title || '',
            comment: r.comment,
            verified: Boolean(r.verified),
            date: r.date || new Date().toISOString().split('T')[0]
          }
        );
        results.reviews++;
      }
    } else {
      results.reviews = existing.total;
    }
  } catch (err: any) {
    console.error('Error seeding reviews:', err);
    results.errors.push(`Reviews: ${err.message}`);
  }

  // 3. Seed Coupons
  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [Query.limit(1)]);
    if (existing.total === 0) {
      for (const c of DEFAULT_COUPONS) {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'coupons',
          ID.unique(),
          {
            code: c.code,
            discountPercentage: c.discountPercentage,
            discountAmount: c.discountAmount,
            minOrderAmount: c.minOrderAmount,
            isActive: c.isActive
          }
        );
        results.coupons++;
      }
    } else {
      results.coupons = existing.total;
    }
  } catch (err: any) {
    console.error('Error seeding coupons:', err);
    results.errors.push(`Coupons: ${err.message}`);
  }

  // 4. Seed Hero Slides
  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'hero_slides', [Query.limit(1)]);
    if (existing.total === 0) {
      for (const h of DEFAULT_SLIDES) {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'hero_slides',
          ID.unique(),
          {
            name: h.name,
            desktopImage: h.desktopImage,
            mobileImage: h.mobileImage,
            linkUrl: h.linkUrl
          }
        );
        results.hero_slides++;
      }
    } else {
      results.hero_slides = existing.total;
    }
  } catch (err: any) {
    console.error('Error seeding hero slides:', err);
    results.errors.push(`Hero Slides: ${err.message}`);
  }

  // 5. Seed Collections
  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'collections', [Query.limit(1)]);
    if (existing.total === 0) {
      for (const col of DEFAULT_CIRCLES) {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'collections',
          ID.unique(),
          {
            name: col.name,
            subname: col.subname,
            image: col.image
          }
        );
        results.collections++;
      }
    } else {
      results.collections = existing.total;
    }
  } catch (err: any) {
    console.error('Error seeding collections:', err);
    results.errors.push(`Collections: ${err.message}`);
  }

  // 6. Seed Settings
  try {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'settings', [Query.limit(1)]);
    if (existing.total === 0) {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'settings',
        'store_settings',
        DEFAULT_SETTINGS
      );
      results.settings = 1;
    } else {
      results.settings = existing.total;
    }
  } catch (err: any) {
    console.error('Error seeding settings:', err);
    results.errors.push(`Settings: ${err.message}`);
  }

  console.log('Appwrite seeding completed:', results);
  return results;
}
