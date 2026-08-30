import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const PLACEHOLDER_IMAGE = 'https://bakhoorbliss.in/placeholder-circle.png';

const formatCollectionDoc = (doc: any) => ({
  id: doc.$id || doc.id,
  slug: doc.slug || '',
  name: doc.name || '',
  subname: doc.subname || '',
  image: doc.image && doc.image !== PLACEHOLDER_IMAGE ? doc.image : '',
  bannerImage: doc.bannerImage || '',
  campaignImage: doc.campaignImage || '',
  subtitle: doc.subtitle || '',
  editorial: doc.editorial || '',
  badge: doc.badge || '',
  showInStoryCircle: Boolean(doc.showInStoryCircle)
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

const sanitizeUrl = (val: any) => {
  if (typeof val === 'string' && (val.trim().startsWith('http://') || val.trim().startsWith('https://'))) {
    return val.trim();
  }
  return null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cleanData: any = {
      name: body.name || 'Untitled Collection',
      subname: body.subname || 'Collection'
    };
    if (body.slug) cleanData.slug = body.slug;
    
    const validImg = sanitizeUrl(body.image);
    const validBanner = sanitizeUrl(body.bannerImage);
    const validCampaign = sanitizeUrl(body.campaignImage);

    // Appwrite collections schema has `image` as required, so provide valid fallback if empty
    cleanData.image = validImg || validCampaign || validBanner || PLACEHOLDER_IMAGE;
    if (validBanner) cleanData.bannerImage = validBanner;
    if (validCampaign) cleanData.campaignImage = validCampaign;
    if (body.showInStoryCircle !== undefined) cleanData.showInStoryCircle = Boolean(body.showInStoryCircle);

    if (body.subtitle !== undefined) cleanData.subtitle = body.subtitle || '';
    if (body.editorial !== undefined) cleanData.editorial = body.editorial || '';
    if (body.badge !== undefined) cleanData.badge = body.badge || '';

    try {
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'collections',
        ID.unique(),
        cleanData
      );
      return NextResponse.json(formatCollectionDoc(doc));
    } catch (createErr: any) {
      // If campaignImage or showInStoryCircle attribute doesn't exist yet in Appwrite, retry without them
      if (createErr?.message?.includes('campaignImage') || createErr?.message?.includes('showInStoryCircle')) {
        delete cleanData.campaignImage;
        delete cleanData.showInStoryCircle;
        const doc = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          'collections',
          ID.unique(),
          cleanData
        );
        return NextResponse.json(formatCollectionDoc(doc));
      }
      throw createErr;
    }
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
    if (updates.slug !== undefined) cleanUpdates.slug = updates.slug;
    if (updates.subtitle !== undefined) cleanUpdates.subtitle = updates.subtitle;
    if (updates.editorial !== undefined) cleanUpdates.editorial = updates.editorial;
    if (updates.badge !== undefined) cleanUpdates.badge = updates.badge;

    const validImg = sanitizeUrl(updates.image);
    const validBanner = sanitizeUrl(updates.bannerImage);
    const validCampaign = sanitizeUrl(updates.campaignImage);

    if (validImg !== undefined) cleanUpdates.image = validImg;
    if (validBanner !== undefined) cleanUpdates.bannerImage = validBanner;
    if (validCampaign !== undefined) cleanUpdates.campaignImage = validCampaign;
    if (updates.showInStoryCircle !== undefined) cleanUpdates.showInStoryCircle = Boolean(updates.showInStoryCircle);

    try {
      const doc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'collections',
        id,
        cleanUpdates
      );
      return NextResponse.json(formatCollectionDoc(doc));
    } catch (updateErr: any) {
      // If campaignImage or showInStoryCircle attribute doesn't exist yet in Appwrite, retry without them
      if (updateErr?.message?.includes('campaignImage') || updateErr?.message?.includes('showInStoryCircle')) {
        delete cleanUpdates.campaignImage;
        delete cleanUpdates.showInStoryCircle;
        const doc = await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          'collections',
          id,
          cleanUpdates
        );
        return NextResponse.json(formatCollectionDoc(doc));
      }
      throw updateErr;
    }
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
