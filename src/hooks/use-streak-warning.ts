'use client';

import { useEffect, useState } from 'react';
import { getHoursUntilMidnight, getStreakWarningMessage, getTodayString } from '@/lib/streak-helpers';
import { usePlayerStore } from '@/stores/legacy/player-store';

/**
 * Hook that manages streak warning system
 * Updates browser tab title when streak is at risk
 */
export function useStreakWarning() {
  const streak = usePlayerStore((state) => state.streak);
  const lastActiveDate = usePlayerStore((state) => state.lastActiveDate);
  const [warningMessage, setWarningMessage] = useState('');
  const [isAtRisk, setIsAtRisk] = useState(false);

  useEffect(() => {
    if (streak === 0) return; // No streak to warn about

    const today = getTodayString();
    const hasScannedToday = lastActiveDate === today;

    if (!hasScannedToday) {
      // User hasn't scanned today yet
      const hoursLeft = getHoursUntilMidnight();
      const message = getStreakWarningMessage(hoursLeft);

      if (message) {
        setWarningMessage(message);
        setIsAtRisk(true);
      } else {
        setWarningMessage('');
        setIsAtRisk(false);
      }
    } else {
      // User already scanned today
      setWarningMessage('');
      setIsAtRisk(false);
    }
  }, [streak, lastActiveDate]);

  // Update browser tab title with warning indicator
  useEffect(() => {
    if (isAtRisk && streak > 0) {
      const originalTitle = document.title;
      document.title = `⚠️ ${originalTitle}`;

      return () => {
        document.title = originalTitle;
      };
    }
  }, [isAtRisk, streak]);

  return {
    warningMessage,
    isAtRisk,
    currentStreak: streak,
    hasScannedToday: lastActiveDate === getTodayString(),
  };
}
