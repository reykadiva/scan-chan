/**
 * Calculates XP multiplier based on current streak.
 * Formula: 1 + (streak × 0.1), capped at 2.5x
 * 
 * Examples:
 * - Streak 0: 1.0x multiplier
 * - Streak 5: 1.5x multiplier
 * - Streak 10: 2.0x multiplier
 * - Streak 15+: 2.5x multiplier (capped)
 */
export function calculateStreakMultiplier(streak: number): number {
  const baseMultiplier = 1 + (streak * 0.1);
  return Math.min(baseMultiplier, 2.5);
}

/**
 * Calculates final XP after applying streak multiplier
 */
export function applyStreakMultiplier(baseXp: number, streak: number): number {
  const multiplier = calculateStreakMultiplier(streak);
  return Math.floor(baseXp * multiplier);
}

/**
 * Determines the streak milestone level (7, 30, 100, 365 days)
 */
export function getStreakMilestone(streak: number): number | null {
  if (streak >= 365) return 365;
  if (streak >= 100) return 100;
  if (streak >= 30) return 30;
  if (streak >= 7) return 7;
  return null;
}

/**
 * Returns milestone badge text for UI display
 */
export function getMilestoneBadgeText(milestone: number | null): string {
  if (!milestone) return '';
  if (milestone === 7) return '🔥 7-Day Streak!';
  if (milestone === 30) return '🔥🔥 30-Day Streak!';
  if (milestone === 100) return '🔥🔥🔥 100-Day Streak!';
  if (milestone === 365) return '👑 365-Day Legend!';
  return '';
}
