'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Flame, ScanLine, Gamepad2, LogOut, User } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { GameMode } from '@/lib/game-config';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, nickname, avatar, level, streak, resetPlayer } = usePlayerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide header completely on title screen, live scanner, and game hub for full-screen retro game immersion
  // ponytail: Game Hub has its own integrated dark retro RPG floating HUD
  if (pathname === '/' || pathname === '/scan' || pathname.startsWith('/play')) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      resetPlayer();
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#DCA1A1]/20 border border-[#DCA1A1]/40 flex items-center justify-center text-lg transition-transform group-hover:scale-105">
            🐱
          </div>
          <div className="flex flex-col">
            <span className="font-fredoka text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              SCAN CHAN
              <span className="text-[10px] font-pixel px-1.5 py-0.5 rounded bg-[#DCA1A1]/20 text-[#7a3b3b] dark:text-[#f3c8c8] border border-[#DCA1A1]/40 font-bold">
                PRO
              </span>
            </span>
          </div>
        </Link>

        {/* Center Nav for Tablet/Desktop */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-fredoka font-semibold">
          <Link
            href="/play"
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              pathname.startsWith('/play')
                ? 'bg-[#DCA1A1]/25 text-[#4a2020] dark:text-white font-bold border border-[#DCA1A1]/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Game Hub
          </Link>
          <Link
            href="/scan"
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
              pathname.startsWith('/scan')
                ? 'bg-[#DCA1A1]/25 text-[#4a2020] dark:text-white font-bold border border-[#DCA1A1]/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            Live Scanner
          </Link>
        </nav>

        {/* Right Status / Controls */}
        <div className="flex items-center gap-2.5">
          {mounted && mode && (
            <div className="flex items-center gap-2">
              {/* Streak Counter */}
              <div
                title="Current Daily Streak"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold font-fredoka"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{streak}d</span>
              </div>

              {/* Level Badge */}
              <div
                title="Current Level"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-fredoka"
              >
                <span>Lv.{level}</span>
              </div>
            </div>
          )}

          {/* User Profile / Auth State */}
          {mounted ? (
            mode === GameMode.ARASHU ? (
              <div className="flex items-center gap-2 pl-1 border-l border-border">
                <span className="text-sm font-semibold text-foreground hidden sm:inline flex items-center gap-1">
                  <span>{avatar || '👑'}</span>
                  <span>{nickname || 'Player'}</span>
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : mode === GameMode.GUEST ? (
              <div className="flex items-center gap-2 pl-1 border-l border-border">
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                  Guest
                </span>
                <Link
                  href="/?auth=true"
                  className="text-xs font-fredoka font-bold px-2.5 py-1.5 rounded-lg bg-[#DCA1A1] text-[#2b1414] hover:bg-[#e4b2b2] transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                href="/?auth=true"
                className="btn-arcade-primary text-xs !py-1.5 !px-3"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
