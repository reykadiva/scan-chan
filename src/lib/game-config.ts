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
    // ponytail: medium-hard scaling (quadratic)
    return (level - 1) * (level - 1) * 100 + 200;
  },
  dailyMissionsCount: 4,
};
