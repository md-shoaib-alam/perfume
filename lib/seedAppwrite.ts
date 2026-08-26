import { databases, APPWRITE_DATABASE_ID } from './appwrite';
import { INITIAL_SEED_PRODUCTS, INITIAL_SEED_REVIEWS } from './fixtures/seedProducts';

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
  contactPhone: '+91 (800) 555-NEESH',
  heritageBadge: 'Imperial Legacy',
  heritageTitle: 'BOTTLED WITH',
  heritageTitleHighlight: 'ROYAL HERITAGE & PARISIAN FINESSE',
  heritageNarrative: 'NEESH brings together centuries of Royal Indian Attar-making traditions and modern French haute perfumery. Every fragrance is macerated for 90 days in dark oak barrels to achieve unprecedented longevity and depth.',
  heritageImage: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=80',
  heritageConcentrationValue: '30%',
  heritageConcentrationLabel: 'Oil Concentration (Extrait)',
  heritageMacerationValue: '90 Days',
  heritageMacerationLabel: 'Oak Barrel Maceration',
  heritageCtaText: 'Discover the Craftsmanship',
  heritageCtaLink: '#bestsellers',
  fragranceTiers: JSON.stringify({
    top: {
      title: 'Top Notes (First Impressions)',
      time: '0 - 30 Minutes',
      description: 'The volatile top accords that dazzle your senses upon first spritz.',
      notes: [
        { name: 'Venetian Saffron', origin: 'Venice, Italy', desc: 'Warm, golden, leather-spiced undertones.' },
        { name: 'Taif Damask Rose', origin: 'Taif, Saudi Arabia', desc: 'Dewy, opulent, nectarous floral majesty.' },
        { name: 'Icy Mint & Bergamot', origin: 'Calabria, Italy', desc: 'Zesty sparkling citrus brightness.' }
      ]
    },
    heart: {
      title: 'Heart Notes (The Soul)',
      time: '30 Mins - 4 Hours',
      description: 'The core signature of the fragrance that unfolds gracefully on pulse points.',
      notes: [
        { name: 'Aged Royal Oud', origin: 'Assam, India', desc: 'Deep, resinous, dark woody grandeur.' },
        { name: 'Smokey Incense', origin: 'Oman', desc: 'Mystical balsamic smoke and sacred resins.' },
        { name: 'Cuban Tobacco Leaf', origin: 'Havana, Cuba', desc: 'Rich, cured tobacco leaf with spiced honey.' }
      ]
    },
    base: {
      title: 'Base Notes (The Memory)',
      time: '4 Hours - 16+ Hours',
      description: 'Rich, fixative resins and woods that cling to skin and garments for days.',
      notes: [
        { name: 'Golden Amber', origin: 'Grasse, France', desc: 'Warm, luminous, honeyed amber resin.' },
        { name: 'Atlas Cedarwood', origin: 'Atlas Mountains', desc: 'Noble, dry, balsamic evergreen woodiness.' },
        { name: 'Bourbon Vanilla', origin: 'Madagascar', desc: 'Smooth, creamy, intoxicating sweet vanilla.' }
      ]
    }
  })
};

/**
 * Generate deterministic, valid Appwrite document IDs (max 36 chars, alphanumeric, starts with char)
 */
function toDeterministicId(prefix: string, rawKey: string): string {
  const sanitized = rawKey
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const id = `${prefix}_${sanitized}`.slice(0, 36);
  return id.replace(/^[^a-z0-9]+/, '') || `${prefix}_doc`;
}

/**
 * Idempotent upsert of a document using deterministic document ID.
 * Concurrency-safe: If the document already exists, it updates it.
 */
async function upsertDocument(
  collectionId: string,
  documentId: string,
  data: Record<string, any>
): Promise<'created' | 'updated'> {
  try {
    await databases.createDocument(APPWRITE_DATABASE_ID, collectionId, documentId, data);
    return 'created';
  } catch (err: any) {
    // 409 Conflict indicates document already exists
    if (err?.code === 409 || err?.message?.toLowerCase()?.includes('already exists')) {
      await databases.updateDocument(APPWRITE_DATABASE_ID, collectionId, documentId, data);
      return 'updated';
    }
    throw err;
  }
}

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

  // 1. Seed Products (Deterministic & Resumable)
  for (const p of INITIAL_SEED_PRODUCTS) {
    const docId = toDeterministicId('sprod', p.name || 'item');
    try {
      await upsertDocument(
        'products',
        docId,
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
    } catch (err: any) {
      console.error(`Error seeding product (${p.name}):`, err);
      results.errors.push(`Product (${p.name}): ${err.message}`);
    }
  }

  // 2. Seed Reviews (Deterministic & Resumable)
  for (let idx = 0; idx < INITIAL_SEED_REVIEWS.length; idx++) {
    const r = INITIAL_SEED_REVIEWS[idx];
    const docId = toDeterministicId('srev', `${r.productName || 'gen'}_${idx + 1}`);
    try {
      await upsertDocument(
        'reviews',
        docId,
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
    } catch (err: any) {
      console.error(`Error seeding review (${r.title || idx}):`, err);
      results.errors.push(`Review (${r.title || idx}): ${err.message}`);
    }
  }

  // 3. Seed Coupons (Deterministic & Resumable)
  for (const c of DEFAULT_COUPONS) {
    const docId = toDeterministicId('scoupon', c.code);
    try {
      await upsertDocument(
        'coupons',
        docId,
        {
          code: c.code,
          discountPercentage: c.discountPercentage,
          discountAmount: c.discountAmount,
          minOrderAmount: c.minOrderAmount,
          isActive: c.isActive
        }
      );
      results.coupons++;
    } catch (err: any) {
      console.error(`Error seeding coupon (${c.code}):`, err);
      results.errors.push(`Coupon (${c.code}): ${err.message}`);
    }
  }

  // 4. Seed Hero Slides (Deterministic & Resumable)
  for (const h of DEFAULT_SLIDES) {
    const docId = toDeterministicId('sslide', h.name);
    try {
      await upsertDocument(
        'hero_slides',
        docId,
        {
          name: h.name,
          desktopImage: h.desktopImage,
          mobileImage: h.mobileImage,
          linkUrl: h.linkUrl
        }
      );
      results.hero_slides++;
    } catch (err: any) {
      console.error(`Error seeding hero slide (${h.name}):`, err);
      results.errors.push(`Hero Slide (${h.name}): ${err.message}`);
    }
  }

  // 5. Seed Collections (Deterministic & Resumable)
  for (const col of DEFAULT_CIRCLES) {
    const docId = toDeterministicId('scol', col.name);
    try {
      await upsertDocument(
        'collections',
        docId,
        {
          name: col.name,
          subname: col.subname,
          image: col.image
        }
      );
      results.collections++;
    } catch (err: any) {
      console.error(`Error seeding collection (${col.name}):`, err);
      results.errors.push(`Collection (${col.name}): ${err.message}`);
    }
  }

  // 6. Seed Settings (Deterministic & Resumable)
  try {
    await upsertDocument(
      'settings',
      'store_settings',
      DEFAULT_SETTINGS
    );
    results.settings = 1;
  } catch (err: any) {
    console.error('Error seeding settings:', err);
    results.errors.push(`Settings: ${err.message}`);
  }

  console.log('Appwrite seeding completed:', results);
  return results;
}
