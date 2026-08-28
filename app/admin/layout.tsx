import React from 'react';
import type { Metadata } from 'next';
import { checkRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { AdminShell } from './AdminShell';

export const metadata: Metadata = {
  title: 'Admin Console – BakhoorBliss',
};

export default async function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 1. Require authentication
  if (!userId) {
    redirect('/auth/sign-in?redirect_url=/admin');
  }

  // 2. Require admin role in Clerk publicMetadata
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}
