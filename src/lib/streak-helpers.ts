/**
 * Helper functions for managing strict daily streak logic
 */

/**
 * Checks if user has scanned today based on lastActiveDate
 * Returns true if today matches lastActiveDate
 */
export function hasScannedToday(lastActiveDate: string | null, todayString: string): boolean {
  return lastActiveDate === todayString;
}

/**
 * Calculates streak status for a new day
 * Returns: 'continue' (scanned yesterday, streak continues), 'broke' (missed a day), or 'new' (first day)
 */
export function getStreakStatus(
  lastActiveDate: string | null,
  todayString: string,
  currentStreak: number
): 'continue' | 'broke' | 'new' {
  if (!lastActiveDate) return 'new';
  if (lastActiveDate === todayString) return 'continue'; // Already scanned today
  
  const lastDateParts = lastActiveDate.split('-').map(Number);
  const todayParts = todayString.split('-').map(Number);
  
  const last = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]);
  const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  
  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'continue'; // Scanned yesterday, streak continues
  } else if (diffDays > 1) {
    return 'broke'; // Missed at least one day, streak broken
  }
  
  return 'continue';
}

/**
 * Calculates new streak value based on status
 */
export function calculateNewStreak(currentStreak: number, status: 'continue' | 'broke' | 'new'): number {
  if (status === 'new') return 1;
  if (status === 'continue') return currentStreak + 1;
  // status === 'broke'
  return 1;
}

/**
 * Gets warning message for streak at risk
 */
export function getStreakWarningMessage(hoursUntilMidnight: number): string {
  if (hoursUntilMidnight <= 1) {
    return `⚠️ Streak at risk! Scan something in the next ${Math.ceil(hoursUntilMidnight * 60)} minutes to maintain your streak!`;
  } else if (hoursUntilMidnight <= 3) {
    return `⚠️ Don't forget to scan today to maintain your streak! ${Math.ceil(hoursUntilMidnight)} hours left!`;
  }
  return '';
}

/**
 * Calculates hours until midnight in user's timezone
 */
export function getHoursUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diffMs = tomorrow.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Gets today's date string in YYYY-MM-DD format (local timezone)
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
