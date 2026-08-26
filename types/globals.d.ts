export type Role = 'admin' | 'customer';

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Role;
    };
  }

  interface UserPublicMetadata {
    role?: Role;
  }
}
