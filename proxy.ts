import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes requiring standard customer authentication
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
]);

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
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Role check from sessionClaims (if configured in Clerk session token)
    const role = (sessionClaims as any)?.metadata?.role;
    if (role && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 2. Customer protected route protection
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
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
