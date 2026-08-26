import { NextResponse } from 'next/server';
import { storage, APPWRITE_BUCKET_ID } from '@/lib/appwrite';
import { ID } from 'appwrite';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileId = ID.unique();
    const uploaded = await storage.createFile(
      APPWRITE_BUCKET_ID,
      fileId,
      file
    );

    const fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, uploaded.$id).toString();

    return NextResponse.json({
      success: true,
      fileId: uploaded.$id,
      url: fileUrl
    });
  } catch (err: any) {
    console.error('Server upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
