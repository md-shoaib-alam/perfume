import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID, ID, Query } from '@/lib/appwriteServer';
import { adminGuard } from '@/lib/roles';

const formatCouponDoc = (d: any) => ({
  id: d.$id,
  code: d.code,
  discountPercentage: Number(d.discountPercentage || 0),
  discountAmount: Number(d.discountAmount || 0),
  minOrderAmount: Number(d.minOrderAmount || 0),
  isActive: d.isActive !== false
});

// Coupon definitions are admin-only: a publicly readable collection leaks live codes.
export async function GET() {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [Query.limit(50)]);
    return NextResponse.json((res.documents || []).map(formatCouponDoc));
  } catch (err: any) {
    console.error('API /api/coupons GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const data = await req.json();
    const doc = await databases.createDocument(APPWRITE_DATABASE_ID, 'coupons', ID.unique(), {
      code: String(data.code || '').trim().toUpperCase(),
      discountPercentage: Number(data.discountPercentage || 0),
      discountAmount: Number(data.discountAmount || 0),
      minOrderAmount: Number(data.minOrderAmount || 0),
      isActive: data.isActive !== false
    });
    return NextResponse.json(formatCouponDoc(doc));
  } catch (err: any) {
    console.error('API /api/coupons POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const { id, updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing coupon id' }, { status: 400 });

    const cleanData: any = {};
    if (updates?.code !== undefined) cleanData.code = String(updates.code).trim().toUpperCase();
    if (updates?.discountPercentage !== undefined) cleanData.discountPercentage = Number(updates.discountPercentage);
    if (updates?.discountAmount !== undefined) cleanData.discountAmount = Number(updates.discountAmount);
    if (updates?.minOrderAmount !== undefined) cleanData.minOrderAmount = Number(updates.minOrderAmount);
    if (updates?.isActive !== undefined) cleanData.isActive = updates.isActive !== false;

    const doc = await databases.updateDocument(APPWRITE_DATABASE_ID, 'coupons', id, cleanData);
    return NextResponse.json(formatCouponDoc(doc));
  } catch (err: any) {
    console.error('API /api/coupons PUT error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await adminGuard();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing coupon id' }, { status: 400 });

    await databases.deleteDocument(APPWRITE_DATABASE_ID, 'coupons', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/coupons DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
