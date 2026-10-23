import type { ComponentType, ReactNode } from 'react';

declare module 'react' {
  export const ViewTransition: ComponentType<{
    children?: ReactNode;
    name?: string;
    share?: string | Record<string, string>;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    default?: string | Record<string, string>;
  }>;
}
