import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Webhook } from 'svix';

// Clerk signs every webhook with CLERK_WEBHOOK_SECRET.
// Verify with svix before trusting any payload.
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  // ── 1. Verify Clerk webhook signature (svix) ────────────────────────────
  if (!WEBHOOK_SECRET) {
    console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET is not set — rejecting all webhook calls');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const svixId        = req.headers.get('svix-id') ?? '';
  const svixTimestamp = req.headers.get('svix-timestamp') ?? '';
  const svixSignature = req.headers.get('svix-signature') ?? '';

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix verification headers' }, { status: 400 });
  }

  const rawBody = await req.text();

  let payload: any;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err: any) {
    console.warn('[clerk-webhook] Signature verification failed:', err?.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // ── 2. Process verified event ───────────────────────────────────────────
  try {
    const { type, data } = payload;

    if (!data || !data.id) {
      return NextResponse.json({ received: true });
    }

    const userId = data.id;
    const email  = data.email_addresses?.[0]?.email_address || '';
    const phone  = data.phone_numbers?.[0]?.phone_number || '';
    const name   = `${data.first_name || ''} ${data.last_name || ''}`.trim() || email.split('@')[0] || 'Customer';

    if (type === 'user.created' || type === 'user.updated') {
      const userData: Record<string, any> = {
        userId,
        email,
        name,
        phone,
        address: ''
      };

      if (APPWRITE_DATABASE_ID) {
        const existing = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          'users',
          [Query.equal('userId', userId)]
        );

        if (existing.documents && existing.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID, 'users', existing.documents[0].$id, userData
          );
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID, 'users', ID.unique(), userData
          );
        }
      }
    } else if (type === 'user.deleted') {
      if (APPWRITE_DATABASE_ID) {
        const existing = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          'users',
          [Query.equal('userId', userId)]
        );
        if (existing.documents && existing.documents.length > 0) {
          await databases.deleteDocument(
            APPWRITE_DATABASE_ID, 'users', existing.documents[0].$id
          );
        }
      }
    }

    return NextResponse.json({ success: true, event: type });
  } catch (err: any) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

