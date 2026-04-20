import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Spider Expense - Track Smart. Spend Like a Hero.',
  description:
    'Premium expense tracker with cinematic Spider-Tech UI, real-time analytics, and hero-level financial control.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <Suspense fallback={null}>
        <body className='min-h-full flex flex-col'>
          <AppProviders>{children}</AppProviders>
        </body>
      </Suspense>
    </html>
  );
}
