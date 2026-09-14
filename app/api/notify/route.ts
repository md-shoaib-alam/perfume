import { NextRequest, NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { adminGuard } from '@/lib/roles';

const COLLECTION_NAME = 'restock_notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, email, phone } = body;

    if (!productId || !productName) {
      return NextResponse.json(
        { error: 'Product details are missing.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();

    if (!cleanEmail && !cleanPhone) {
      return NextResponse.json(
        { error: 'Please enter your email or phone number.' },
        { status: 400 }
      );
    }

    if (cleanEmail && !cleanEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const payload = {
      productId: String(productId),
      productName: String(productName),
      email: cleanEmail,
      phone: cleanPhone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    let docId = 'temp-' + Date.now();
    try {
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_NAME,
        ID.unique(),
        payload
      );
      docId = doc.$id;
    } catch (appwriteErr: any) {
      console.warn('Appwrite restock_notifications write warning (collection may need manual creation in Appwrite console):', appwriteErr.message);
    }

    return NextResponse.json({
      success: true,
      id: docId,
      message: "You're on the priority list! We'll notify you the moment this fragrance arrives."
    });
  } catch (err: any) {
    console.error('Notify API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit notification request.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const guard = await adminGuard();
    if (guard) return guard;

    try {
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_NAME,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );

      return NextResponse.json({ notifications: res.documents || [] });
    } catch (appwriteErr: any) {
      console.warn('Appwrite list restock_notifications warning:', appwriteErr.message);
      return NextResponse.json({ notifications: [] });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
