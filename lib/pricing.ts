/**
 * BakhoorBliss™ Luxury Perfumery - Central Authoritative Pricing & Product Engine
 * 
 * This module acts as the SINGLE SOURCE OF TRUTH across the entire application
 * for product size variant resolution, unit pricing, and order calculations.
 * No component or API route should implement custom price calculation logic.
 */

export interface SizeOption {
  size: string;
  price: number;
  originalPrice: number;
  isSoldOut?: boolean;
}

export interface NormalizedItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * Normalizes size string for safe comparison (e.g. ' 15 ML ' -> '15ml')
 */
export function normalizeSizeKey(sizeStr: string | null | undefined): string {
  if (!sizeStr) return '100ml';
  return String(sizeStr).trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Extracts and standardizes sizeOptions from an Appwrite product document.
 * If sizeOptions is not explicitly configured on the record, it generates
 * mathematically consistent luxury tiers (15ml, 50ml, 100ml).
 */
export function resolveProductSizeOptions(doc: any): SizeOption[] {
  if (!doc) return [];

  const basePrice = Math.max(0, Number(doc.price) || 0);
  const baseOriginalPrice = Math.max(basePrice, Number(doc.originalPrice) || basePrice);

  // 1. Check if explicit sizeOptions exist on the document
  if (doc.sizeOptions) {
    try {
      const parsed = typeof doc.sizeOptions === 'string'
        ? JSON.parse(doc.sizeOptions)
        : doc.sizeOptions;

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((opt: any) => {
          const optSize = String(opt.size || opt.label || '100ml').trim();
          const optPrice = Number(opt.price);
          const optOrigPrice = Number(opt.originalPrice || optPrice);

          return {
            size: optSize,
            price: !isNaN(optPrice) && optPrice > 0 ? optPrice : basePrice,
            originalPrice: !isNaN(optOrigPrice) && optOrigPrice > 0 ? optOrigPrice : baseOriginalPrice,
            isSoldOut: Boolean(opt.isSoldOut)
          };
        });
      }
    } catch (e) {
      console.warn('Failed to parse product sizeOptions:', e);
    }
  }

  // 2. Fallback to standard luxury tiered sizes
  return [
    {
      size: '15ml',
      price: Math.round(basePrice * 0.25),
      originalPrice: Math.round(baseOriginalPrice * 0.25),
      isSoldOut: false
    },
    {
      size: '50ml',
      price: Math.round(basePrice * 0.65),
      originalPrice: Math.round(baseOriginalPrice * 0.65),
      isSoldOut: false
    },
    {
      size: '100ml',
      price: basePrice,
      originalPrice: baseOriginalPrice,
      isSoldOut: false
    }
  ];
}

/**
 * Resolves the exact unit price for a specific product and size.
 * Guaranteed to match across frontend views, checkout modals, and backend APIs.
 */
export function resolveProductUnitPrice(
  productDoc: any,
  selectedSize?: string | null
): number {
  if (!productDoc) return 0;

  const basePrice = Math.max(0, Number(productDoc.price) || 0);
  const sizeOptions = resolveProductSizeOptions(productDoc);
  const normalizedTarget = normalizeSizeKey(selectedSize || productDoc.volume || '100ml');

  // Exact or contains match on normalized size
  const matched = sizeOptions.find((opt) => {
    const optKey = normalizeSizeKey(opt.size);
    return optKey === normalizedTarget || optKey.includes(normalizedTarget) || normalizedTarget.includes(optKey);
  });

  if (matched && typeof matched.price === 'number' && matched.price > 0) {
    return matched.price;
  }

  // Ratio fallbacks for known standard sizes
  if (normalizedTarget.includes('15ml') || normalizedTarget === '15') {
    return Math.round(basePrice * 0.25);
  }
  if (normalizedTarget.includes('50ml') || normalizedTarget === '50') {
    return Math.round(basePrice * 0.65);
  }

  return basePrice;
}

/**
 * Validates and calculates order subtotal, item breakdowns, and discount
 */
export function calculateOrderBreakdown(
  items: Array<{
    productDoc: any;
    selectedSize?: string;
    quantity?: number;
  }>,
  coupon?: {
    discountPercentage?: number;
    discountAmount?: number;
    minOrderAmount?: number;
  } | null
) {
  let subtotal = 0;
  const verifiedItems: NormalizedItem[] = [];

  for (const item of items) {
    if (!item.productDoc) continue;

    const doc = item.productDoc;
    const size = item.selectedSize || doc.volume || '100ml';
    const quantity = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
    const unitPrice = resolveProductUnitPrice(doc, size);
    const itemTotal = unitPrice * quantity;

    subtotal += itemTotal;
    verifiedItems.push({
      productId: doc.$id || doc.id,
      name: doc.name || 'Fine Fragrance',
      size,
      price: unitPrice,
      quantity,
      image: doc.image || ''
    });
  }

  let discountAmount = 0;
  if (coupon) {
    const minOrder = Number(coupon.minOrderAmount || 0);
    if (subtotal >= minOrder) {
      if (Number(coupon.discountPercentage) > 0) {
        discountAmount = Math.round(subtotal * (Number(coupon.discountPercentage) / 100));
      } else if (Number(coupon.discountAmount) > 0) {
        discountAmount = Number(coupon.discountAmount);
      }
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    subtotal,
    discountAmount,
    finalTotal,
    amountInPaise: Math.round(finalTotal * 100),
    items: verifiedItems
  };
}
