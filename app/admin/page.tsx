import { checkRole } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { AdminClientPage } from './AdminClientPage';

export default async function AdminPage() {
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

  return <AdminClientPage />;
}
