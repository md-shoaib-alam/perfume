import { NextResponse } from 'next/server';
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
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing data_profiles.json:', e);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'guest';
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
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...profileData } = body;
    const key = userId || 'guest';

    const profiles = readProfiles();
    profiles[key] = {
      ...(profiles[key] || {}),
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    writeProfiles(profiles);
    return NextResponse.json({ success: true, profile: profiles[key] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
