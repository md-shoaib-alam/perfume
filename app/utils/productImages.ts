import type { Product } from '../types';

export function getProductImageList(
  product: Pick<Product, 'image' | 'hoverImage' | 'showcaseImages'> | null | undefined
): string[] {
  if (!product) return [];

  const images = new Set<string>();
  if (product.image) images.add(product.image);
  // hoverImage is a single URL for product card hover — also shown in the detail carousel
  if (product.hoverImage && product.hoverImage !== product.image) images.add(product.hoverImage);
  if (Array.isArray(product.showcaseImages)) {
    product.showcaseImages.forEach((url) => {
      if (url) images.add(url);
    });
  }

  return Array.from(images);
}
