import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const formatProductDoc = (doc: any) => {
  let parsedNotes = { top: [], heart: [], base: [] };
  if (doc.notes) {
    try {
      parsedNotes = typeof doc.notes === 'string' ? JSON.parse(doc.notes) : doc.notes;
    } catch (e) {
      parsedNotes = { top: [doc.notes], heart: [], base: [] };
    }
  }

  return {
    id: doc.$id || doc.id,
    name: doc.name || 'Untitled Perfume',
    subtitle: doc.subtitle || '',
    category: doc.category || 'extrait-de-parfum',
    gender: doc.gender || 'Unisex',
    price: Number(doc.price) || 0,
    originalPrice: Number(doc.originalPrice || doc.price) || 0,
    rating: Number(doc.rating) || 4.8,
    reviewsCount: Number(doc.reviewsCount) || 0,
    volume: doc.volume || '100ml',
    image: doc.image || '',
    hoverImage: doc.hoverImage || doc.image || '',
    isBestseller: Boolean(doc.isBestseller),
    isNew: Boolean(doc.isNew),
    isPreOrder: Boolean(doc.isPreOrder),
    shippingNote: doc.shippingNote || '',
    buttonText: doc.buttonText || '',
    tagline: doc.tagline || '',
    badgeText: doc.badgeText || '',
    badgeSubtext: doc.badgeSubtext || '',
    notes: parsedNotes,
    description: doc.description || '',
    stock: Number(doc.stock) || 100,
    sizeOptions: [
      { size: '15ml', price: Math.round(Number(doc.price) * 0.25), originalPrice: Math.round(Number(doc.originalPrice || doc.price) * 0.25), isSoldOut: false },
      { size: '50ml', price: Math.round(Number(doc.price) * 0.65), originalPrice: Math.round(Number(doc.originalPrice || doc.price) * 0.65), isSoldOut: false },
      { size: '100ml', price: Number(doc.price), originalPrice: Number(doc.originalPrice || doc.price), isSoldOut: false }
    ]
  };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const id = searchParams.get('id');

    if (id) {
      const doc = await databases.getDocument(APPWRITE_DATABASE_ID, 'products', id);
      return NextResponse.json(formatProductDoc(doc));
    }

    const queries: string[] = [Query.limit(100)];
    if (category) queries.push(Query.equal('category', category));
    if (gender && gender !== 'All') queries.push(Query.equal('gender', gender));

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'products', queries);
    const products = (res.documents || []).map(formatProductDoc);
    return NextResponse.json(products);
  } catch (err: any) {
    console.error('API /api/products error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const product = await req.json();
    const docData: any = {
      name: product.name || 'Untitled Perfume',
      subtitle: product.subtitle || '',
      category: product.category || 'extrait-de-parfum',
      gender: product.gender || 'Unisex',
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
      rating: Number(product.rating || 4.8),
      reviewsCount: Number(product.reviewsCount || 0),
      volume: product.volume || '100ml',
      image: product.image || '',
      hoverImage: product.hoverImage || product.image || '',
      description: product.description || '',
      notes: JSON.stringify(product.notes || {}),
      isBestseller: Boolean(product.isBestseller),
      isNew: Boolean(product.isNew),
      stock: 100
    };

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'products',
      ID.unique(),
      docData
    );
    return NextResponse.json(formatProductDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, updates } = await req.json();
    const cleanData: any = {};
    if (updates.name !== undefined) cleanData.name = updates.name;
    if (updates.subtitle !== undefined) cleanData.subtitle = updates.subtitle;
    if (updates.category !== undefined) cleanData.category = updates.category;
    if (updates.gender !== undefined) cleanData.gender = updates.gender;
    if (updates.price !== undefined) cleanData.price = Number(updates.price);
    if (updates.originalPrice !== undefined) cleanData.originalPrice = Number(updates.originalPrice);
    if (updates.rating !== undefined) cleanData.rating = Number(updates.rating);
    if (updates.reviewsCount !== undefined) cleanData.reviewsCount = Number(updates.reviewsCount);
    if (updates.volume !== undefined) cleanData.volume = updates.volume;
    if (updates.image !== undefined) cleanData.image = updates.image;
    if (updates.hoverImage !== undefined) cleanData.hoverImage = updates.hoverImage;
    if (updates.description !== undefined) cleanData.description = updates.description;
    if (updates.notes !== undefined) cleanData.notes = JSON.stringify(updates.notes);
    if (updates.isBestseller !== undefined) cleanData.isBestseller = Boolean(updates.isBestseller);
    if (updates.isNew !== undefined) cleanData.isNew = Boolean(updates.isNew);

    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      'products',
      id,
      cleanData
    );
    return NextResponse.json(formatProductDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await databases.deleteDocument(APPWRITE_DATABASE_ID, 'products', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
