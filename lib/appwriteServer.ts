import { Client, Databases, Storage, ID, Query, Permission, Role } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const APPWRITE_BUCKET_ID =
  process.env.APPWRITE_BUCKET_ID || process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || process.env.APPWRITE_API_SECRET || '';

function createClient(): Client {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    throw new Error(
      'Appwrite server client misconfigured: APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID are missing.'
    );
  }
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  if (APPWRITE_API_KEY) {
    return client.setKey(APPWRITE_API_KEY);
  }
  // Keyless mode acts as a guest and relies on public table permissions.
  // Add APPWRITE_API_KEY before those permissions are tightened.
  console.warn('[appwrite] APPWRITE_API_KEY not set; using guest permissions.');
  return client;
}

// Built on first use so `next build` never evaluates client setup without request-time env.
function lazyService<T extends object>(create: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, prop) {
      if (!instance) instance = create();
      const value = Reflect.get(instance as T, prop);
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
    },
  });
}

const databases = lazyService(() => new Databases(createClient()));
const storage = lazyService(() => new Storage(createClient()));

/**
 * Public view URL for a bucket file. node-appwrite's getFileView returns bytes,
 * so storefront URLs are built from the endpoint instead.
 */
export function getMediaViewUrl(fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export async function uploadMediaToAppwrite(file: File): Promise<string> {
  const fileId = ID.unique();
  const uploaded = await storage.createFile(
    APPWRITE_BUCKET_ID,
    fileId,
    // InputFile keeps a Blob-like source without copying bytes; the SDK's own
    // instanceof check only recognises undici.File, not Node's global File.
    InputFile.fromBuffer(file, file.name || 'media'),
    [Permission.read(Role.any())]
  );
  return getMediaViewUrl(uploaded.$id);
}

function extractAppwriteFileId(urlOrId: string): string | null {
  const trimmed = (urlOrId || '').trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed) && !trimmed.startsWith('http')) return trimmed;
  const match = trimmed.match(/\/files\/([a-zA-Z0-9_.-]+)/);
  return match?.[1] ?? null;
}

export async function deleteMediaFromAppwrite(urlOrFileId: string): Promise<boolean> {
  const fileId = extractAppwriteFileId(urlOrFileId);
  if (!fileId) return false;
  try {
    await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
    return true;
  } catch (err: any) {
    console.warn(`Appwrite deleteFile failed for ${fileId}:`, err?.message || err);
    return false;
  }
}

export {
  databases,
  storage,
  ID,
  Query,
  Permission,
  Role,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_BUCKET_ID,
};
