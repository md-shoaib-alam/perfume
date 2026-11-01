import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwriteServer';
import { Query } from '@/lib/appwriteServer';
import { auth } from '@clerk/nextjs/server';
import { checkRole } from '@/lib/roles';

async function reconcilePendingRazorpayOrder(doc: any) {
  try {
    let parsedShipping: any = {};
    try {
      parsedShipping = typeof doc.shippingAddress === 'string' ? JSON.parse(doc.shippingAddress) : (doc.shippingAddress || {});
    } catch {
      parsedShipping = {};
    }

    const paymentMethod = doc.paymentMethod || parsedShipping?.paymentMethod;
    if (paymentMethod !== 'razorpay') return doc;

    const rawStatus = (doc.status || 'pending').toLowerCase();
    const rawPaymentStatus = (doc.paymentStatus || 'pending').toLowerCase();

    // Only reconcile if both status and paymentStatus are pending
    if (rawStatus !== 'pending' || rawPaymentStatus !== 'pending') return doc;

    // If order was created less than 2 minutes ago, the user might actively be on checkout
    const createdAtTime = doc.$createdAt ? new Date(doc.$createdAt).getTime() : 0;
    const ageInMs = Date.now() - createdAtTime;
    if (ageInMs < 120_000) {
      return doc;
    }

    const storedRazorpayOrderId: string | undefined = parsedShipping.razorpayOrderId;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    let paymentReceived = false;

    if (
      keyId &&
      keySecret &&
      !keyId.includes('your_key_id') &&
      storedRazorpayOrderId &&
      !storedRazorpayOrderId.startsWith('order_sim_') &&
      !storedRazorpayOrderId.startsWith('order_test_')
    ) {
      try {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const paymentsRes: any = await rzp.orders.fetchPayments(storedRazorpayOrderId);
        const payments = Array.isArray(paymentsRes?.items) ? paymentsRes.items : [];
        const successfulPayment = payments.find(
          (p: any) => p.status === 'captured' || p.status === 'authorized'
        );
        if (successfulPayment) {
          paymentReceived = true;
        } else {
          const rzpOrder: any = await rzp.orders.fetch(storedRazorpayOrderId);
          if (rzpOrder?.status === 'paid') {
            paymentReceived = true;
          }
        }
      } catch (rzpErr: any) {
        console.warn('[orders/reconcile] Razorpay status query note:', rzpErr?.message || rzpErr);
      }
    }

    if (paymentReceived) {
      await databases.updateDocument(APPWRITE_DATABASE_ID, 'orders', doc.$id, {
        paymentStatus: 'paid',
        status: 'processing'
      });
      doc.paymentStatus = 'paid';
      doc.status = 'processing';
    } else {
      // Payment was not received; cancel the abandoned pending order
      await databases.updateDocument(APPWRITE_DATABASE_ID, 'orders', doc.$id, {
        paymentStatus: 'cancelled',
        status: 'cancelled'
      });
      doc.paymentStatus = 'cancelled';
      doc.status = 'cancelled';
    }
  } catch (err: any) {
    console.warn('[orders/reconcile] Reconcile order note:', doc.$id, err?.message);
  }
  return doc;
}

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
    paymentMethod: doc.paymentMethod || parsedShipping?.paymentMethod || 'razorpay',
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
    if (!authUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let isAdmin = false;
    try {
      isAdmin = await checkRole('admin');
    } catch (e) {
      isAdmin = false;
    }

    const queries: string[] = [Query.limit(100), Query.orderDesc('$createdAt')];

    if (userIdParam) {
      // Only admins may query another user's orders
      if (!isAdmin && userIdParam !== authUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      queries.push(Query.equal('userId', userIdParam));
    } else if (!isAdmin) {
      // Non-admins without a param only ever see their own orders
      queries.push(Query.equal('userId', authUserId));
    }
    // Admins without a param see all orders

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'orders', queries);
    const reconciledDocs = await Promise.all((res.documents || []).map(reconcilePendingRazorpayOrder));
    const orders = reconciledDocs.map(formatOrderDoc);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('API /api/orders GET error:', err);
    return NextResponse.json([]);
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
