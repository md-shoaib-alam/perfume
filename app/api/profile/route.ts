import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export async function GET() {
  try {
    // Only the authenticated user's own profile may be read — never trust a
    // client-supplied userId param.
    const { userId: authUserId } = await auth();
    const resolvedUserId = authUserId;

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!APPWRITE_DATABASE_ID) {
      return NextResponse.json({
        phone: '',
        address: '',
        city: '',
        pincode: '',
        wishlist: [],
        recentViews: []
      });
    }

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'users', [
      Query.equal('userId', resolvedUserId),
      Query.limit(1)
    ]);

    if (res.documents && res.documents.length > 0) {
      const doc = res.documents[0];
      return NextResponse.json({
        name: doc.name || '',
        email: doc.email || '',
        phone: doc.phone || '',
        address: doc.address || '',
        city: doc.city || '',
        pincode: doc.pincode || '',
        wishlist: [],
        recentViews: []
      });
    }

    return NextResponse.json({
      phone: '',
      address: '',
      city: '',
      pincode: '',
      wishlist: [],
      recentViews: []
    });
  } catch (err: any) {
    console.warn('API /api/profile GET error:', err);
    return NextResponse.json({
      phone: '',
      address: '',
      city: '',
      pincode: '',
      wishlist: [],
      recentViews: []
    });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: authUserId } = await auth();
    const body = await req.json();
    // Writes are limited to the caller's own record; body.userId is ignored.
    const resolvedUserId = authUserId;

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!APPWRITE_DATABASE_ID) {
      throw new Error('APPWRITE_DATABASE_ID is not configured');
    }

    const payload = {
      userId: resolvedUserId,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      city: body.city || '',
      pincode: body.pincode || '',
      lastLoginAt: new Date().toISOString()
    };

    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, 'users', [
      Query.equal('userId', resolvedUserId),
      Query.limit(1)
    ]);

    let savedDoc;
    if (existing.documents && existing.documents.length > 0) {
      savedDoc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'users',
        existing.documents[0].$id,
        payload
      );
    } else {
      savedDoc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'users',
        ID.unique(),
        payload
      );
    }

    return NextResponse.json({ success: true, profile: savedDoc });
  } catch (err: any) {
    console.error('API /api/profile POST error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to save profile' }, { status: 500 });
  }
}

