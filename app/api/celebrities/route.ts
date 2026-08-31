import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { adminGuard } from '@/lib/roles';

const DATA_FILE = path.join(process.cwd(), 'data_celebrities.json');

function readCelebrities() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading data_celebrities.json:', e);
  }
  return [];
}

function writeCelebrities(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = readCelebrities();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const body = await req.json();
    writeCelebrities(body);
    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save celebrities data' }, { status: 500 });
  }
}
