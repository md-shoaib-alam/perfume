import { NextResponse } from 'next/server';
import { uploadMediaToAppwrite, deleteMediaFromAppwrite } from '@/lib/appwriteServer';
import { encodeAvif, isConvertibleImage } from '@/lib/avifEncoder';
import { isUploadProfile, type UploadProfile } from '@/lib/uploadProfiles';
import { auth } from '@clerk/nextjs/server';
import { checkRole } from '@/lib/roles';

/** Only admins may upload or delete media files */
async function requireAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  return null;
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedProfile = formData.get('profile');
    const profile: UploadProfile = isUploadProfile(requestedProfile) ? requestedProfile : 'default';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Raster images are stored as AVIF once, so every visitor gets the same
    // compressed file. SVG, GIF (animated) and video pass through untouched.
    let media = file;
    if (isConvertibleImage(file)) {
      try {
        media = await encodeAvif(file, profile);
        console.log(
          `[upload] "${file.name}" (${(file.size / 1024).toFixed(0)} KB) -> "${media.name}" (${(
            media.size / 1024
          ).toFixed(0)} KB)`
        );
      } catch (encodeErr) {
        console.warn(
          '[upload] AVIF encode failed, storing original:',
          encodeErr instanceof Error ? encodeErr.message : encodeErr
        );
      }
    }

    // Route uploads through uploadMediaToAppwrite() for consistent validation and bucket behavior
    const fileUrl = await uploadMediaToAppwrite(media);

    return NextResponse.json({
      success: true,
      url: fileUrl
    });
  } catch (err: any) {
    console.error('Server upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId') || searchParams.get('url');

    if (!fileId) {
      return NextResponse.json({ error: 'No fileId or url provided' }, { status: 400 });
    }

    const success = await deleteMediaFromAppwrite(fileId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete file from Appwrite Storage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Server delete error:', err);
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}

