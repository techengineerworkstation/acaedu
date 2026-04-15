import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import PageTransition from '@/components/layout/PageTransition';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Acaedu - Smart Academic Scheduling',
  description: 'Never miss a class. Manage schedules, announcements, and exams with ease.',
  keywords: ['academic', 'scheduling', 'notifications', 'student', 'lecturer'],
  authors: [{ name: 'Acaedu Team' }],
  creator: 'Acaedu',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Acaedu - Smart Academic Scheduling',
    description: 'Never miss a class. Manage schedules, announcements, and exams with ease.',
    siteName: 'Acaedu'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acaedu - Smart Academic Scheduling',
    description: 'Never miss a class. Manage schedules, announcements, and exams with ease.'
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body>
        <Providers>
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  );
}