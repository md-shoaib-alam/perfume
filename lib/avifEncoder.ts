import sharp from 'sharp';
import { UPLOAD_PROFILES, type UploadProfile } from './uploadProfiles';

// One AVIF encode at upload time; every visitor then downloads the same file.
const AVIF_EFFORT = 3;

const CONVERTIBLE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/tiff',
  'image/heic',
  'image/heif'
]);

export function isConvertibleImage(file: File): boolean {
  return CONVERTIBLE_TYPES.has(file.type);
}

/**
 * Re-encodes a raster image to AVIF capped at the profile's max dimension.
 * EXIF orientation is baked in; alpha survives. Throws on decode/encode failure
 * so callers can fall back to the original file.
 */
export async function encodeAvif(
  file: File,
  profile: UploadProfile = 'default'
): Promise<File> {
  const { maxDimension, avifQuality } = UPLOAD_PROFILES[profile];
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true
    })
    .avif({ quality: avifQuality, effort: AVIF_EFFORT })
    .toBuffer();

  const name = file.name.replace(/\.[^/.]+$/, '') + '.avif';
  return new File([output], name, { type: 'image/avif', lastModified: Date.now() });
}
