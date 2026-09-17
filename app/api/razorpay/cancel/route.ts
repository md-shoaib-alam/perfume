import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { auth } from '@clerk/nextjs/server';
import { checkRole } from '@/lib/roles';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing required order ID' }, { status: 400 });
    }

    // 1. Authenticate caller
    const { userId: authUserId } = await auth();

    // 2. Fetch existing order from Appwrite
    let existingOrder: any;
    try {
      existingOrder = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        'orders',
        orderId
      );
    } catch {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Authorization check
    let isAdmin = false;
    try {
      isAdmin = await checkRole('admin');
    } catch {
      isAdmin = false;
    }

    const orderUserId = existingOrder.userId;
    if (!isAdmin && orderUserId && orderUserId !== 'guest' && orderUserId !== authUserId) {
      return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 });
    }

    // 4. If order is already paid, do not cancel
    if (existingOrder.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        status: existingOrder.status,
        paymentStatus: 'paid',
        message: 'Order is already marked as paid'
      });
    }

    // 5. If order is already cancelled, return immediately
    if (existingOrder.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        status: 'cancelled',
        paymentStatus: existingOrder.paymentStatus || 'cancelled',
        message: 'Order is already cancelled'
      });
    }

    // 6. Check Razorpay to verify if payment was received
    let parsedShipping: any = {};
    try {
      parsedShipping = typeof existingOrder.shippingAddress === 'string'
        ? JSON.parse(existingOrder.shippingAddress)
        : (existingOrder.shippingAddress || {});
    } catch {
      parsedShipping = {};
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
        const rzp = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });

        // Query Razorpay order payments
        const paymentsRes: any = await rzp.orders.fetchPayments(storedRazorpayOrderId);
        const payments = Array.isArray(paymentsRes?.items) ? paymentsRes.items : [];

        const successfulPayment = payments.find(
          (p: any) => p.status === 'captured' || p.status === 'authorized'
        );

        if (successfulPayment) {
          paymentReceived = true;
        } else {
          // Check order entity status
          const rzpOrder: any = await rzp.orders.fetch(storedRazorpayOrderId);
          if (rzpOrder?.status === 'paid') {
            paymentReceived = true;
          }
        }
      } catch (rzpErr: any) {
        console.warn('[razorpay/cancel] Razorpay API query note:', rzpErr?.message || rzpErr);
      }
    }

    // 7. Auto-heal if payment was received, or cancel if not received
    if (paymentReceived) {
      const updatedDoc = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        'orders',
        orderId,
        {
          paymentStatus: 'paid',
          status: 'processing'
        }
      );

      return NextResponse.json({
        success: true,
        status: updatedDoc.status,
        paymentStatus: 'paid',
        message: 'Payment was verified as captured by Razorpay'
      });
    }

    // Payment was NOT received -> mark order as cancelled
    const updatedDoc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      orderId,
      {
        status: 'cancelled',
        paymentStatus: 'cancelled'
      }
    );

    return NextResponse.json({
      success: true,
      status: updatedDoc.status,
      paymentStatus: 'cancelled',
      message: 'Payment was not received; order cancelled successfully'
    });
  } catch (error: any) {
    console.error('API /api/razorpay/cancel error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
