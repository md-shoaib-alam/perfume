import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_reels.json');

// Helper to read data safely
function readReels() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading data_reels.json:', e);
  }
  return [];
}

// Helper to write data
function writeReels(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = readReels();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    writeReels(body);
    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    console.error('Error in /api/reels POST:', err);
    return NextResponse.json({ error: err.message || 'Failed to persist reels' }, { status: 500 });
  }
}
