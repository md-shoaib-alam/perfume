import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const formatCollectionDoc = (doc: any) => ({
  id: doc.$id || doc.id,
  name: doc.name || '',
  subname: doc.subname || '',
  image: doc.image || ''
});

export async function GET() {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'collections', [Query.limit(50)]);
    const colls = (res.documents || []).map(formatCollectionDoc);
    return NextResponse.json(colls);
  } catch (err: any) {
    console.error('API /api/collections error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'collections',
      ID.unique(),
      {
        name: body.name,
        subname: body.subname || 'Collection',
        image: body.image
      }
    );
    return NextResponse.json(formatCollectionDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, updates } = await req.json();
    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      'collections',
      id,
      updates
    );
    return NextResponse.json(formatCollectionDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await databases.deleteDocument(APPWRITE_DATABASE_ID, 'collections', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
