import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_press.json');

function readPress() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data_press.json:', e);
  }
  return [];
}

function writePress(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = readPress();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    writePress(body);
    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save press data' }, { status: 500 });
  }
}
