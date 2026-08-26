'use client';

import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { api } from '../services/api';

export const UserSyncGlobal: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    // Avoid repeatedly syncing the same user during the same session
    if (syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;

    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';
    const phone = user.phoneNumbers?.[0]?.phoneNumber || '';

    api.syncUserWithAppwrite({
      userId: user.id,
      email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone
    }).then((ok) => {
      if (!ok) syncedUserRef.current = null;
    }).catch(() => {
      syncedUserRef.current = null;
    });
  }, [user, isLoaded, isSignedIn]);

  return null;
};
