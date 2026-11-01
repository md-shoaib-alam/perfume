// Client-safe: imported by admin uploaders and by the server AVIF encoder.
export type UploadProfile = 'default' | 'hero';

export const UPLOAD_PROFILES = {
  default: { maxDimension: 2000, intermediateQuality: 0.9, avifQuality: 58 },
  hero: { maxDimension: 2560, intermediateQuality: 0.95, avifQuality: 68 }
} as const;

export function isUploadProfile(value: unknown): value is UploadProfile {
  return value === 'default' || value === 'hero';
}
