import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, firstName, lastName, phone, address, city, pincode } = body;

    if (!userId && !email && !phone) {
      return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });
    }

    const userData = {
      userId: userId || `user-${Date.now()}`,
      email: email || '',
      name: `${firstName || ''} ${lastName || ''}`.trim() || email?.split('@')[0] || 'Customer',
      phone: phone || '',
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      lastLoginAt: new Date().toISOString()
    };

    if (!APPWRITE_DATABASE_ID) {
      throw new Error('APPWRITE_DATABASE_ID is not configured');
    }

    const appwritePayload = {
      userId: userData.userId,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      pincode: userData.pincode,
      lastLoginAt: userData.lastLoginAt
    };

    const existingDocs = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      'users',
      [Query.equal('userId', userData.userId), Query.limit(1)]
    );

    let appwriteDoc;
    if (existingDocs.documents && existingDocs.documents.length > 0) {
      appwriteDoc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'users',
        existingDocs.documents[0].$id,
        appwritePayload
      );
    } else {
      appwriteDoc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        'users',
        ID.unique(),
        appwritePayload
      );
    }

    return NextResponse.json({ success: true, user: appwriteDoc });
  } catch (err: any) {
    console.error('Appwrite user sync error:', err);
    return NextResponse.json({ error: err.message || 'Failed to sync user to Appwrite' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!APPWRITE_DATABASE_ID) {
      throw new Error('APPWRITE_DATABASE_ID is not configured');
    }
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'users', [Query.limit(100)]);
    return NextResponse.json(res.documents || []);
  } catch (err: any) {
    console.error('Appwrite list users error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch users from Appwrite' }, { status: 500 });
  }
}
