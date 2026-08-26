import { Client, Account, Databases, Storage, ID } from "appwrite";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

const client = new Client();
if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
}


const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

/**
 * Uploads an image or video file directly to the Appwrite Storage bucket (perfume_media)
 * and returns the direct public URL for viewing/streaming.
 */
export async function uploadMediaToAppwrite(file: File): Promise<string> {
  // If running in browser environment, route through /api/upload
  if (typeof window !== 'undefined') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (err) {
      console.warn('API /api/upload failed, trying direct SDK:', err);
    }
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
