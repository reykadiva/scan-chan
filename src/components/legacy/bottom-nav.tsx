'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PixelCat, type CatVariantId, type CatActionId } from '@/components/legacy/pixel-cat';

const TABS = [
  { href: '/', label: 'Home', variant: 'calico' as CatVariantId, action: 'none' as CatActionId },
  { href: '/scan', label: 'Scan', variant: 'cyan' as CatVariantId, action: 'scan' as CatActionId },
  { href: '/play', label: 'Hub', variant: 'tabby' as CatVariantId, action: 'missions' as CatActionId },
] as const;

const HIDDEN_ROUTES = ['/scan', '/play/mode'];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-white/40 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-all ${
                active
                  ? 'text-cyan-700 scale-110'
                  : 'text-slate-400 active:scale-95'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition-colors ${
                active ? 'bg-brand-cyan/15' : ''
              }`}>
                <PixelCat variant={tab.variant} action={tab.action} size={28} />
              </div>
              <span className="font-fredoka text-[10px] font-semibold leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
