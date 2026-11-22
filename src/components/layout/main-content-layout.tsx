'use client';

import { usePathname } from 'next/navigation';

export function MainContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-screen natural container for SPA (Title Screen, Lobby, & Live Scanner)
  if (pathname === '/' || pathname === '/scan') {
    return <main className="flex-1 w-full min-h-screen flex flex-col">{children}</main>;
  }

  // Naturally scrolling single-column container for Game Hub & Privacy Policy
  // ponytail: Allow natural vertical scroll on Game Hub & Privacy Policy
  if (pathname.startsWith('/play') || pathname.startsWith('/privacy')) {
    return <main className="flex-1 w-full min-h-screen flex flex-col overflow-y-auto overflow-x-hidden">{children}</main>;
  }

  // Centered padded container for App Hub, Product, Login, etc.
  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 md:py-6 overflow-x-hidden">
      {children}
    </main>
  );
}
