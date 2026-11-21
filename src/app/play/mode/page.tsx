'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, Play, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { GameMode } from '@/lib/game-config';
import { PixelCat } from '@/components/game/pixel-cat';
import { toast } from 'sonner';

export default function ModeSelectionPage() {
  const router = useRouter();
  const { setMode, initializePlayer } = usePlayerStore();

  const handleSelectGuest = async () => {
    try {
      await fetch('/api/auth/guest', { method: 'POST' });
      setMode(GameMode.GUEST);
      initializePlayer('Guest Hunter', 'calico');
      toast.info('Guest mode activated. Data saved locally.');
      router.push('/play');
    } catch {
      setMode(GameMode.GUEST);
      initializePlayer('Guest Hunter', 'calico');
      router.push('/play');
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8 text-center">
        {/* Header with High-Contrast White & Theme Dark Drop-Shadow */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] overflow-hidden">
            <PixelCat variant="calico" action="play" size={52} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-fredoka text-white drop-shadow-[2.5px_2.5px_0_var(--theme-dark)] tracking-wide">
            Select Your Play Mode
          </h1>
          <p className="text-xs sm:text-sm text-white font-nunito max-w-md mx-auto drop-shadow-[1.5px_1.5px_0_var(--theme-dark)] font-bold">
            Choose how you would like to run Scan-Chan on this device.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-left">
          {/* Guest Mode Card */}
          <button
            type="button"
            onClick={handleSelectGuest}
            className="p-4 sm:p-6 rounded-2xl bg-white border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] hover:bg-[var(--theme-surface-inner)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] flex flex-col justify-between transition-all group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] group-hover:scale-105 transition-transform shadow-[2px_2px_0_0_var(--theme-shadow)]">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-fredoka text-[var(--theme-text-dark)]">Guest Mode</h2>
                  <span className="text-[10px] font-pixel px-1.5 py-0.5 rounded-md bg-[var(--theme-surface-inner)] border border-[var(--theme-border)] text-[var(--theme-text-dark)] font-bold">
                    OFFLINE
                  </span>
                </div>
                <p className="text-xs text-[var(--theme-text-dark)]/80 font-nunito font-semibold mt-1">
                  Start scanning immediately. Progress is saved locally in your browser.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[var(--theme-primary)] font-fredoka">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Instant Access →</span>
            </div>
          </button>

          {/* Account Mode Card */}
          <Link
            href="/?auth=true"
            className="p-4 sm:p-6 rounded-2xl bg-white border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] hover:bg-[var(--theme-surface-inner)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] flex flex-col justify-between transition-all group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] group-hover:scale-105 transition-transform shadow-[2px_2px_0_0_var(--theme-shadow)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-fredoka text-[var(--theme-text-dark)]">Hunter Account</h2>
                  <span className="text-[10px] font-pixel px-1.5 py-0.5 rounded-md bg-[var(--theme-primary)] border border-[var(--theme-border)] text-white font-bold">
                    CLOUD
                  </span>
                </div>
                <p className="text-xs text-[var(--theme-text-dark)]/80 font-nunito font-semibold mt-1">
                  Sign in or create an account. Sync your companion pet, level, and streaks across any device.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[var(--theme-primary)] font-fredoka">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In / Register →</span>
            </div>
          </Link>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)] hover:text-[var(--theme-accent)] font-fredoka transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
