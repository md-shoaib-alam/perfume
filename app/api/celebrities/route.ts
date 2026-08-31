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
      if (Array.isArray(parsed)) {
        return {
          title: 'Worn by 100k+ fragheads, including',
          items: parsed
        };
      }
      if (parsed && typeof parsed === 'object') {
        return {
          title: parsed.title || 'Worn by 100k+ fragheads, including',
          items: Array.isArray(parsed.items) ? parsed.items : []
        };
      }
    }
  } catch (e) {
    console.error('Error reading data_celebrities.json:', e);
  }
  return {
    title: 'Worn by 100k+ fragheads, including',
    items: []
  };
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
    let dataToSave;
    if (Array.isArray(body)) {
      const existing = readCelebrities();
      dataToSave = {
        title: existing.title || 'Worn by 100k+ fragheads, including',
        items: body
      };
    } else if (body && typeof body === 'object') {
      dataToSave = {
        title: body.title || 'Worn by 100k+ fragheads, including',
        items: Array.isArray(body.items) ? body.items : (Array.isArray(body.celebrities) ? body.celebrities : [])
      };
    } else {
      dataToSave = {
        title: 'Worn by 100k+ fragheads, including',
        items: []
      };
    }

    writeCelebrities(dataToSave);
    return NextResponse.json({ success: true, data: dataToSave });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save celebrities data' }, { status: 500 });
  }
}
