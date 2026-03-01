import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Healthy Food Platform',
  description: 'Recipes and articles about healthy nutrition'
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/articles', label: 'Articles' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/shopping-list', label: 'Shopping list' },
  { href: '/planner', label: 'Planner' },
  { href: '/account', label: 'Account' }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <nav className="nav">
            {navItems.map((i) => (
              <Link key={i.href} href={i.href} className="navLink">
                {i.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="main">{children}</main>
        <footer className="footer">
          <Link href="/legal/privacy">Privacy</Link> · <Link href="/legal/terms">Terms</Link> ·{' '}
          <Link href="/legal/cookies">Cookies</Link> · <Link href="/legal/disclaimer">Disclaimer</Link>
        </footer>
      </body>
    </html>
  );
}
