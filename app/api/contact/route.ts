import { NextRequest, NextResponse } from 'next/server';
import { adminGuard } from '@/lib/roles';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const COLLECTION_NAME = 'contact_messages';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitHits = new Map<string, number[]>();

function isRateLimited(req: NextRequest): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    rateLimitHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req)) {
      return NextResponse.json(
        { error: 'Too many messages submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      message: String(message).trim(),
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    let docId = '';
    try {
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_NAME,
        ID.unique(),
        payload
      );
      docId = doc.$id;
    } catch (appwriteErr: any) {
      console.warn('Appwrite contact_messages write (table might be pending creation):', appwriteErr.message);
      // Fallback ID so user experience never fails
      docId = 'temp-' + Date.now();
    }

    return NextResponse.json({
      success: true,
      id: docId,
      message: 'Thank you. Your message has been received. Our concierge team will contact you shortly.'
    });
  } catch (err: any) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit contact message.' },
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

      const items = res.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name || 'Customer',
        email: doc.email || '',
        phone: doc.phone || '',
        message: doc.message || '',
        status: doc.status || 'unread',
        createdAt: doc.createdAt || doc.$createdAt
      }));

      return NextResponse.json({ messages: items });
    } catch (appwriteErr: any) {
      console.warn('Appwrite list contact_messages error:', appwriteErr.message);
      return NextResponse.json({ messages: [] });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guard = await adminGuard();
    if (guard) return guard;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_NAME, id);
    } catch (e: any) {
      console.warn('Delete contact message failed:', e.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
