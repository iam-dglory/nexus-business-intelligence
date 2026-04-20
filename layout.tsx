// nexus/frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Space_Mono, Syne } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '../components/ui/Toast';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NEXUS — Business Intelligence Platform',
  description: 'Explore, discover, and connect with businesses globally on an interactive intelligence map.',
  keywords: ['business', 'intelligence', 'map', 'investor', 'startup', 'networking'],
  openGraph: {
    title: 'NEXUS',
    description: 'Map-first business intelligence and networking platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body className="bg-bg text-slate-200 font-sans antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
