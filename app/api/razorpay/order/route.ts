import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { auth } from '@clerk/nextjs/server';

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

    // 3. Calculate verified totals from trusted Appwrite product records
    let serverSubtotal = 0;
    const verifiedItems: any[] = [];

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

      const selectedSize = item.selectedSize || item.size || productDoc.volume || '100ml';
      const quantity = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));

      let unitPrice = Number(productDoc.price || 0);
      if (productDoc.sizeOptions) {
        try {
          const sizeOpts = typeof productDoc.sizeOptions === 'string'
            ? JSON.parse(productDoc.sizeOptions)
            : productDoc.sizeOptions;

          if (Array.isArray(sizeOpts)) {
            const match = sizeOpts.find((opt: any) => opt.size === selectedSize);
            if (match && typeof match.price === 'number') {
              unitPrice = Number(match.price);
            }
          }
        } catch (e) {}
      }

      const itemTotal = unitPrice * quantity;
      serverSubtotal += itemTotal;

      verifiedItems.push({
        productId: productDoc.$id,
        name: productDoc.name,
        size: selectedSize,
        price: unitPrice,
        quantity,
        image: productDoc.image || ''
      });
    }

    if (verifiedItems.length === 0) {
      return NextResponse.json(
        { error: 'No catalog products could be validated for this checkout' },
        { status: 400 }
      );
    }

    // 4. Calculate Verified Coupon Discount
    let discountAmount = 0;
    const cleanCoupon = String(couponCode || '').trim().toUpperCase();
    if (cleanCoupon) {
      try {
        const couponRes = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [
          Query.equal('code', cleanCoupon),
          Query.equal('isActive', true),
          Query.limit(1)
        ]);

        if (couponRes.documents && couponRes.documents.length > 0) {
          const couponDoc: any = couponRes.documents[0];
          const minOrder = Number(couponDoc.minOrderAmount || 0);

          if (serverSubtotal >= minOrder) {
            if (Number(couponDoc.discountPercentage) > 0) {
              discountAmount = Math.round(serverSubtotal * (Number(couponDoc.discountPercentage) / 100));
            } else if (Number(couponDoc.discountAmount) > 0) {
              discountAmount = Number(couponDoc.discountAmount);
            }
          }
        }
      } catch (err) {
        console.warn('Coupon verification failed in Razorpay order route:', err);
      }
    }

    const calculatedTotal = Math.max(0, serverSubtotal - discountAmount);
    const amountInPaise = Math.round(calculatedTotal * 100);

    // 5. Create Pending Appwrite Order record
    const shippingDetails = {
      name: customer.name || 'Valued Customer',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || customer.postalCode || ''
    };

    const appwriteOrderData = {
      userId: resolvedUserId,
      customerName: shippingDetails.name,
      customerEmail: shippingDetails.email,
      customerPhone: shippingDetails.phone,
      shippingAddress: JSON.stringify(shippingDetails),
      items: JSON.stringify(verifiedItems),
      totalAmount: calculatedTotal,
      paymentMethod: 'razorpay',
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
