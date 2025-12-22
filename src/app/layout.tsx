import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaintSal - The Everything Platform',
  description: 'AI-powered business intelligence platform by Saint Vision Technologies LLC. US Patent #10,290,222 - HACP (Human-AI Collaborative Processing)',
  keywords: ['AI', 'business intelligence', 'property scoring', 'deal pipeline', 'trading platform', 'affiliate program'],
  authors: [{ name: 'Saint Vision Technologies LLC' }],
  creator: 'Saint Vision Technologies LLC',
  publisher: 'Saint Vision Technologies LLC',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFD700',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
