import { NextResponse } from 'next/server';
import { adminGuard } from '@/lib/roles';
import { databases, APPWRITE_DATABASE_ID, ID } from '@/lib/appwriteServer';

const COLLECTION_ID = 'instagram_showcase';
const CONFIG_DOC_ID = 'get_inspired_config';

export interface InstagramItem {
  id: string;
  image: string;
  instagramUrl?: string;
  caption?: string;
}

export interface InstagramData {
  title: string;
  handle: string;
  profileUrl: string;
  items: InstagramItem[];
}

const formatItem = (doc: any): InstagramItem => ({
  id: doc.$id,
  image: doc.image || '',
  instagramUrl: doc.instagramUrl || undefined,
  caption: doc.caption || undefined
});

const formatData = (config: any, docs: any[]): InstagramData => ({
  title: config?.title || '',
  handle: config?.handle || '',
  profileUrl: config?.profileUrl || '',
  items: docs
    .filter((doc) => doc.$id !== CONFIG_DOC_ID && doc.image)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map(formatItem)
});

async function readConfig(): Promise<any | null> {
  try {
    return await databases.getDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, CONFIG_DOC_ID);
  } catch (err: any) {
    if (err?.code === 404) return null;
    throw err;
  }
}

async function readPosts(): Promise<any[]> {
  const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID, []);
  return res.documents || [];
}

export async function GET() {
  try {
    const [config, docs] = await Promise.all([readConfig(), readPosts()]);
    return NextResponse.json(formatData(config, docs), {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (err: any) {
    console.error('API /api/instagram error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load Instagram showcase' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const body = await req.json();
    const items: InstagramItem[] = (Array.isArray(body?.items) ? body.items : []).filter(
      (item: any) => item && item.image
    );

    const configFields = {
      title: String(body?.title || ''),
      handle: String(body?.handle || ''),
      profileUrl: String(body?.profileUrl || '').trim() || null
    };

    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, CONFIG_DOC_ID, configFields);
    } catch (err: any) {
      if (err?.code !== 404) throw err;
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, CONFIG_DOC_ID, configFields);
    }

    const existing = (await readPosts()).filter((doc) => doc.$id !== CONFIG_DOC_ID);
    const existingIds = new Set(existing.map((doc) => doc.$id));
    const incomingIds = new Set<string>();

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const fields = {
        image: item.image,
        instagramUrl: item.instagramUrl || null,
        caption: item.caption || '',
        sortOrder: index
      };
      const clientId = typeof item.id === 'string' ? item.id : '';
      const reusableId = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/.test(clientId);

      if (clientId && existingIds.has(clientId)) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, clientId, fields);
        incomingIds.add(clientId);
      } else {
        const created = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_ID,
          reusableId ? clientId : ID.unique(),
          fields
        );
        incomingIds.add(created.$id);
      }
    }

    const removed = existing.filter((doc) => !incomingIds.has(doc.$id));
    await Promise.all(
      removed.map((doc) => databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID, doc.$id))
    );

    const [config, docs] = await Promise.all([readConfig(), readPosts()]);
    return NextResponse.json(formatData(config, docs));
  } catch (err: any) {
    console.error('API /api/instagram save error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save Instagram showcase' }, { status: 500 });
  }
}
