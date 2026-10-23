import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID, ID, Query } from '@/lib/appwriteServer';
import { auth } from '@clerk/nextjs/server';
import { adminGuard } from '@/lib/roles';

const formatReviewDoc = (d: any) => ({
  id: d.$id,
  author: d.author,
  rating: Number(d.rating) || 5,
  date: d.date || 'Recent',
  title: d.title || '',
  comment: d.comment,
  verified: Boolean(d.verified),
  productName: d.productName,
  approved: d.approved !== undefined ? Boolean(d.approved) : true,
  image: d.image || undefined
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productName = searchParams.get('productName');

    const queries: string[] = [Query.limit(100), Query.orderDesc('$createdAt')];
    if (productName) {
      queries.push(Query.equal('productName', productName));
    }

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'reviews', queries);

    // Drop duplicate rows by id and by identical product/author/comment content
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    const reviews: any[] = [];

    for (const d of res.documents || []) {
      if (!d || !d.$id || seenIds.has(d.$id)) continue;
      seenIds.add(d.$id);

      const contentKey = `${(d.productName || '').trim().toLowerCase()}_${(d.author || '').trim().toLowerCase()}_${(d.comment || '').trim()}`;
      if (seenContent.has(contentKey)) continue;
      seenContent.add(contentKey);

      reviews.push(formatReviewDoc(d));
    }

    return NextResponse.json(reviews);
  } catch (err: any) {
    console.error('API /api/reviews GET error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 });
  }

  try {
    const review = await req.json();
    const prodName = String(review.productName || 'General').trim();
    const authorName = String(review.author || 'Verified Customer').trim();

    const data = {
      productName: prodName,
      author: authorName,
      rating: Number(review.rating || 5),
      title: review.title || '',
      comment: review.comment || '',
      verified: true,
      approved: true,
      date: new Date().toISOString().split('T')[0]
    };

    // A customer re-reviewing the same fragrance replaces their previous row
    const existingRes = await databases.listDocuments(APPWRITE_DATABASE_ID, 'reviews', [
      Query.limit(100),
      ...(prodName !== 'General' ? [Query.equal('productName', prodName)] : [])
    ]);
    const match = (existingRes.documents || []).find((d) => {
      const authorMatches = (d.author || '').trim().toLowerCase() === authorName.toLowerCase();
      const productMatches = (d.productName || '').trim().toLowerCase() === prodName.toLowerCase();
      return authorMatches && (prodName === 'General' || productMatches);
    });

    const doc = match
      ? await databases.updateDocument(APPWRITE_DATABASE_ID, 'reviews', match.$id, data)
      : await databases.createDocument(APPWRITE_DATABASE_ID, 'reviews', ID.unique(), data);

    return NextResponse.json(formatReviewDoc(doc));
  } catch (err: any) {
    console.error('API /api/reviews POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // Admins moderate reviews; a customer must never edit another person's review
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const { id, updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing review id' }, { status: 400 });

    const allowed = ['productName', 'author', 'rating', 'title', 'comment', 'verified', 'approved', 'date', 'image'];
    const cleanData: any = {};
    for (const key of allowed) {
      if (updates?.[key] !== undefined) cleanData[key] = updates[key];
    }

    const doc = await databases.updateDocument(APPWRITE_DATABASE_ID, 'reviews', id, cleanData);
    return NextResponse.json(formatReviewDoc(doc));
  } catch (err: any) {
    console.error('API /api/reviews PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing review id' }, { status: 400 });

    await databases.deleteDocument(APPWRITE_DATABASE_ID, 'reviews', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/reviews DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete review' }, { status: 500 });
  }
}
