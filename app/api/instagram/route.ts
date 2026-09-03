import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { adminGuard } from '@/lib/roles';

const DATA_FILE = path.join(process.cwd(), 'data_instagram.json');

export interface InstagramItem {
  id: string;
  image: string;
  instagramUrl?: string;
  caption?: string;
}

export interface InstagramData {
  title: string;
  handle: string;
  profileUrl: string;
  items: InstagramItem[];
}

const DEFAULT_DATA: InstagramData = {
  title: 'Get Inspired',
  handle: '@bakhoorbliss',
  profileUrl: 'https://instagram.com',
  items: [
    {
      id: 'ig-1',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
      instagramUrl: 'https://instagram.com',
      caption: 'Haute Vetiver extrait'
    },
    {
      id: 'ig-2',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
      instagramUrl: 'https://instagram.com',
      caption: 'Evening sillage notes'
    },
    {
      id: 'ig-3',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
      instagramUrl: 'https://instagram.com',
      caption: 'The Noir Collection'
    },
    {
      id: 'ig-4',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
      instagramUrl: 'https://instagram.com',
      caption: 'Artisanal formulation'
    },
    {
      id: 'ig-5',
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
      instagramUrl: 'https://instagram.com',
      caption: 'Pure botanical essence'
    },
    {
      id: 'ig-6',
      image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=600&q=80',
      instagramUrl: 'https://instagram.com',
      caption: 'Signature extrait'
    }
  ]
};

function readInstagramData(): InstagramData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          title: parsed.title || DEFAULT_DATA.title,
          handle: parsed.handle || DEFAULT_DATA.handle,
          profileUrl: parsed.profileUrl || DEFAULT_DATA.profileUrl,
          items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : DEFAULT_DATA.items
        };
      }
    }
  } catch (e) {
    console.error('Error reading data_instagram.json:', e);
  }
  return DEFAULT_DATA;
}

function writeInstagramData(data: InstagramData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = readInstagramData();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const body = await req.json();
    const current = readInstagramData();

    let dataToSave: InstagramData;
    if (Array.isArray(body)) {
      dataToSave = {
        ...current,
        items: body
      };
    } else if (body && typeof body === 'object') {
      dataToSave = {
        title: body.title !== undefined ? body.title : current.title,
        handle: body.handle !== undefined ? body.handle : current.handle,
        profileUrl: body.profileUrl !== undefined ? body.profileUrl : current.profileUrl,
        items: Array.isArray(body.items) ? body.items : current.items
      };
    } else {
      dataToSave = DEFAULT_DATA;
    }

    writeInstagramData(dataToSave);
    return NextResponse.json({ success: true, data: dataToSave });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save Instagram showcase' }, { status: 500 });
  }
}
