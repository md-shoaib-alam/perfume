/**
 * Client-side downscale before upload.
 * Browsers cannot encode AVIF in canvas (Chrome silently returns PNG/WebP),
 * so this produces a high-quality WebP intermediate capped at 2000px and the
 * server performs the single AVIF encode that is stored and served.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImageToWebP(
  file: File,
  maxWidth = 2000,
  maxHeight = 2000,
  quality = 0.9
): Promise<File> {
  return compressImage(file, { maxWidth, maxHeight, quality });
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 2000, maxHeight = 2000, quality = 0.9 } = options;

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

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now()
            });

            console.log(
              `[Image Compressor] "${file.name}" (${(file.size / 1024).toFixed(1)} KB) -> "${cleanName}" (${(compressedFile.size / 1024).toFixed(1)} KB)`
            );

            resolve(compressedFile);
          },
          'image/webp',
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
