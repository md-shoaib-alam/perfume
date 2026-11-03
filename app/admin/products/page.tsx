'use client';

import React, { useEffect } from 'react';
import { useProductsRoute } from './productsRoute';

export default function AdminProductsPage() {
  const { closeEditor } = useProductsRoute();

  useEffect(() => {
    closeEditor();
  }, [closeEditor]);

  return null;
}
