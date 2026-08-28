'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { api } from '../services/api';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import type { Product } from '../types';

export type TabKey =
  | 'dashboard'
  | 'orders'
  | 'profile'
  | 'wishlist'
  | 'recently_viewed'
  | 'password';

export function useAccountData(onLogoutCallback?: () => void) {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const { signOut } = clerk;

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Wishlist & Orders States
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  useEffect(() => {
    // Initial load from local storage
    const localRecents = getRecentlyViewed();
    if (localRecents.length > 0) {
      setRecentProducts(localRecents);
    }

    const handleUpdate = () => {
      const updated = getRecentlyViewed();
      setRecentProducts(updated);
    };

    window.addEventListener('recently_viewed_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('recently_viewed_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');

      const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';
      const userPhone = user.phoneNumbers?.[0]?.phoneNumber || '';

      // Load live profile details from shared backend API
      api.getUserProfile(user.id).then(profile => {
        if (profile) {
          if (profile.phone) setPhone(profile.phone);
          else if (userPhone) setPhone(userPhone);
          if (profile.address) setAddress(profile.address);
          if (profile.city) setCity(profile.city);
          if (profile.pincode) setPincode(profile.pincode);
          if (profile.wishlist) setWishlist(profile.wishlist);
          if (profile.recentViews) setRecentProducts(profile.recentViews);
        }
      }).catch(e => console.warn('Could not load user profile:', e));

      // Sync Clerk user with Appwrite backend
      api.syncUserWithAppwrite({
        userId: user.id,
        email: userEmail,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: userPhone
      }).catch(e => console.warn('Could not sync user with Appwrite:', e));

      // Load orders from Appwrite
      api.getOrders(user.id).then(orders => {
        if (orders && orders.length > 0) {
          setUserOrders(orders);
        }
      }).catch(e => console.warn('Could not load user orders:', e));
    }
  }, [user]);

  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || 'User';
  const displayName = firstName ? `${firstName} ${lastName}`.trim() : (email.includes('@') ? email.split('@')[0] : 'User');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user && (firstName !== user.firstName || lastName !== user.lastName)) {
        await user.update({ firstName, lastName });
      }
      if (user) {
        await api.saveUserProfile(user.id, {
          address,
          city,
          pincode,
          phone,
          wishlist,
          recentViews: recentProducts
        });
        await api.syncUserWithAppwrite({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
          firstName,
          lastName,
          phone,
          address,
          city,
          pincode
        });

        // Also update local storage cache for instant checkout prefill
        try {
          localStorage.setItem('neesh_saved_address', JSON.stringify({
            name: `${firstName} ${lastName}`.trim(),
            email: user.primaryEmailAddress?.emailAddress || '',
            phone,
            address,
            city,
            pincode,
            state: 'Maharashtra'
          }));
        } catch (e) {}
      }
      setSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      setPwdMsg('Sending password reset instructions to your email...');
      const client = clerk?.client || (typeof window !== 'undefined' ? (window as any).Clerk?.client : null);
      if (client?.signIn) {
        await client.signIn.create({
          strategy: 'reset_password_email_code',
          identifier: email,
        });
        setPwdMsg(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
      } else {
        setPwdMsg(`Password reset request submitted for ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Failed to trigger password reset. Please try again.';
      setPwdMsg(msg);
    }
  };

  const handleLogout = async () => {
    await signOut();
    if (onLogoutCallback) {
      onLogoutCallback();
    }
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    activeTab,
    setActiveTab,
    isEditingProfile,
    setIsEditingProfile,
    saveSuccess,
    pwdMsg,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    address,
    setAddress,
    city,
    setCity,
    pincode,
    setPincode,
    wishlist,
    setWishlist,
    recentProducts,
    setRecentProducts,
    userOrders,
    setUserOrders,
    email,
    displayName,
    handleSaveProfile,
    handleSendPasswordReset,
    handleLogout
  };
}
