'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_bW9kZXN0LXNuYXAtNzUuY2xlcmsuYWNjb3VudHMuZGV2JA';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  if (!PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
