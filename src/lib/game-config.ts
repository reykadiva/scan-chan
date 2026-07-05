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
    return (level - 1) * 150 + 100;
  },
  dailyMissionsCount: 4,
};
