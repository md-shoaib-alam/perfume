import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_celebrities.json');

function readCelebrities() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data_celebrities.json:', e);
  }
  return [
    {
      id: 'allu',
      name: 'Allu Arjun',
      perfume: 'SIGNATURE SCENT',
      bottleThumb: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=200&q=80',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'raashii',
      name: 'Raashii Khanna',
      perfume: 'MEHR',
      bottleThumb: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'jim',
      name: 'Jim Sarbh',
      perfume: 'GLAZED WATER',
      bottleThumb: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=200&q=80',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'gauahar',
      name: 'Gauahar Khan',
      perfume: 'HAUTE TOBACCO',
      bottleThumb: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=200&q=80',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
    }
  ];
}

function writeCelebrities(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = readCelebrities();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    writeCelebrities(body);
    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save celebrities data' }, { status: 500 });
  }
}
