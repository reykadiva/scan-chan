'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RefreshCw, Home } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';

interface SyncLoadingGateProps {
  message?: string;
  submessage?: string;
  onRetry?: () => void;
  error?: string | null;
}

export function SyncLoadingGate({
  message = 'Syncing Hunter Data...',
  submessage = 'Restoring your partner, food bag & stats...',
  onRetry,
  error,
}: SyncLoadingGateProps) {
  const router = useRouter();
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutFallback(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen select-none overflow-hidden flex flex-col items-center justify-center p-4"
      style={{ touchAction: 'none' }}
    >
      {/* 1. Main Pixel Art Garden Background */}
      <div className="absolute inset-0 w-full h-full pixelated">
        <Image
          src="/images/garden-bg.webp"
          alt="Garden Background"
          fill
          priority
          quality={90}
          className="object-cover object-[center_75%] pixelated filter blur-[3px] scale-105"
          sizes="100vw"
        />
      </div>

      {/* 2. Soft atmospheric vignette & dark overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

      {/* 3. Center Retro RPG Indicator Card */}
      <div className="rpg-panel border-4 border-[#3a2010] bg-[#fffbf0] p-6 sm:p-7 max-w-sm w-full mx-auto text-center shadow-[6px_6px_0_0_#1c1008] relative z-20 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Cat */}
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-[#f5e6cc] rounded-2xl border-2 border-[#3a2010] shadow-[2px_2px_0_0_#3a2010] animate-bounce">
            <PixelCat size={72} action="rewards" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-fredoka text-xl sm:text-2xl font-black text-[#3a2010] tracking-wide mb-1 drop-shadow-[0.5px_0.5px_0_#fff]">
          {error ? 'Sync Interrupted' : message}
        </h2>

        {/* Submessage */}
        <p className="font-pixel text-[10px] sm:text-[11px] text-[#6b4c35] leading-relaxed mb-4">
          {error ? (
            <span className="text-red-700 font-bold">{error}</span>
          ) : (
            submessage
          )}
        </p>

        {/* Retro Pixel Loading Bar */}
        {!error && (
          <div className="w-full bg-[#3a2010]/15 h-3 rounded-full overflow-hidden p-0.5 border border-[#3a2010]/30 mb-2">
            <div className="bg-amber-400 h-full rounded-full animate-pulse w-full" />
          </div>
        )}

        {/* Fallback buttons if network times out or errors */}
        {(showTimeoutFallback || error) && (
          <div className="mt-4 pt-3 border-t-2 border-[#3a2010]/20 space-y-2.5">
            <p className="text-xs text-[#8a5c38] font-nunito font-semibold">
              {error ? 'Connection failed. Please retry:' : 'Taking longer than usual?'}
            </p>
            <div className="flex gap-2 justify-center">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rpg-button px-3.5 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#4a8505] text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0_0_#284702]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Sync</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rpg-button px-3.5 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#b91c1c] text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0_0_#7f1d1d]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
