import type { Metadata } from 'next';
import './globals.css';
import SiteFrame from '@/components/SiteFrame';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nourivo.netlify.app'),
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
