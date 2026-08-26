import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { auth } from '@clerk/nextjs/server';

const formatOrderDoc = (doc: any) => {
  let parsedItems = [];
  try {
    parsedItems = typeof doc.items === 'string' ? JSON.parse(doc.items) : doc.items;
  } catch (e) {
    parsedItems = [];
  }

  return {
    _id: doc.$id,
    id: doc.$id,
    orderNumber: `NSH-${doc.$id.slice(-5).toUpperCase()}`,
    userId: doc.userId || 'guest',
    customerName: doc.customerName || 'Anonymous',
    customerEmail: doc.customerEmail || '',
    customerPhone: doc.customerPhone || '',
    shippingAddress: doc.shippingAddress || '',
    items: parsedItems,
    total: Number(doc.totalAmount || 0),
    totalAmount: Number(doc.totalAmount || 0),
    paymentMethod: doc.paymentMethod || 'cod',
    paymentStatus: doc.paymentStatus || 'pending',
    status: doc.status || 'pending',
    trackingNumber: doc.trackingNumber || '',
    createdAt: doc.$createdAt || new Date().toISOString()
  };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');

    const { userId: authUserId } = await auth();

    const queries: string[] = [Query.limit(100), Query.orderDesc('$createdAt')];

    // Filter by specific user if provided or if authenticated non-admin
    const targetUserId = userIdParam || authUserId;
    if (targetUserId) {
      queries.push(Query.equal('userId', targetUserId));
    }

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'orders', queries);
    const orders = (res.documents || []).map(formatOrderDoc);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('API /api/orders GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Resolve user ID from authenticated request session
    const { userId: authUserId } = await auth();
    const resolvedUserId = authUserId || 'guest';

    // 2. Validate items
    const rawItems = Array.isArray(body.items) 
      ? body.items 
      : (typeof body.items === 'string' ? JSON.parse(body.items || '[]') : []);

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
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

      if (!productDoc) {
        continue;
      }

      const selectedSize = item.selectedSize || item.size || productDoc.volume || '100ml';
      const quantity = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));

      // Determine unit price from stored product sizeOptions or base price
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
        { error: 'No valid catalog products found in order request' },
        { status: 400 }
      );
    }

    // 4. Calculate discounts if coupon code is provided
    let discountAmount = 0;
    const couponCode = (body.couponCode || body.coupon || '').trim().toUpperCase();
    if (couponCode) {
      try {
        const couponRes = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [
          Query.equal('code', couponCode),
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
        console.warn('Coupon verification failed:', err);
      }
    }

    const calculatedTotalAmount = Math.max(0, serverSubtotal - discountAmount);

    // 5. Initialize payment and status state from server workflow (never trust client values)
    const allowedPaymentMethods = ['cod', 'card', 'upi', 'netbanking', 'wallet', 'prepaid'];
    const paymentMethod = allowedPaymentMethods.includes(body.paymentMethod) ? body.paymentMethod : 'cod';
    const paymentStatus = 'pending';
    const orderStatus = 'pending';

    const docData = {
      userId: resolvedUserId,
      customerName: String(body.customerName || body.name || 'Anonymous Customer').trim(),
      customerEmail: String(body.customerEmail || body.email || '').trim(),
      customerPhone: String(body.customerPhone || body.phone || '').trim(),
      shippingAddress: typeof body.shippingAddress === 'object'
        ? JSON.stringify(body.shippingAddress)
        : String(body.shippingAddress || '').trim(),
      items: JSON.stringify(verifiedItems),
      totalAmount: calculatedTotalAmount,
      paymentMethod,
      paymentStatus,
      status: orderStatus
    };

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      ID.unique(),
      docData
    );

    return NextResponse.json(formatOrderDoc(doc));
  } catch (err: any) {
    console.error('API /api/orders POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process order' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status, trackingNumber } = await req.json();
    const cleanUpdates: any = {};
    if (status !== undefined) cleanUpdates.status = status;
    if (trackingNumber !== undefined) cleanUpdates.trackingNumber = trackingNumber;

    const doc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      id,
      cleanUpdates
    );
    return NextResponse.json(formatOrderDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
