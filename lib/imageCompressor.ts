/**
 * Automatic Client-Side Image Compression to WebP
 * Converts heavy raw images (e.g. 10MB - 25MB) into crisp, optimized WebP (~200KB - 400KB)
 * before uploading to Appwrite Storage to save bandwidth and storage.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85
): Promise<File> {
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

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now()
            });

            console.log(
              `[Image Compressor] Compressed "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) -> "${cleanName}" (${(compressedFile.size / 1024).toFixed(1)} KB)`
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
