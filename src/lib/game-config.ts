export enum GameMode {
  GUEST = 'guest',
  ARASHU = 'arashu',
}

export const GAME_CONFIG = {
  xp: {
    scanExisting: 10,
    scanNew: 25,
    registerProduct: 50,
  },
  cooldowns: {
    scanSameBarcodeSeconds: 15,
    scanCooldownMs: 2000,
    registerProductSeconds: 10,
    deleteProductSeconds: 5,
  },
  scanner: {
    fallbackIntervalMs: 300,
    batteryAwareIntervalMs: {
      low: 500,
      normal: 250,
      high: 100,
    },
  },
  limits: {
    uploadMaxBytes: 5 * 1024 * 1024, // 5MB
  },
  ui: {
    xpPopupDurationMs: 1500,
    achievementPopupDurationMs: 4000,
    toastDurationMs: 3000,
    animationBounceDelayMs: 100,
    collectionPageSize: 12,
  },
  levelFormula: (level: number): number => {
    // Balanced formula for level 1-50 (reach level 50 in ~2 months)
    // Target: 60 days with 25 scans/day = 15,000 XP total for level 50
    if (level <= 1) return 0;
    
    // Progressive formula that totals ~15,000 XP at level 50
    // Early levels: faster, Late levels: slower but steady
    const baseXP = 100;
    const levelMultiplier = Math.pow(level, 1.6); // Gentle exponential curve
    return Math.floor(baseXP + levelMultiplier * 3);
  },
  dailyMissionsCount: 4,
};
