import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { auth } from '@clerk/nextjs/server';
import { calculateOrderBreakdown } from '@/lib/pricing';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items = [], customer = {}, couponCode = '' } = body;

    // 1. Resolve User session if available
    let resolvedUserId = 'guest';
    try {
      const { userId: authUserId } = await auth();
      if (authUserId) resolvedUserId = authUserId;
    } catch (e) {
      // Allow guest checkout
    }

    // 2. Validate Items
    const rawItems = Array.isArray(items) ? items : [];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: 'Checkout requires at least one product in bag' },
        { status: 400 }
      );
    }

    // 3. Fetch trusted Appwrite product documents
    const itemsWithDocs: Array<{ productDoc: any; selectedSize?: string; quantity?: number }> = [];

    for (const item of rawItems) {
      const productId = item.productId || item.id || item.product?.id;
      if (!productId) continue;

      let productDoc: any = null;
      try {
        productDoc = await databases.getDocument(APPWRITE_DATABASE_ID, 'products', productId);
      } catch (e) {
        console.warn(`Product ID ${productId} not found in database:`, e);
      }

      if (!productDoc) continue;

      itemsWithDocs.push({
        productDoc,
        selectedSize: item.selectedSize || item.size || productDoc.volume || '100ml',
        quantity: Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)))
      });
    }

    if (itemsWithDocs.length === 0) {
      return NextResponse.json(
        { error: 'No catalog products could be validated for this checkout' },
        { status: 400 }
      );
    }

    // 4. Verify Coupon if provided
    let verifiedCoupon: any = null;
    const cleanCoupon = String(couponCode || '').trim().toUpperCase();
    if (cleanCoupon) {
      try {
        const couponRes = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [
          Query.equal('code', cleanCoupon),
          Query.equal('isActive', true),
          Query.limit(1)
        ]);

        if (couponRes.documents && couponRes.documents.length > 0) {
          verifiedCoupon = couponRes.documents[0];
        }
      } catch (err) {
        console.warn('Coupon verification warning in Razorpay order route:', err);
      }
    }

    // 5. Calculate Order Totals through central pricing engine
    const breakdown = calculateOrderBreakdown(itemsWithDocs, verifiedCoupon);
    const verifiedItems = breakdown.items;
    const calculatedTotal = breakdown.finalTotal;
    const amountInPaise = breakdown.amountInPaise;

    // 5. Create Pending Appwrite Order record
    const shippingDetails = {
      name: customer.name || 'Valued Customer',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || customer.postalCode || '',
      paymentMethod: 'razorpay'
    };

    const appwriteOrderData = {
      userId: resolvedUserId,
      customerName: shippingDetails.name,
      customerEmail: shippingDetails.email,
      customerPhone: shippingDetails.phone,
      shippingAddress: JSON.stringify(shippingDetails),
      items: JSON.stringify(verifiedItems),
      totalAmount: calculatedTotal,
      paymentStatus: 'pending',
      status: 'pending'
    };

    const orderDoc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      ID.unique(),
      appwriteOrderData
    );

    const orderNumber = `NSH-${orderDoc.$id.slice(-5).toUpperCase()}`;

    // Auto-save/update user's shipping address in Appwrite users collection
    if (resolvedUserId && resolvedUserId !== 'guest' && APPWRITE_DATABASE_ID) {
      try {
        const userDocs = await databases.listDocuments(APPWRITE_DATABASE_ID, 'users', [
          Query.equal('userId', resolvedUserId),
          Query.limit(1)
        ]);
        const userPayload = {
          userId: resolvedUserId,
          name: shippingDetails.name,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          city: shippingDetails.city,
          pincode: shippingDetails.pincode,
          lastLoginAt: new Date().toISOString()
        };
        if (userDocs.documents && userDocs.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            'users',
            userDocs.documents[0].$id,
            userPayload
          );
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            'users',
            ID.unique(),
            userPayload
          );
        }
      } catch (userSyncErr) {
        console.warn('[order] Non-blocking user address sync notice:', userSyncErr);
      }
    }

    // 6. Initialize Razorpay Client & Generate Gateway Order
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    let razorpayOrderId = '';

    if (keyId && keySecret && !keyId.includes('your_key_id')) {
      try {
        const rzp = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });

        const rzpOrder = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${orderDoc.$id.slice(0, 30)}`,
          notes: {
            appwriteOrderId: orderDoc.$id,
            orderNumber,
            customerEmail: shippingDetails.email
          }
        });

        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr: any) {
        console.warn('Razorpay API order creation warning (fallback to simulated order for sandbox):', rzpErr?.message || rzpErr);
        razorpayOrderId = `order_sim_${orderDoc.$id.slice(0, 16)}`;
      }
    } else {
      razorpayOrderId = `order_test_${orderDoc.$id.slice(0, 16)}`;
    }

    // Persist razorpayOrderId into shippingAddress so /verify can cross-validate
    // and prevent order-ID substitution attacks.
    try {
      const updatedShipping = { ...shippingDetails, razorpayOrderId };
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'orders',
        orderDoc.$id,
        { shippingAddress: JSON.stringify(updatedShipping) }
      );
    } catch (updateErr: any) {
      console.warn('[order] Could not persist razorpayOrderId to order record:', updateErr?.message);
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      amount: amountInPaise,
      totalAmount: calculatedTotal,
      currency: 'INR',
      keyId,
      orderId: orderDoc.$id,
      orderNumber,
      customer: shippingDetails
    });
  } catch (error: any) {
    console.error('API /api/razorpay/order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize Razorpay checkout order' },
      { status: 500 }
    );
  }
}
