import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export type Role = 'admin' | 'customer';

/**
 * Checks if the current user has the specified role on the server.
 * First checks fast session claims, then falls back to currentUser() publicMetadata.
 */
export async function checkRole(role: Role): Promise<boolean> {
  const { sessionClaims, userId } = await auth();

  if (!userId) return false;

  // 1. Fast check from customized JWT session token claims
  const sessionRole = (
    (sessionClaims as any)?.metadata?.role ||
    (sessionClaims as any)?.publicMetadata?.role ||
    (sessionClaims as any)?.role
  ) as Role | undefined;

  if (sessionRole) {
    return sessionRole === role;
  }

  // 2. Direct check from user metadata in Clerk (server-controlled fields only;
  // unsafeMetadata is client-writable and must never grant roles)
  const user = await currentUser();
  if (!user) return false;

  const userRole = (
    user.publicMetadata?.role ||
    (user as any).privateMetadata?.role ||
    'customer'
  ) as Role;

  return userRole === role;
}

/**
 * Gets the current authenticated user's role on the server.
 * Returns 'admin', 'customer', or null if signed out.
 */
export async function getUserRole(): Promise<Role | null> {
  const { sessionClaims, userId } = await auth();

  if (!userId) return null;

  const sessionRole = (
    (sessionClaims as any)?.metadata?.role ||
    (sessionClaims as any)?.publicMetadata?.role ||
    (sessionClaims as any)?.role
  ) as Role | undefined;

  if (sessionRole) return sessionRole;

  const user = await currentUser();
  if (!user) return null;

  return (
    user.publicMetadata?.role ||
    (user as any).privateMetadata?.role ||
    'customer'
  ) as Role;
}

/**
 * Enforces admin access on Server Actions / API routes.
 * Throws an Error if unauthorized.
 */
export async function requireAdmin() {
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }
}

/**
 * Route-handler guard: returns a 401/403 response for unauthenticated or
 * non-admin callers, or null when the request may proceed.
 */
export async function adminGuard(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!(await checkRole('admin'))) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  return null;
}

/**
 * Updates a user's role in Clerk publicMetadata (Admin-only server function).
 */
export async function setUserRole(targetUserId: string, role: Role) {
  await requireAdmin();
  const client = await clerkClient();
  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata: {
      role,
    },
  });
}
