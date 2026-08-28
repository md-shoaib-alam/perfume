import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account – BakhoorBliss',
  description: 'Manage your BakhoorBliss profile, luxury fragrance orders, and addresses.',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
