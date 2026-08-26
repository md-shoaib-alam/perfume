import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_profiles.json');

function readProfiles(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data_profiles.json:', e);
  }
  return {};
}

function writeProfiles(data: Record<string, any>) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = readProfiles();
    const userProfile = profiles[userId] || {
      phone: '',
      address: '',
      city: '',
      pincode: '',
      wishlist: [],
      recentViews: []
    };
    return NextResponse.json(userProfile);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId: _bodyUserId, ...profileData } = body;

    const profiles = readProfiles();
    profiles[userId] = {
      ...(profiles[userId] || {}),
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    writeProfiles(profiles);
    return NextResponse.json({ success: true, profile: profiles[userId] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save profile' }, { status: 500 });
  }
}
