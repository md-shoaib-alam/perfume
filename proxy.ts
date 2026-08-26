import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes requiring admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. Admin route protection
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', '/admin');
      return NextResponse.redirect(signInUrl);
    }

    // Role check from sessionClaims (supports metadata.role, publicMetadata.role, or role)
    const role =
      (sessionClaims as any)?.metadata?.role ||
      (sessionClaims as any)?.publicMetadata?.role ||
      (sessionClaims as any)?.role;

    // If role claim is present and explicitly not admin, redirect to home
    if (role && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
