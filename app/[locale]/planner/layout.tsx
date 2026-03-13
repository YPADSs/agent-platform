import type { Metadata } from 'next';
import { getPrivateNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = getPrivateNoIndexMetadata('Planner');

export default function LocalizedPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
