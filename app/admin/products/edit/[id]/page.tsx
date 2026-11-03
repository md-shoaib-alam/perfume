'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProductsRoute } from '../../productsRoute';

export default function AdminEditProductPage() {
  const params = useParams();
  const { openEditByParam } = useProductsRoute();

  useEffect(() => {
    const id = params?.id;
    if (typeof id === 'string' && id) {
      openEditByParam(decodeURIComponent(id));
    }
  }, [params, openEditByParam]);

  return null;
}
