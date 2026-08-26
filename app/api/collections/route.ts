import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const formatCollectionDoc = (doc: any) => ({
  id: doc.$id || doc.id,
  slug: doc.slug || '',
  name: doc.name || '',
  subname: doc.subname || '',
  image: doc.image || '',
  bannerImage: doc.bannerImage || '',
  subtitle: doc.subtitle || '',
  editorial: doc.editorial || '',
  badge: doc.badge || ''
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
    const cleanData: any = {
      name: body.name || 'Untitled Collection',
      subname: body.subname || 'Collection',
      image: body.image || ''
    };
    if (body.slug) cleanData.slug = body.slug;
    if (body.bannerImage) cleanData.bannerImage = body.bannerImage;
    if (body.subtitle) cleanData.subtitle = body.subtitle;
    if (body.editorial) cleanData.editorial = body.editorial;
    if (body.badge) cleanData.badge = body.badge;

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'collections',
      ID.unique(),
      cleanData
    );
    return NextResponse.json(formatCollectionDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, updates } = await req.json();
    const cleanUpdates: any = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.subname !== undefined) cleanUpdates.subname = updates.subname;
    if (updates.image !== undefined) cleanUpdates.image = updates.image;
    if (updates.slug !== undefined) cleanUpdates.slug = updates.slug;
    if (updates.bannerImage !== undefined) cleanUpdates.bannerImage = updates.bannerImage;
    if (updates.subtitle !== undefined) cleanUpdates.subtitle = updates.subtitle;
    if (updates.editorial !== undefined) cleanUpdates.editorial = updates.editorial;
    if (updates.badge !== undefined) cleanUpdates.badge = updates.badge;

    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      'collections',
      id,
      cleanUpdates
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
