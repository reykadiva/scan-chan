import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { BottomNav } from '@/components/layout/bottom-nav';
import { AppHeader } from '@/components/layout/app-header';
import { MainContentLayout } from '@/components/layout/main-content-layout';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AudioProvider } from '@/components/providers/audio-provider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://scanchan.vercel.app'),
  title: 'Scan Chan — Gamified Barcode Companion',
  description:
    'Scan physical product barcodes, feed your pixel companion cat, collect food items, and climb levels with Scan Chan.',
  keywords: ['barcode scanner', 'gamified scanning', 'virtual pet', 'pixel cat', 'product lookup'],
  openGraph: {
    title: 'Scan Chan — Gamified Barcode Companion',
    description: 'Scan everyday barcodes to feed & evolve your pixel cat!',
    url: 'https://scanchan.vercel.app',
    siteName: 'Scan Chan',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scan Chan — Gamified Barcode Companion',
    description: 'Scan everyday barcodes to feed & evolve your pixel cat!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-nunito bg-background text-foreground min-h-[100dvh] flex flex-col antialiased overflow-x-hidden">
        <ThemeProvider>
          <AudioProvider>
            <AppHeader />
            <MainContentLayout>{children}</MainContentLayout>
            <BottomNav />
            <Toaster position="top-right" />
            <Analytics />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
