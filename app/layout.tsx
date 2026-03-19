import type { Metadata } from 'next';
import './globals.css';
import SiteFrame from '@/components/SiteFrame';
import { getSiteMetadataBase } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  title: {
    default: 'Nourivo',
    template: '%s | Nourivo',
  },
  description:
    'Nourivo helps people plan balanced meals, manage pantry staples, save smart recipes, and turn healthy intentions into weekly routines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
