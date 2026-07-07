'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useStreakWarning } from '@/hooks/use-streak-warning';
import { PixelCat } from '@/components/legacy/pixel-cat';

/**
 * Displays current streak with warning indicator if at risk
 * Shows warnings when user hasn't scanned today and time is running out
 */
export function StreakDisplay() {
  const { warningMessage, isAtRisk, currentStreak, hasScannedToday } = useStreakWarning();

  if (currentStreak === 0) {
    return null; // No streak to display
  }

  return (
    <div className="space-y-3">
      {/* Streak Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`card-bubbly p-4 border-2 transition-all ${
          isAtRisk
            ? 'bg-red-50/30 border-red-300 shadow-lg shadow-red-200/50'
            : 'bg-orange-50/30 border-orange-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Flame Icon */}
          <div className="text-3xl animate-pulse">🔥</div>

          {/* Streak Info */}
          <div className="flex-1">
            <h3 className="font-fredoka font-black text-lg text-slate-800">
              {currentStreak} Day Streak
            </h3>
            <p className="text-sm text-slate-600 font-nunito">
              {hasScannedToday ? '✅ Scanned today' : '⏳ Waiting for today\'s scan'}
            </p>
          </div>

          {/* Streak Indicator */}
          <PixelCat variant="tabby" action="play" size={40} />
        </div>
      </motion.div>

      {/* Warning Message */}
      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card-bubbly p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm"
          >
            <p className="text-sm font-nunito font-semibold text-amber-900 leading-snug">
              {warningMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Achievement Badge */}
      {!isAtRisk && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {currentStreak === 7 && (
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full text-white text-xs font-bold">
              🔥 7-Day Streak!
            </div>
          )}
          {currentStreak === 30 && (
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-400 to-orange-500 rounded-full text-white text-xs font-bold">
              🔥🔥 30-Day Streak!
            </div>
          )}
          {currentStreak === 100 && (
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs font-bold">
              🔥🔥🔥 100-Day Streak!
            </div>
          )}
          {currentStreak === 365 && (
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-white text-xs font-bold">
              👑 365-Day Legend!
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
