'use client';

import React, { useEffect } from 'react';
import { useProductsRoute } from '../productsRoute';

export default function AdminNewProductPage() {
  const { openAdd } = useProductsRoute();

  useEffect(() => {
    openAdd();
  }, [openAdd]);

  return null;
}
