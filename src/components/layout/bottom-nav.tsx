'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, ScanLine } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/play', label: 'Hub', icon: Gamepad2 },
  { href: '/scan', label: 'Scan', icon: ScanLine },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Hide on title screen, live scanner, and game hub for full-screen retro arcade view
  // ponytail: Game Hub provides direct 1-screen navigation without bottom navbar
  if (pathname === '/' || pathname === '/scan' || pathname.startsWith('/play')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all ${
                active
                  ? 'text-[#853b3b] dark:text-[#f3c8c8] font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active ? 'bg-[#DCA1A1]/25 border border-[#DCA1A1]/50 text-[#542121] dark:text-white' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-fredoka text-[11px] font-semibold leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
