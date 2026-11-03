'use client';

import React from 'react';
import { ProductsManager } from '../ProductsManager';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ProductsManager>{children}</ProductsManager>;
}
