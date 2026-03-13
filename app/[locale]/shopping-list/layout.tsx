import type { Metadata } from 'next';
import { getPrivateNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = getPrivateNoIndexMetadata('Shopping List');

export default function LocalizedShoppingListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
