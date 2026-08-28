import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const formatHeroDoc = (doc: any) => ({
  id: doc.$id || doc.id,
  name: doc.name || 'Hero Slide',
  desktopImage: doc.desktopImage || '',
  mobileImage: doc.mobileImage || doc.desktopImage || '',
  linkUrl: doc.linkUrl || '/'
});

export async function GET() {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'hero_slides', [Query.limit(50)]);
    const slides = (res.documents || []).map(formatHeroDoc);
    return NextResponse.json(slides, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (err: any) {
    console.error('API /api/hero error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'hero_slides',
      ID.unique(),
      {
        name: body.name || 'Hero Slide',
        desktopImage: body.desktopImage,
        mobileImage: body.mobileImage || body.desktopImage,
        linkUrl: body.linkUrl || '/'
      }
    );
    return NextResponse.json(formatHeroDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await databases.deleteDocument(APPWRITE_DATABASE_ID, 'hero_slides', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
