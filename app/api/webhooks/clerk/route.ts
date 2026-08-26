import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, data } = payload;

    if (!data || !data.id) {
      return NextResponse.json({ received: true });
    }

    const userId = data.id;
    const email = data.email_addresses?.[0]?.email_address || '';
    const phone = data.phone_numbers?.[0]?.phone_number || '';
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || email.split('@')[0] || 'Customer';

    if (type === 'user.created' || type === 'user.updated') {
      const userData = {
        userId,
        email,
        name,
        phone,
        lastLoginAt: data.last_sign_in_at ? new Date(data.last_sign_in_at).toISOString() : new Date().toISOString()
      };

      if (APPWRITE_DATABASE_ID) {
        const existing = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          'users',
          [Query.equal('userId', userId)]
        );

        if (existing.documents && existing.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            'users',
            existing.documents[0].$id,
            userData
          );
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            'users',
            ID.unique(),
            userData
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
            APPWRITE_DATABASE_ID,
            'users',
            existing.documents[0].$id
          );
        }
      }
    }

    return NextResponse.json({ success: true, event: type });
  } catch (err: any) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
