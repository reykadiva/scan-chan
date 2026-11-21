import Link from 'next/link';
import Image from 'next/image';
import { Home, Gamepad2, Compass } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full bg-[#1c261d] flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Ambient Garden Background */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/garden-bg.webp"
          alt="Garden background"
          fill
          priority
          quality={90}
          className="object-cover object-[center_75%] opacity-25 pixelated"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 404 Retro RPG Dialog Box */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[var(--theme-surface-card)] border-4 border-[var(--theme-border)] shadow-[6px_6px_0_0_var(--theme-shadow)] space-y-6 text-center">
        {/* Pixel Cat Illustration */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] mx-auto overflow-hidden">
          <PixelCat variant="calico" action="none" size={60} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--theme-primary)] text-white text-[10px] font-press-start border border-[var(--theme-border)] shadow-[2px_2px_0_0_var(--theme-shadow)] uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Error 404</span>
          </div>
          <h1 className="font-fredoka text-2xl sm:text-3xl font-black text-[var(--theme-text-dark)] tracking-tight">
            Area Not Found
          </h1>
          <p className="font-nunito text-xs sm:text-sm text-[var(--theme-text-dark)]/80 font-semibold leading-relaxed max-w-xs mx-auto">
            Meow? It seems your pixel companion wandered into an uncharted forest area.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/play"
            className="btn-arcade-primary flex-1 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_0_var(--theme-shadow)]"
          >
            <Gamepad2 className="w-4 h-4" />
            Game Hub
          </Link>
          <Link
            href="/"
            className="btn-arcade flex-1 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 bg-white text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] cursor-pointer shadow-[3px_3px_0_0_var(--theme-shadow)]"
          >
            <Home className="w-4 h-4" />
            Start Screen
          </Link>
        </div>
      </div>

      {/* Footer Tag */}
      <p className="relative z-10 mt-6 font-press-start text-[9px] text-white/50 tracking-wider">
        SCAN CHAN &bull; 404 UNCHARTED AREA
      </p>
    </main>
  );
}
