import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_users.json');

function readUsers(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading data_users.json:', e);
  }
  return [];
}

function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing data_users.json:', e);
  }
}

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

    // 1. Sync to local database
    const users = readUsers();
    const existingIdx = users.findIndex(u => (userId && u.userId === userId) || (email && u.email === email));
    if (existingIdx >= 0) {
      users[existingIdx] = { ...users[existingIdx], ...userData };
    } else {
      users.push({ ...userData, createdAt: new Date().toISOString() });
    }
    writeUsers(users);

    // 2. Direct Sync to Appwrite 'users' table (matching columns exactly)
    let appwriteDoc = null;
    try {
      if (APPWRITE_DATABASE_ID) {
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

        if (existingDocs.documents && existingDocs.documents.length > 0) {
          appwriteDoc = await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            'users',
            existingDocs.documents[0].$id,
            appwritePayload
          );
          console.log(`[Appwrite Sync] Updated user in DB: ${userData.userId}`);
        } else {
          appwriteDoc = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            'users',
            ID.unique(),
            appwritePayload
          );
          console.log(`[Appwrite Sync] Created new user in DB: ${userData.userId}`);
        }
      }
    } catch (appwriteErr: any) {
      console.error('[Appwrite Sync Error]:', appwriteErr.message || appwriteErr);
    }

    return NextResponse.json({ success: true, user: userData, appwriteSynced: !!appwriteDoc });
  } catch (err: any) {
    console.error('User sync endpoint error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const users = readUsers();
  return NextResponse.json(users);
}
