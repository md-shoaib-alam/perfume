import { Client } from "appwrite";
import type { UploadProfile } from "./uploadProfiles";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

// Browser client exists only for the connectivity ping in the admin shell.
// All data access and every media upload runs through guarded /api routes,
// because a browser-side Appwrite client cannot hold a secret key.
const client = new Client();
if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
}

/**
 * Extracts Appwrite storage file ID from a full Appwrite storage view/download URL.
 */
export function extractAppwriteFileId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed) && !trimmed.startsWith('http')) {
    return trimmed;
  }
  const match = trimmed.match(/\/files\/([a-zA-Z0-9_.-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Deletes a media file from the Appwrite Storage bucket (perfume_media) to prevent orphaned storage waste.
 */
export async function deleteMediaFromAppwrite(urlOrFileId: string): Promise<boolean> {
  const fileId = extractAppwriteFileId(urlOrFileId);
  if (!fileId) return false;

  try {
    const res = await fetch(`/api/upload?fileId=${encodeURIComponent(fileId)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        return true;
      }
    }
  } catch (err) {
    console.warn('API DELETE /api/upload failed:', err);
  }
  return false;
}

/**
 * Uploads an image or video file to the Appwrite Storage bucket (perfume_media)
 * with real-time percentage progress callback and returns the direct public URL.
 */
export async function uploadMediaToAppwrite(
  file: File,
  onProgress?: (percent: number) => void,
  profile: UploadProfile = 'default'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile', profile);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.url) {
            if (onProgress) onProgress(100);
            resolve(data.url);
          } else {
            reject(new Error(data.error || 'No URL returned from upload server'));
          }
        } catch {
          reject(new Error('Invalid response from upload server'));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during media upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Media upload was aborted'));
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

export {
  client,
  APPWRITE_PROJECT_ID,
  APPWRITE_ENDPOINT
};
