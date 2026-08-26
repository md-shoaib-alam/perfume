import { NextResponse } from 'next/server';
import { uploadMediaToAppwrite } from '@/lib/appwrite';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Route uploads through uploadMediaToAppwrite() for consistent validation and bucket behavior
    const fileUrl = await uploadMediaToAppwrite(file);

    return NextResponse.json({
      success: true,
      url: fileUrl
    });
  } catch (err: any) {
    console.error('Server upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
