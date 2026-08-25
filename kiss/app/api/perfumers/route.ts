import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_perfumers.json');

function readPerfumers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading data_perfumers.json:', e);
  }
  return [
    {
      id: 'julien',
      name: 'Julien Rasquinet',
      quote: 'Fragrance is architecture in liquid form. Every accord must be balanced with absolute precision.',
      award: 'Best Italian Perfumer Award - 2025',
      bio: 'Trained under legendary Master Perfumer Pierre Bourdon. Created iconic vintage formulations for world-renowned haute perfumery houses.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'christian',
      name: 'Christian Provenzano',
      quote: 'The secret to unmatched longevity is the age and purity of the natural resins and raw agarwood.',
      award: 'Global Master Perfumer of the Year',
      bio: 'Over 40 years of mastery blending exotic Middle Eastern ouds with classical French fine perfumery.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    }
  ];
}

function writePerfumers(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing data_perfumers.json:', e);
  }
}

export async function GET() {
  const data = readPerfumers();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    writePerfumers(body);
    return NextResponse.json({ success: true, data: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
