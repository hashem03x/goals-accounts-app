/**
 * Root layout - RTL direction, Arabic font, Toaster for notifications.
 */
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'أهدافي وحساباتي',
  description: 'إدارة الأهداف والحسابات المالية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-arabic antialiased bg-surface-50 text-surface-500 min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { direction: 'rtl' },
          }}
        />
      </body>
    </html>
  );
}
