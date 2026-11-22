'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RefreshCw, Home } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';

interface SyncLoadingGateProps {
  message?: string;
  onRetry?: () => void;
  error?: string | null;
}

export function SyncLoadingGate({
  message = 'LOADING...',
  onRetry,
  error,
}: SyncLoadingGateProps) {
  const router = useRouter();
  const [showTimeoutFallback, setShowTimeoutFallback] = useState(false);

  useEffect(() => {
    // Tolerant 10s threshold for cold-starts without causing premature panic
    const timer = setTimeout(() => {
      setShowTimeoutFallback(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const displayTitle = error ? 'SYNC ERROR' : (message || 'LOADING...');

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      {/* 3. Center Retro RPG Indicator Card (Pink #D45D79) */}
      <div className="rpg-panel border-4 border-[#2b1414] bg-[#D45D79] p-6 sm:p-7 max-w-sm w-full mx-auto text-center shadow-[6px_6px_0_0_#1c1008] relative z-20 animate-in fade-in zoom-in-95 duration-300">
        {/* 3 Evolution Stages Side-by-Side with Natural Idle Animation */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="transition-transform hover:scale-105" title="Stage 1: Kitten">
            <PixelCat variant="calico" action="none" hunger={100} size={50} />
          </div>
          <div className="transition-transform hover:scale-105" title="Stage 2: Young Cat">
            <PixelCat variant="tabby" action="none" hunger={100} size={58} />
          </div>
          <div className="transition-transform hover:scale-105" title="Stage 3: Adult Cat">
            <PixelCat variant="black" action="none" hunger={100} size={66} />
          </div>
        </div>

        {/* Crisp White Headline with Pixel Drop-Shadow */}
        <h2 className="font-fredoka text-2xl sm:text-3xl font-black text-white tracking-widest mb-3 drop-shadow-[2px_2px_0_#2b1414]">
          {displayTitle}
        </h2>

        {/* Optional Error Pill */}
        {error && (
          <p className="font-pixel text-[10px] sm:text-[11px] text-amber-200 bg-[#2b1414]/50 border border-amber-300/40 rounded px-2 py-1 mb-3">
            {error}
          </p>
        )}

        {/* Retro Pixel Yellow Progress Bar */}
        {!error && (
          <div className="w-full bg-[#2b1414]/40 h-3.5 rounded-full overflow-hidden p-0.5 border-2 border-[#2b1414] mb-1 shadow-inner">
            <div className="bg-amber-300 h-full rounded-full animate-pulse w-full shadow-[0_0_8px_rgba(252,211,77,0.5)]" />
          </div>
        )}

        {/* Fallback buttons if network times out (> 6s) or encounters an error */}
        {(showTimeoutFallback || error) && (
          <div className="mt-4 pt-3 border-t-2 border-white/20 space-y-2.5">
            <p className="text-xs text-white/95 font-nunito font-bold drop-shadow-[1px_1px_0_#2b1414]">
              {error ? 'Connection failed. Please retry:' : 'Taking longer than usual?'}
            </p>
            <div className="flex gap-2 justify-center">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rpg-button px-3.5 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#4a8505] text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0_0_#1c3802] border-2 border-[#1c3802]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Sync</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  } else {
                    router.push('/');
                  }
                }}
                className="rpg-button px-3.5 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#8b1515] text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-[2px_2px_0_0_#4a0b0b] border-2 border-[#4a0b0b]"
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
