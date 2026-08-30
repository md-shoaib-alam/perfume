import { Client, Account, Databases, Storage, ID } from "appwrite";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || process.env.APPWRITE_API_SECRET || '';

const client = new Client();
if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  if (APPWRITE_API_KEY && typeof window === 'undefined') {
    client.setKey(APPWRITE_API_KEY);
  }
}

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

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

  // If in browser, call DELETE /api/upload?fileId=...
  if (typeof window !== 'undefined') {
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
      console.warn('API DELETE /api/upload failed, trying direct SDK:', err);
    }
  }

  // Server-side or direct SDK Appwrite Storage deletion
  try {
    if (APPWRITE_BUCKET_ID) {
      await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
      return true;
    }
  } catch (err: any) {
    console.warn(`Appwrite deleteFile warning for ID ${fileId}:`, err?.message || err);
  }
  return false;
}

/**
 * Uploads an image or video file directly to the Appwrite Storage bucket (perfume_media)
 * with real-time percentage progress callback and returns the direct public URL.
 */
export async function uploadMediaToAppwrite(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  // If running in browser environment, route through /api/upload with XHR for exact live percentage tracking
  if (typeof window !== 'undefined') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

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
          } catch (e: any) {
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

  // Server-side or direct SDK Appwrite Storage upload
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }
    const fileId = ID.unique();
    const uploaded = await storage.createFile(
      APPWRITE_BUCKET_ID,
      fileId,
      file
    );
    const fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, uploaded.$id);
    if (onProgress) onProgress(100);
    return fileUrl.toString();
  } catch (err: any) {
    console.error("Appwrite Storage upload error:", err);
    throw new Error(err.message || "Failed to upload file to Appwrite Storage");
  }
}

export { 
  client, 
  account, 
  databases, 
  storage, 
  APPWRITE_DATABASE_ID, 
  APPWRITE_PROJECT_ID, 
  APPWRITE_ENDPOINT,
  APPWRITE_BUCKET_ID 
};
