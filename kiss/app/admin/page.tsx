'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from './AdminLayout';

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminLayout onBackToStore={() => router.push('/')} />
  );
}
