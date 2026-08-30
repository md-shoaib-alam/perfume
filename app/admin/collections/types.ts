export interface CollectionItem {
  id?: string;
  slug?: string;
  name: string;
  subname: string;
  badge?: string;
  subtitle?: string;
  editorial?: string;
  image: string;
  bannerImage?: string;
  campaignImage?: string;
  showInStoryCircle?: boolean;
}

export const STANDARD_LANDING_PAGES: CollectionItem[] = [
  {
    slug: 'for-him',
    name: 'Pour Homme',
    subname: 'For Him (Men)',
    badge: 'HOMME & NOIR COLLECTION',
    subtitle: 'Commanding agarwoods, spicy aromatics, and crisp architectural woods.',
    editorial: 'The Pour Homme Collection captures unyielding presence, refined power, and magnetic depth. Formulated with high-concentration aged agarwood, Venetian saffron, and crisp Calabrian bergamot, each extrait creates an authoritative sillage tailored for the distinguished gentleman.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'for-her',
    name: 'Pour Femme',
    subname: 'For Her (Women)',
    badge: 'FLORELLE & FEMME COLLECTION',
    subtitle: 'Sensual floral extraits, golden ambers, and velvety nectar compositions.',
    editorial: 'The Pour Femme Collection showcases a range of sensual and lasting aromas for the modern woman who embodies and exudes elegance, charisma, and grace. Each fragrance of floral extracts steeped in pristine oils is handcrafted to invoke the essence of sophisticated haute perfumery.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'unisex',
    name: 'Unisex Haute Parfumerie',
    subname: 'Unisex',
    badge: 'EXCLUSIVE ARTISAN BLENDS',
    subtitle: 'Genderless liquid architecture blending rare resins, spices, and exotic florals.',
    editorial: 'Transcend conventional fragrance boundaries with our unisex compositions. Formulated with vintage resins, smoky incense, and rare floral absolutes that evolve uniquely on pulse points throughout the day.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'gift-set',
    name: 'Gifting Collections',
    subname: 'Gift Sets',
    badge: 'LUXURY GIFTING COFFRETS',
    subtitle: 'Handcrafted presentation boxes for special celebrations, anniversaries, and distinguished milestones.',
    editorial: 'Unwrap the magic of haute perfumery. Encased in velvet-lined champagne gold presentation coffrets, our gifting sets represent the ultimate expression of gratitude and luxury.',
    image: '',
    bannerImage: ''
  },
  {
    slug: 'discovery-set',
    name: 'Discovery Sets',
    subname: 'Discovery Coffrets',
    badge: 'OLFACTORY TASTING SETS',
    subtitle: 'Explore the complete olfactive spectrum with complimentary voucher redeemable on your full bottle.',
    editorial: 'Experience the entire collection before selecting your signature scent. Each discovery coffret includes travel-ready atomizers accompanied by an exclusive full-bottle redemption voucher.',
    image: '',
    bannerImage: ''
  }
];

export const generateUniqueSlug = (existingCollections: CollectionItem[]): string => {
  const existingSlugs = new Set(
    existingCollections.map((c) => c.slug?.toLowerCase().trim()).filter(Boolean)
  );
  let counter = 1;
  while (existingSlugs.has(`collection-${counter}`)) {
    counter++;
  }
  return `collection-${counter}`;
};
