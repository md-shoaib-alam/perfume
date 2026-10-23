import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID, ID, Query } from '@/lib/appwriteServer';
import { adminGuard } from '@/lib/roles';

export async function GET() {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'settings', [Query.limit(1)]);
    return NextResponse.json(res.documents?.[0] ?? null);
  } catch (err: any) {
    console.error('API /api/settings GET error:', err);
    return NextResponse.json(null);
  }
}

export async function PUT(req: Request) {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const body = await req.json();
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(body || {})) {
      if (!key.startsWith('$')) data[key] = value;
    }

    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'settings', [Query.limit(1)]);
    const doc = existing.documents?.length
      ? await databases.updateDocument(APPWRITE_DATABASE_ID, 'settings', existing.documents[0].$id, data)
      : await databases.createDocument(APPWRITE_DATABASE_ID, 'settings', ID.unique(), data);

    return NextResponse.json(doc);
  } catch (err: any) {
    console.error('API /api/settings PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save settings' }, { status: 500 });
  }
}
