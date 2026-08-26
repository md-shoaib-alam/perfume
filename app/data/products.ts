/**
 * @file products.ts
 * @deprecated STOREFRONT IMPORT STRICTLY FORBIDDEN
 * 
 * ============================================================================
 * ARCHITECTURAL GUIDELINE NOTICE:
 * ============================================================================
 * 1. Products, Reviews, Orders, Coupons, Hero Slides, Story Collections, and Settings
 *    MUST be dynamically fetched from the Appwrite Database (`perfumedb`).
 * 2. Hardcoded fallback product or review arrays in the storefront are strictly prohibited.
 * 3. All media must be uploaded to the Appwrite Cloud Storage bucket (`perfume_media`)
 *    via `uploadMediaToAppwrite()` and served via Appwrite Storage URLs.
 * 
 * If initial seed data is needed for administrative setup, use the server-only fixture:
 * `@/lib/fixtures/seedProducts`.
 * ============================================================================
 */

// Runtime guard to prevent client-side or storefront consumption
if (typeof window !== 'undefined') {
  throw new Error(
    '[ARCHITECTURAL VIOLATION] "app/data/products.ts" cannot be imported in client-side or storefront code. ' +
    'Products and reviews must be dynamically fetched from Appwrite Database (perfumedb).'
  );
}

export const IS_STOREFRONT_SOURCE = false;
