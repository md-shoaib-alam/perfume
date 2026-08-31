/**
 * Ultra-Efficient Client-Side Image Compression (WebP & AVIF)
 * Converts heavy raw photos (e.g. 5MB - 20MB) into ultra-lightweight, high-fidelity
 * WebP / AVIF assets (~25KB - 80KB) before uploading to Appwrite Cloud Storage.
 * Saves enormous storage quota and gives instant storefront page loads.
 */

// Helper to check if browser canvas supports AVIF export
let _avifSupported: boolean | null = null;
function checkAvifSupport(): boolean {
  if (typeof window === 'undefined') return false;
  if (_avifSupported !== null) return _avifSupported;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/avif');
    _avifSupported = dataUrl.startsWith('data:image/avif');
  } catch {
    _avifSupported = false;
  }
  return _avifSupported;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  preferAvif?: boolean;
}

export async function compressImageToWebP(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.75
): Promise<File> {
  return compressImage(file, { maxWidth, maxHeight, quality, preferAvif: true });
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.72,
    preferAvif = true
  } = options;

  // If not an image (e.g. video), return original file
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If already small SVG or gif, return original file
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          return resolve(file); // Fallback to original
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine target mime type (AVIF if preferred and supported, else WebP)
        const canUseAvif = preferAvif && checkAvifSupport();
        const mimeType = canUseAvif ? 'image/avif' : 'image/webp';
        const extension = canUseAvif ? '.avif' : '.webp';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to WebP if AVIF failed
              canvas.toBlob(
                (fallbackBlob) => {
                  if (!fallbackBlob) return resolve(file);
                  const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                  const finalFile = new File([fallbackBlob], cleanName, {
                    type: 'image/webp',
                    lastModified: Date.now()
                  });
                  resolve(finalFile);
                },
                'image/webp',
                quality
              );
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + extension;
            const compressedFile = new File([blob], cleanName, {
              type: mimeType,
              lastModified: Date.now()
            });

            console.log(
              `[Image Compressor] Highly compressed "${file.name}" (${(file.size / 1024).toFixed(1)} KB) -> "${cleanName}" (${(compressedFile.size / 1024).toFixed(1)} KB) [Saved: ${(
                (1 - compressedFile.size / file.size) *
                100
              ).toFixed(0)}%]`
            );

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback on decode error
      };
    };

    reader.onerror = () => {
      resolve(file); // Fallback on read error
    };
  });
}
