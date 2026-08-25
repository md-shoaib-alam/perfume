import { NextResponse } from 'next/server';
import { checkRole, setUserRole, Role } from '@/lib/roles';

export async function POST(req: Request) {
  try {
    // 1. Server-side security check: Ensure caller is an admin
    const isAdmin = await checkRole('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body as { userId: string; role: Role };

    if (!userId || !role || !['admin', 'customer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid userId or role (must be "admin" or "customer")' }, { status: 400 });
    }

    // 2. Perform Clerk metadata update
    await setUserRole(userId, role);

    return NextResponse.json({
      success: true,
      message: `User ${userId} role set to ${role}`
    });
  } catch (error: any) {
    console.error('Failed to set role:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
