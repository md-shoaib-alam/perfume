import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';

// ─── Security constants ────────────────────────────────────────────────────
// Sandbox simulation tokens are ONLY accepted in non-production environments.
// In production ALL payments must pass real HMAC-SHA256 signature verification.
const IS_DEV = process.env.NODE_ENV !== 'production';

const SIM_PAYMENT_PREFIXES = ['pay_test_', 'pay_sim_'];
const SIM_ORDER_PREFIXES   = ['order_test_', 'order_sim_'];


/** True only when the IDs are our own sandbox simulation tokens AND we are in dev */
function isSimulatedCheckout(
  razorpay_payment_id: string | undefined,
  razorpay_order_id: string | undefined
): boolean {
  if (!IS_DEV) return false; // hard block in production
  return (
    SIM_PAYMENT_PREFIXES.some((p) => razorpay_payment_id?.startsWith(p)) ||
    SIM_ORDER_PREFIXES.some((p) => razorpay_order_id?.startsWith(p))
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = body;

    // ── 1. Require all fields ──────────────────────────────────────────────
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required order identifier' },
        { status: 400 }
      );
    }
    if (!razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json(
        { error: 'Missing payment credentials from Razorpay' },
        { status: 400 }
      );
    }

    // ── 2. Fetch & validate the Appwrite order FIRST ───────────────────────
    // Prevents: marking unknown/arbitrary order IDs as paid, double-processing
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

    if (existingOrder.paymentStatus === 'paid') {
      // Idempotent — already confirmed, return success without re-updating
      const orderNumber = `NSH-${existingOrder.$id.slice(-5).toUpperCase()}`;
      return NextResponse.json({
        success: true,
        orderId: existingOrder.$id,
        orderNumber,
        paymentId: razorpay_payment_id,
        status: existingOrder.status
      });
    }

    if (existingOrder.paymentStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not in a payable state' },
        { status: 409 }
      );
    }

    // ── 3. Cross-validate the Razorpay order ID ────────────────────────────
    // Prevents attackers substituting a different Razorpay order for this one.
    let parsedShipping: any = {};
    try { parsedShipping = JSON.parse(existingOrder.shippingAddress || '{}'); } catch {}

    const storedRazorpayOrderId: string | undefined = parsedShipping.razorpayOrderId;

    if (
      storedRazorpayOrderId &&
      !SIM_ORDER_PREFIXES.some((p) => storedRazorpayOrderId.startsWith(p)) &&
      !SIM_ORDER_PREFIXES.some((p) => razorpay_order_id.startsWith(p)) &&
      storedRazorpayOrderId !== razorpay_order_id
    ) {
      console.warn(
        `[verify] Razorpay order ID mismatch: stored=${storedRazorpayOrderId} received=${razorpay_order_id} orderId=${orderId}`
      );
      return NextResponse.json(
        { error: 'Payment order identifier mismatch' },
        { status: 400 }
      );
    }

    // ── 4. Signature verification ──────────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const hasRealSecret = keySecret && !keySecret.includes('your_razorpay_key_secret');

    let isValid = false;

    if (isSimulatedCheckout(razorpay_payment_id, razorpay_order_id)) {
      // Dev-only: sandbox simulation token — skip real HMAC
      isValid = true;
    } else if (hasRealSecret && razorpay_signature) {
      // Real payment — HMAC-SHA256 must match exactly
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValid = generatedSignature === razorpay_signature;
      if (!isValid) {
        console.warn(`[verify] Signature mismatch orderId=${orderId} paymentId=${razorpay_payment_id}`);
      }
    } else if (!hasRealSecret && IS_DEV) {
      // Dev with unconfigured secret — allow but warn
      console.warn('[verify] RAZORPAY_KEY_SECRET not configured. Skipping HMAC check (DEV only).');
      isValid = true;
    }
    // Any other scenario (production without secret, missing signature) → isValid stays false

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Razorpay payment signature verification' },
        { status: 400 }
      );
    }

    // ── 5. Mark the order as paid ──────────────────────────────────────────
    const updatedDoc = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      'orders',
      orderId,
      {
        paymentStatus: 'paid',
        status: 'processing'
      }
    );

    const orderNumber = `NSH-${updatedDoc.$id.slice(-5).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      orderId: updatedDoc.$id,
      orderNumber,
      paymentId: razorpay_payment_id,
      status: 'processing'
    });
  } catch (error: any) {
    console.error('API /api/razorpay/verify error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
