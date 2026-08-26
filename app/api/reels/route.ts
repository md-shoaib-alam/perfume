import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_reels.json');

// Helper to read data safely
function readReels() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data_reels.json:', e);
  }
  return [
    {
      id: 'reel-1',
      title: 'Dark Cacao',
      price: 'Rs. 8,500',
      subtitle: 'By Midnight',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'reel-2',
      title: 'Haute Vetiver',
      price: 'Rs. 8,500',
      subtitle: 'Master Perfumer Gloves',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80'
    }
  ];
}

// Helper to write data safely
function writeReels(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing data_reels.json:', e);
  }
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
