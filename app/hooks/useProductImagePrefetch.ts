'use client';

import { useEffect } from 'react';
import { getImageProps } from 'next/image';
import type { Product } from '../types';
import { getProductImageList } from '../utils/productImages';

// Must match the product detail gallery exactly, or this warms a different
// optimizer entry than the one the gallery ends up requesting.
const GALLERY_SIZES = '(max-width: 1024px) 100vw, 50vw';
const GALLERY_QUALITY = 90;
const IMAGES_PER_PRODUCT = 2;
const CONCURRENCY = 3;

let started = false;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function connectionAllowsPrefetch(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection) return true;
  if (connection.saveData) return false;
  return connection.effectiveType !== 'slow-2g' && connection.effectiveType !== '2g';
}

function warmImage(src: string): Promise<void> {
  const { props } = getImageProps({
    src,
    alt: '',
    fill: true,
    sizes: GALLERY_SIZES,
    quality: GALLERY_QUALITY,
  });

  return new Promise((resolve) => {
    const img = document.createElement('img');
    if (props.srcSet) img.srcset = props.srcSet;
    if (props.sizes) img.sizes = props.sizes;
    img.alt = '';
    img.decoding = 'async';
    img.setAttribute('fetchpriority', 'low');
    img.setAttribute('aria-hidden', 'true');
    img.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;';

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      img.remove();
      resolve();
    };
    img.onload = settle;
    img.onerror = settle;
    document.body.appendChild(img);
  });
}

export function useProductImagePrefetch(products: Product[], enabled: boolean) {
  useEffect(() => {
    if (!enabled || products.length === 0 || started) return;
    if (!connectionAllowsPrefetch()) return;

    const queue = products.flatMap((product) =>
      getProductImageList(product).slice(0, IMAGES_PER_PRODUCT)
    );
    let next = 0;

    const pump = async () => {
      const worker = async () => {
        while (next < queue.length) {
          const src = queue[next++];
          if (src) await warmImage(src);
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    };

    let scheduled = true;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const start = () => {
      scheduled = false;
      if (started) return;
      started = true;
      void pump();
    };

    const idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(start, { timeout: 3000 })
      : window.setTimeout(start, 1200);

    return () => {
      if (!scheduled) return;
      if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      scheduled = false;
    };
  }, [enabled, products]);
}
