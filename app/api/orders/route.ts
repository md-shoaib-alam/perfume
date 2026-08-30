import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { auth } from '@clerk/nextjs/server';
import { checkRole } from '@/lib/roles';
import { calculateOrderBreakdown } from '@/lib/pricing';


const formatOrderDoc = (doc: any) => {
  let parsedItems = [];
  try {
    parsedItems = typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items || []);
  } catch (e) {
    parsedItems = [];
  }

  let parsedShipping: any = {};
  try {
    parsedShipping = typeof doc.shippingAddress === 'string' ? JSON.parse(doc.shippingAddress) : (doc.shippingAddress || {});
  } catch (e) {
    parsedShipping = typeof doc.shippingAddress === 'string' ? { address: doc.shippingAddress } : {};
  }

  const custName = doc.customerName || parsedShipping?.name || 'Anonymous Customer';
  const custEmail = doc.customerEmail || parsedShipping?.email || '';
  const custPhone = doc.customerPhone || parsedShipping?.phone || '';
  const custAddress = typeof parsedShipping?.address === 'string' ? parsedShipping.address : (doc.shippingAddress || '');
  const custCity = parsedShipping?.city || '';
  const custState = parsedShipping?.state || '';
  const custPincode = parsedShipping?.pincode || parsedShipping?.postalCode || '';
  const custCountry = parsedShipping?.country || 'India';

  return {
    _id: doc.$id,
    id: doc.$id,
    orderNumber: `NSH-${doc.$id.slice(-5).toUpperCase()}`,
    userId: doc.userId || 'guest',
    customerName: custName,
    customerEmail: custEmail,
    customerPhone: custPhone,
    shippingAddress: doc.shippingAddress || '',
    customer: {
      name: custName,
      email: custEmail,
      phone: custPhone,
      address: custAddress,
      city: custCity,
      state: custState,
      pincode: custPincode,
      postalCode: custPincode,
      country: custCountry
    },
    items: parsedItems,
    total: Number(doc.totalAmount || 0),
    totalAmount: Number(doc.totalAmount || 0),
    paymentMethod: doc.paymentMethod || parsedShipping?.paymentMethod || (doc.paymentStatus === 'paid' ? 'razorpay' : 'cod'),
    paymentStatus: doc.paymentStatus || 'pending',
    status: doc.status || 'pending',
    orderStatus: doc.status || 'pending',
    trackingNumber: doc.trackingNumber || '',
    trackingUrl: doc.trackingUrl || doc.trackingLink || '',
    createdAt: doc.$createdAt || new Date().toISOString()
  };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');

    const { userId: authUserId } = await auth();
    let isAdmin = false;
    try {
      isAdmin = await checkRole('admin');
    } catch (e) {
      isAdmin = false;
    }

    const queries: string[] = [Query.limit(100), Query.orderDesc('$createdAt')];

    // Filter by specific user if provided
    if (userIdParam) {
      queries.push(Query.equal('userId', userIdParam));
    } else if (!isAdmin && authUserId) {
      // If customer requests without query param, restrict to their orders
      queries.push(Query.equal('userId', authUserId));
    }
    // If admin or general pipeline query, return all orders across all users

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

    // 3. Fetch trusted Appwrite product records
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

      if (!productDoc) {
        continue;
      }

      itemsWithDocs.push({
        productDoc,
        selectedSize: item.selectedSize || item.size || productDoc.volume || '100ml',
        quantity: Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)))
      });
    }

    if (itemsWithDocs.length === 0) {
      return NextResponse.json(
        { error: 'No valid catalog products found in order request' },
        { status: 400 }
      );
    }

    // 4. Calculate discounts if coupon code is provided
    let verifiedCoupon: any = null;
    const couponCode = (body.couponCode || body.coupon || '').trim().toUpperCase();
    if (couponCode) {
      try {
        const couponRes = await databases.listDocuments(APPWRITE_DATABASE_ID, 'coupons', [
          Query.equal('code', couponCode),
          Query.equal('isActive', true),
          Query.limit(1)
        ]);

        if (couponRes.documents && couponRes.documents.length > 0) {
          verifiedCoupon = couponRes.documents[0];
        }
      } catch (err) {
        console.warn('Coupon verification failed:', err);
      }
    }

    // 5. Calculate Order Totals through central pricing engine
    const breakdown = calculateOrderBreakdown(itemsWithDocs, verifiedCoupon);
    const verifiedItems = breakdown.items;
    const calculatedTotalAmount = breakdown.finalTotal;

    // 5. Initialize payment and status state from server workflow (never trust client values)
    const allowedPaymentMethods = ['cod', 'card', 'upi', 'netbanking', 'wallet', 'prepaid', 'razorpay'];
    const paymentMethod = allowedPaymentMethods.includes(body.paymentMethod) ? body.paymentMethod : 'cod';
    const paymentStatus = 'pending';
    const orderStatus = 'pending';

    const shippingDetails = typeof body.shippingAddress === 'object' && body.shippingAddress !== null
      ? { ...body.shippingAddress, paymentMethod }
      : { address: String(body.shippingAddress || '').trim(), paymentMethod };

    const docData = {
      userId: resolvedUserId,
      customerName: String(body.customerName || body.name || 'Anonymous Customer').trim(),
      customerEmail: String(body.customerEmail || body.email || '').trim(),
      customerPhone: String(body.customerPhone || body.phone || '').trim(),
      shippingAddress: JSON.stringify(shippingDetails),
      items: JSON.stringify(verifiedItems),
      totalAmount: calculatedTotalAmount,
      paymentStatus,
      status: orderStatus
    };

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      ID.unique(),
      docData
    );

    // Auto-save/update user's shipping address in Appwrite users collection
    if (resolvedUserId && resolvedUserId !== 'guest' && APPWRITE_DATABASE_ID) {
      try {
        const userDocs = await databases.listDocuments(APPWRITE_DATABASE_ID, 'users', [
          Query.equal('userId', resolvedUserId),
          Query.limit(1)
        ]);
        const userPayload = {
          userId: resolvedUserId,
          name: docData.customerName,
          email: docData.customerEmail,
          phone: docData.customerPhone,
          address: typeof shippingDetails.address === 'string' ? shippingDetails.address : (shippingDetails.address || ''),
          city: shippingDetails.city || '',
          pincode: shippingDetails.pincode || shippingDetails.postalCode || '',
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
        console.warn('[orders] Non-blocking user address sync notice:', userSyncErr);
      }
    }

    return NextResponse.json(formatOrderDoc(doc));
  } catch (err: any) {
    console.error('API /api/orders POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process order' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // Only admins may update order status / tracking / customer address
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { id, status, trackingNumber, trackingUrl, customerName, customerEmail, customerPhone, shippingAddress } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });

    const cleanUpdates: any = {};
    if (status !== undefined) cleanUpdates.status = status;
    if (trackingNumber !== undefined) cleanUpdates.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) cleanUpdates.trackingUrl = trackingUrl;
    if (customerName !== undefined) cleanUpdates.customerName = customerName;
    if (customerEmail !== undefined) cleanUpdates.customerEmail = customerEmail;
    if (customerPhone !== undefined) cleanUpdates.customerPhone = customerPhone;
    if (shippingAddress !== undefined) {
      cleanUpdates.shippingAddress = typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress);
    }

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
