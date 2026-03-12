import type { Metadata } from 'next';
import { getPrivateNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = getPrivateNoIndexMetadata('Account');

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
