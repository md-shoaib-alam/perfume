import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export async function POST() {
  try {
    const client = await clerkClient();
    const clerkUsersResponse = await client.users.getUserList({ limit: 500 });
    const clerkUsers = clerkUsersResponse.data || [];

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const u of clerkUsers) {
      const email = u.emailAddresses?.[0]?.emailAddress || '';
      const phone = u.phoneNumbers?.[0]?.phoneNumber || '';
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || email.split('@')[0] || 'Customer';

      const appwritePayload = {
        userId: u.id,
        email,
        name,
        phone,
        address: '',
        city: '',
        pincode: '',
        lastLoginAt: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : new Date().toISOString()
      };

      try {
        if (APPWRITE_DATABASE_ID) {
          const existing = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            'users',
            [Query.equal('userId', u.id), Query.limit(1)]
          );

          if (existing.documents && existing.documents.length > 0) {
            await databases.updateDocument(
              APPWRITE_DATABASE_ID,
              'users',
              existing.documents[0].$id,
              appwritePayload
            );
            updatedCount++;
          } else {
            await databases.createDocument(
              APPWRITE_DATABASE_ID,
              'users',
              ID.unique(),
              appwritePayload
            );
            createdCount++;
          }
        }
      } catch (err: any) {
        console.warn(`Error syncing user ${u.id} to Appwrite:`, err.message || err);
        errors.push(`${u.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalClerkUsers: clerkUsers.length,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err: any) {
    console.error('Failed to sync all users:', err);
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}
