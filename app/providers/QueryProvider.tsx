'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10, // 10 minutes - data remains fresh across client navigations
            gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory cache
            refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary DB hits
            refetchOnMount: false, // Use cached data immediately on mount
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
