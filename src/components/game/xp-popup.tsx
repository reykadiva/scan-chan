'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/player-store';
import { GAME_CONFIG } from '@/lib/game-config';

export function XpPopup() {
  const pendingXpGain = usePlayerStore((state) => state.pendingXpGain);
  const scanHistory = usePlayerStore((state) => state.scanHistory);
  const registeredBarcodes = usePlayerStore((state) => state.registeredBarcodes);
  const clearPendingXpGain = usePlayerStore((state) => state.clearPendingXpGain);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pendingXpGain <= 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clearPendingXpGain();
    }, GAME_CONFIG.ui.xpPopupDurationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingXpGain, clearPendingXpGain]);

  const key = `${pendingXpGain}-${scanHistory.length}-${registeredBarcodes.length}`;

  return (
    <AnimatePresence mode="wait">
      {pendingXpGain > 0 && (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
          className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="bg-amber-400 text-amber-950 border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span className="font-press-start text-xs sm:text-sm font-bold tracking-wider">
              +{pendingXpGain} XP
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
