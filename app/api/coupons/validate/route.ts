import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID, Query } from '@/lib/appwriteServer';

// Shoppers may check a code, never list them: only the computed discount is returned.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cleanCode = String(body.code || '').trim().toUpperCase();
    const orderTotal = Number(body.orderTotal || 0);

    if (!cleanCode) {
      return NextResponse.json({ valid: false, discount: 0, message: 'Enter a coupon code' });
    }

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [
      Query.equal('code', cleanCode),
      Query.equal('isActive', true),
      Query.limit(1)
    ]);

    const coupon = res.documents?.[0];
    if (!coupon) {
      return NextResponse.json({ valid: false, discount: 0, message: 'Invalid or expired coupon code' });
    }

    const minOrder = Number(coupon.minOrderAmount || 0);
    if (orderTotal < minOrder) {
      return NextResponse.json({
        valid: false,
        discount: 0,
        message: `Minimum order amount of Rs.${minOrder} required.`
      });
    }

    let discount = 0;
    if (Number(coupon.discountPercentage) > 0) {
      discount = Math.round((orderTotal * Number(coupon.discountPercentage)) / 100);
    } else if (Number(coupon.discountAmount) > 0) {
      discount = Number(coupon.discountAmount);
    }

    return NextResponse.json({
      valid: true,
      discount,
      message: `Coupon ${cleanCode} applied! Saved Rs.${discount}`
    });
  } catch (err: any) {
    console.error('API /api/coupons/validate error:', err);
    return NextResponse.json({ valid: false, discount: 0, message: 'Invalid or expired coupon code' });
  }
}
