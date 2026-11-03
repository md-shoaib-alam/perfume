'use client';

import React, { createContext, useContext } from 'react';

export type ProductsRouteActions = {
  openAdd: () => void;
  openEditByParam: (param: string) => void;
  closeEditor: () => void;
};

const ProductsRouteContext = createContext<ProductsRouteActions | null>(null);

export const ProductsRouteProvider: React.FC<{
  value: ProductsRouteActions;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <ProductsRouteContext.Provider value={value}>{children}</ProductsRouteContext.Provider>
);

export const useProductsRoute = (): ProductsRouteActions => {
  const ctx = useContext(ProductsRouteContext);
  if (!ctx) throw new Error('useProductsRoute must be used within ProductsRouteProvider');
  return ctx;
};
