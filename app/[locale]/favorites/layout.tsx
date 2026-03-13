import type { Metadata } from 'next';
import { getPrivateNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = getPrivateNoIndexMetadata('Favorites');

export default function LocalizedFavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
