import { NextResponse } from 'next/server';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

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
    const userId = searchParams.get('userId');

    const queries: string[] = [Query.limit(100), Query.orderDesc('$createdAt')];
    if (userId) {
      queries.push(Query.equal('userId', userId));
    }

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'orders', queries);
    const orders = (res.documents || []).map(formatOrderDoc);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('API /api/orders error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const order = await req.json();
    const docData = {
      userId: order.userId || 'guest',
      customerName: order.customerName || 'Anonymous Customer',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      shippingAddress: typeof order.shippingAddress === 'object'
        ? JSON.stringify(order.shippingAddress)
        : String(order.shippingAddress || ''),
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items || []),
      totalAmount: Number(order.totalAmount || order.total || 0),
      paymentMethod: order.paymentMethod || 'cod',
      paymentStatus: order.paymentStatus || 'pending',
      status: 'pending'
    };

    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      ID.unique(),
      docData
    );

    return NextResponse.json(formatOrderDoc(doc));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
