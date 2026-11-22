import { prisma } from '@/lib/prisma';
import { GAME_CONFIG } from '@/lib/game-config';
import { calculateStreakMultiplier, applyStreakMultiplier } from '@/lib/streak-multiplier';
import { recordScanStreak, getWibDateKey, hasScannedToday } from '@/lib/streak-helpers';
import { localDb, type LocalUser } from '@/lib/database/local-db';
import type { ProfileUpdateInput, ProfilePreferencesInput } from '@/lib/validations/profile';
import { processBarcodeScan } from '@/services/scanner-service';
import { isConsumableCategory } from '@/types';

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += GAME_CONFIG.levelFormula(l);
  }
  return total;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) {
    level++;
    if (level >= 100) break;
  }
  return level;
}

export function getPetStageFromLevel(
  level: number
): 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT' {
  const lvl = Math.max(1, Math.floor(level || 1));
  if (lvl >= 30) return 'LEGENDARY_CAT';
  if (lvl >= 20) return 'WISE_CAT';
  if (lvl >= 10) return 'ADULT_CAT';
  if (lvl >= 5) return 'YOUNG_CAT';
  return 'KITTEN';
}

function getLocalProfile(userId: string) {
  let localUser = localDb.getUser(userId);
  if (!localUser) {
    localUser = {
      id: userId,
      email: `${userId}@local.dev`,
      nickname: 'Scan-chan Hunter',
      avatar: 'calico',
      mode: 'ARASHU',
      progress: { xp: 0, level: 1, streak: 0, lastActiveDate: null },
      pet: {
        name: 'Scan-chan Jr.',
        stage: 'KITTEN',
        stats: { hunger: 80, affection: 80 },
      },
      settings: {
        theme: 'default',
        metadata: {
          selectedBorder: 'none',
          selectedAccessory: 'none',
          selectedTitle: '',
          selectedRoom: 'cozy',
        },
      },
      foodInventory: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localDb.saveUser(localUser);
  }

  const rawMeta = localUser.settings?.metadata || {};
  let selectedTheme = localUser.settings?.theme || 'default';
  let selectedBorder = rawMeta.selectedBorder || 'none';
  let selectedAccessory = rawMeta.selectedAccessory || 'none';
  let selectedTitle = rawMeta.selectedTitle || '';
  let selectedRoom = rawMeta.selectedRoom || 'cozy';

  if (selectedTheme.includes(':')) {
    const parts = selectedTheme.split(':');
    selectedTheme = parts[0] || 'default';
    if (!rawMeta.selectedBorder && parts[1]) selectedBorder = parts[1];
    if (!rawMeta.selectedAccessory && parts[2]) selectedAccessory = parts[2];
    if (!rawMeta.selectedTitle && parts[3]) selectedTitle = parts[3];
    if (!rawMeta.selectedRoom && parts[4]) selectedRoom = parts[4];
  }

  const xp = localUser.progress?.xp ?? 0;
  let streak = localUser.progress?.streak ?? 0;
  const lastActiveDate = localUser.progress?.lastActiveDate || null;

  // Real-time daily streak audit: if user missed 1 full calendar day without scanning, streak drops to 0
  if (lastActiveDate && streak > 0) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastParts = lastActiveDate.split('-').map(Number);
    const todayParts = todayStr.split('-').map(Number);
    const last = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
    const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      streak = 0;
      localUser.progress.streak = 0;
      localDb.saveUser(localUser);
    }
  }

  const streakMultiplier = calculateStreakMultiplier(streak);

  const currentLevel = levelFromXp(xp);

  return {
    nickname: localUser.nickname || 'Hunter',
    avatar: localUser.avatar || 'calico',
    mode: localUser.mode,
    xp,
    level: currentLevel,
    streak,
    streakMultiplier,
    lastActiveDate,
    petName: (typeof rawMeta.petName === 'string' && rawMeta.petName) || localUser.pet?.name || 'Scan-chan Jr.',
    petStage: getPetStageFromLevel(currentLevel),
    petHunger: localUser.pet?.stats?.hunger ?? 80,
    petAffection: localUser.pet?.stats?.affection ?? 80,
    foodInventory: localUser.foodInventory || {},
    selectedTheme,
    selectedBorder,
    selectedAccessory,
    selectedTitle,
    selectedRoom,
    registeredBarcodes: Array.isArray(rawMeta.registeredBarcodes) ? rawMeta.registeredBarcodes : [],
    scanHistory: Array.from(new Set([
      ...(Array.isArray(rawMeta.scanHistory) ? rawMeta.scanHistory : []),
      ...localDb.getUserScans(userId, 50),
    ])).slice(0, 50),
    lastFedBarcode: typeof rawMeta.lastFedBarcode === 'string' ? rawMeta.lastFedBarcode : '',
    dailyPetCount: typeof rawMeta.dailyPetCount === 'number' ? rawMeta.dailyPetCount : 0,
    lastPetDate: typeof rawMeta.lastPetDate === 'string' ? rawMeta.lastPetDate : null,
    lastAffectionDecayAt: typeof rawMeta.lastAffectionDecayAt === 'number' && rawMeta.lastAffectionDecayAt > 0
      ? rawMeta.lastAffectionDecayAt
      : Date.now(),
    lastFedAt: typeof rawMeta.lastFedAt === 'number' && rawMeta.lastFedAt > 0
      ? rawMeta.lastFedAt
      : Date.now(),
    lastHungerDecayAt: typeof rawMeta.lastHungerDecayAt === 'number' && rawMeta.lastHungerDecayAt > 0
      ? rawMeta.lastHungerDecayAt
      : Date.now(),
  };
}

function updateLocalProfile(userId: string, input: ProfileUpdateInput) {
  let localUser = localDb.getUser(userId);
  if (!localUser) {
    getLocalProfile(userId);
    localUser = localDb.getUser(userId)!;
  }

  const xp = typeof input.xp === 'number' ? input.xp : localUser.progress.xp;
  const level = xp !== undefined ? levelFromXp(xp) : localUser.progress.level;
  const streak = typeof input.streak === 'number' ? input.streak : localUser.progress.streak;
  const lastActiveDate = input.lastActiveDate !== undefined ? input.lastActiveDate : localUser.progress.lastActiveDate;

  const existingMeta = localUser.settings?.metadata || {};
  const updatedMeta = {
    ...existingMeta,
    ...(input.selectedBorder !== undefined && { selectedBorder: input.selectedBorder }),
    ...(input.selectedAccessory !== undefined && { selectedAccessory: input.selectedAccessory }),
    ...(input.selectedTitle !== undefined && { selectedTitle: input.selectedTitle }),
    ...(input.selectedRoom !== undefined && { selectedRoom: input.selectedRoom }),
    ...(input.petName !== undefined && { petName: input.petName }),
    ...(input.registeredBarcodes !== undefined && { registeredBarcodes: input.registeredBarcodes }),
    ...(input.scanHistory !== undefined && { scanHistory: input.scanHistory }),
    ...(input.lastFedBarcode !== undefined && { lastFedBarcode: input.lastFedBarcode }),
    ...(input.dailyPetCount !== undefined && { dailyPetCount: input.dailyPetCount }),
    ...(input.lastPetDate !== undefined && { lastPetDate: input.lastPetDate }),
    ...(input.lastAffectionDecayAt !== undefined && { lastAffectionDecayAt: input.lastAffectionDecayAt }),
    ...(input.lastFedAt !== undefined && { lastFedAt: input.lastFedAt }),
    ...(input.lastHungerDecayAt !== undefined && { lastHungerDecayAt: input.lastHungerDecayAt }),
  };

  let foodInv: Record<string, number> = {};
  if (input.foodInventory) {
    for (const [key, qty] of Object.entries(input.foodInventory)) {
      if (qty > 0) {
        foodInv[key] = qty;
      }
    }
  } else {
    foodInv = { ...(localUser.foodInventory || {}) };
  }

  localUser.progress = {
    ...localUser.progress,
    xp,
    level,
    streak,
    lastActiveDate,
  };

  localUser.pet = {
    name: input.petName || localUser.pet.name,
    stage: getPetStageFromLevel(level),
    stats: {
      hunger: input.petHunger !== undefined ? input.petHunger : localUser.pet.stats.hunger,
      affection: input.petAffection !== undefined ? input.petAffection : localUser.pet.stats.affection,
    },
  };

  localUser.settings = {
    theme: input.selectedTheme || localUser.settings.theme,
    sound: false,
    metadata: updatedMeta,
  };
  localUser.foodInventory = foodInv;

  localDb.saveUser(localUser);
  return { success: true };
}

export async function getPlayerProfile(userId: string) {
  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        pet: {
          include: { stats: true },
        },
        settings: true,
        inventory: {
          include: { items: true },
        },
      },
    });

    if (!dbUser) {
      const localUser = localDb.getUser(userId);
      const nickname = localUser?.nickname || 'Scan-chan Hunter';
      const avatar = localUser?.avatar || 'calico';

      // Automatically create default user entry if not yet populated
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          mode: 'ARASHU',
          nickname,
          avatar,
          progress: {
            create: { xp: 0, level: 1, streak: 0 },
          },
          pet: {
            create: {
              name: 'Scan-chan Jr.',
              stage: 'KITTEN',
              stats: {
                create: { hunger: 80, affection: 80 },
              },
            },
          },
          settings: {
            create: {
              theme: 'default',
              metadata: {
                selectedBorder: 'none',
                selectedAccessory: 'none',
                selectedTitle: '',
                selectedRoom: 'cozy',
                lastFedAt: Date.now(),
                lastHungerDecayAt: Date.now(),
                lastAffectionDecayAt: Date.now(),
              },
            },
          },
          inventory: {
            create: {},
          },
        },
        include: {
          progress: true,
          pet: {
            include: { stats: true },
          },
          settings: true,
          inventory: {
            include: { items: true },
          },
        },
      });
    }

    // Parse food inventory
    const foodInventory: Record<string, number> = {};
    if (dbUser.inventory?.items) {
      for (const item of dbUser.inventory.items) {
        if (item.type === 'FOOD') {
          foodInventory[item.itemKey] = item.quantity;
        }
      }
    }

    // Parse cosmetics & trackers from metadata or fallback
    const rawMeta = (dbUser.settings?.metadata as any) || {};
    let selectedTheme = dbUser.settings?.theme || 'default';
    let selectedBorder = rawMeta.selectedBorder || 'none';
    let selectedAccessory = rawMeta.selectedAccessory || 'none';
    let selectedTitle = rawMeta.selectedTitle || '';
    let selectedRoom = rawMeta.selectedRoom || 'cozy';
    let registeredBarcodes: string[] = Array.isArray(rawMeta.registeredBarcodes) ? rawMeta.registeredBarcodes : [];
    let scanHistory: string[] = Array.isArray(rawMeta.scanHistory) ? rawMeta.scanHistory : [];

    // Hydrate scanHistory from scan_logs (ScanHistory table) in addition to metadata
    try {
      const dbLogs = await prisma.scanHistory.findMany({
        where: { userId },
        orderBy: { scannedAt: 'desc' },
        take: 50,
        select: { barcodeNumber: true },
      });
      if (dbLogs.length > 0) {
        const logBarcodes = dbLogs.map((l) => l.barcodeNumber);
        scanHistory = Array.from(new Set([...scanHistory, ...logBarcodes])).slice(0, 50);
      }
    } catch (e) {
      console.warn('[getPlayerProfile] Error fetching scan_logs:', e);
    }

    // Handle migration from old colon-separated string if metadata was empty
    if (selectedTheme.includes(':')) {
      const parts = selectedTheme.split(':');
      selectedTheme = parts[0] || 'default';
      if (!rawMeta.selectedBorder && parts[1]) selectedBorder = parts[1];
      if (!rawMeta.selectedAccessory && parts[2]) selectedAccessory = parts[2];
      if (!rawMeta.selectedTitle && parts[3]) selectedTitle = parts[3];
      if (!rawMeta.selectedRoom && parts[4]) selectedRoom = parts[4];
    }

    const xp = dbUser.progress?.xp ?? 0;
    const currentLevel = levelFromXp(xp);
    let streak = dbUser.progress?.streak ?? 0;
    const lastActiveDate = (typeof rawMeta.lastActiveDate === 'string' && rawMeta.lastActiveDate)
      ? rawMeta.lastActiveDate
      : (dbUser.progress?.lastActiveDate
          ? `${dbUser.progress.lastActiveDate.getFullYear()}-${String(dbUser.progress.lastActiveDate.getMonth() + 1).padStart(2, '0')}-${String(dbUser.progress.lastActiveDate.getDate()).padStart(2, '0')}`
          : null);

    if (lastActiveDate && streak > 0) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const lastParts = lastActiveDate.split('-').map(Number);
      const todayParts = todayStr.split('-').map(Number);
      const last = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
      const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
      const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        streak = 0;
      }
    }

    const streakMultiplier = calculateStreakMultiplier(streak);

    return {
      nickname: dbUser.nickname || 'Hunter',
      avatar: dbUser.avatar || 'calico',
      mode: dbUser.mode,
      xp,
      level: currentLevel,
      streak,
      streakMultiplier,
      lastActiveDate,
      petName: (dbUser.pet?.name && dbUser.pet.name !== 'Scan-chan Jr.')
        ? dbUser.pet.name
        : ((typeof rawMeta.petName === 'string' && rawMeta.petName) || dbUser.pet?.name || 'Scan-chan Jr.'),
      petStage: getPetStageFromLevel(currentLevel),
      petHunger: dbUser.pet?.stats?.hunger ?? 80,
      petAffection: dbUser.pet?.stats?.affection ?? 80,
      foodInventory,
      selectedTheme,
      selectedBorder,
      selectedAccessory,
      selectedTitle,
      selectedRoom,
      registeredBarcodes,
      scanHistory,
      lastFedBarcode: typeof rawMeta.lastFedBarcode === 'string' ? rawMeta.lastFedBarcode : '',
      dailyPetCount: typeof rawMeta.dailyPetCount === 'number' ? rawMeta.dailyPetCount : 0,
      lastPetDate: typeof rawMeta.lastPetDate === 'string' ? rawMeta.lastPetDate : null,
      lastAffectionDecayAt: typeof rawMeta.lastAffectionDecayAt === 'number' && rawMeta.lastAffectionDecayAt > 0
        ? rawMeta.lastAffectionDecayAt
        : Date.now(),
      lastFedAt: typeof rawMeta.lastFedAt === 'number' && rawMeta.lastFedAt > 0
        ? rawMeta.lastFedAt
        : Date.now(),
      lastHungerDecayAt: typeof rawMeta.lastHungerDecayAt === 'number' && rawMeta.lastHungerDecayAt > 0
        ? rawMeta.lastHungerDecayAt
        : Date.now(),
    };
  } catch (error) {
    console.warn('[getPlayerProfile] Prisma error, using local fallback:', error);
    return getLocalProfile(userId);
  }
}

export async function updatePlayerPreferences(userId: string, input: ProfilePreferencesInput) {
  // Update local DB for dev/fallback sync
  try {
    const localUser = localDb.getUser(userId);
    if (localUser) {
      if (input.petName) {
        localUser.pet = localUser.pet || { name: input.petName, stage: 'KITTEN', stats: { hunger: 80, affection: 80 } };
        localUser.pet.name = input.petName.trim().slice(0, 24);
      }
      localUser.settings = localUser.settings || { theme: 'default', sound: true, metadata: {} };
      localUser.settings.theme = input.selectedTheme || localUser.settings.theme || 'default';
      localUser.settings.metadata = {
        ...(localUser.settings.metadata || {}),
        ...(input.selectedBorder !== undefined && { selectedBorder: input.selectedBorder }),
        ...(input.selectedAccessory !== undefined && { selectedAccessory: input.selectedAccessory }),
        ...(input.selectedTitle !== undefined && { selectedTitle: input.selectedTitle }),
        ...(input.selectedRoom !== undefined && { selectedRoom: input.selectedRoom }),
      };
      localDb.saveUser(localUser);
    }
  } catch (e) {
    console.warn('[updatePlayerPreferences] localDb update warning:', e);
  }

  const cleanPetName = input.petName ? input.petName.trim().slice(0, 24) : undefined;

  const currentSettings = await prisma.settings.findUnique({ where: { userId } }).catch(() => null);
  const existingMeta = (currentSettings?.metadata as any) || {};

  const updatedMeta = {
    ...existingMeta,
    ...(input.selectedBorder !== undefined && { selectedBorder: input.selectedBorder }),
    ...(input.selectedAccessory !== undefined && { selectedAccessory: input.selectedAccessory }),
    ...(input.selectedTitle !== undefined && { selectedTitle: input.selectedTitle }),
    ...(input.selectedRoom !== undefined && { selectedRoom: input.selectedRoom }),
  };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(cleanPetName && {
          pet: {
            upsert: {
              create: {
                name: cleanPetName,
                stage: 'KITTEN',
                stats: { create: { hunger: 80, affection: 80 } },
              },
              update: {
                name: cleanPetName,
              },
            },
          },
        }),
        settings: {
          upsert: {
            create: {
              theme: input.selectedTheme || 'default',
              sound: true,
              metadata: updatedMeta,
            },
            update: {
              ...(input.selectedTheme && { theme: input.selectedTheme }),
              metadata: updatedMeta,
            },
          },
        },
      },
    });
  } catch (err) {
    console.warn('[updatePlayerPreferences] Prisma error, handled gracefully:', err);
  }

  return { success: true };
}

/**
 * SC-002: Strips progression authority from updatePlayerProfile.
 * Only saves non-economic cosmetic preferences and sanitized petName.
 */
export async function updatePlayerProfile(userId: string, input: ProfileUpdateInput) {
  return await updatePlayerPreferences(userId, input);
}

/**
 * SC-002: Server-Authoritative Pet Cat Action (Elus Kucing)
 * Validates daily quota (max 3/day in Asia/Jakarta WIB) and applies atomic affection boost.
 */
export async function executePetAction(userId: string) {
  const todayWIB = getWibDateKey();
  const now = Date.now();

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: {
        pet: { include: { stats: true } },
        settings: true,
      },
    });

    if (!user) {
      const err = new Error('User not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const currentMeta = (user.settings?.metadata as any) || {};
    const lastPetDate = currentMeta.lastPetDate || null;
    const isNewDay = lastPetDate !== todayWIB;
    const currentDailyCount = isNewDay ? 0 : (Number(currentMeta.dailyPetCount) || 0);

    // Limit check: max 3 per day (WIB)
    if (currentDailyCount >= 3) {
      const err = new Error('Daily pet limit reached (max 3 per day)');
      (err as any).statusCode = 429;
      throw err;
    }

    // Cooldown check: 10 seconds between pet actions
    const lastPetTime = Number(currentMeta.lastPetTime) || 0;
    if (now - lastPetTime < 10000) {
      const err = new Error('Please wait before petting again');
      (err as any).statusCode = 429;
      throw err;
    }

    const newDailyCount = currentDailyCount + 1;
    const currentAffection = Math.max(0, Math.min(100, Number(user.pet?.stats?.affection ?? 80)));
    const newAffection = Math.min(100, currentAffection + 5);

    if (user.pet?.id) {
      await tx.petStats.upsert({
        where: { petId: user.pet.id },
        create: {
          petId: user.pet.id,
          hunger: user.pet.stats?.hunger ?? 80,
          affection: newAffection,
        },
        update: {
          affection: newAffection,
        },
      });
    }

    const updatedMeta = {
      ...currentMeta,
      dailyPetCount: newDailyCount,
      lastPetDate: todayWIB,
      lastPetTime: now,
      lastAffectionDecayAt: now,
    };

    await tx.settings.upsert({
      where: { userId },
      create: {
        userId,
        theme: 'default',
        metadata: updatedMeta,
      },
      update: {
        metadata: updatedMeta,
      },
    });

    return {
      petAffection: newAffection,
      dailyPetCount: newDailyCount,
      lastPetDate: todayWIB,
      lastPetTime: now,
      lastAffectionDecayAt: now,
      isMaxedJustNow: newDailyCount === 3,
    };
  });
}

/**
 * SC-002: Server-Authoritative Feed Action (Beri Makan)
 * Validates stock in user inventory, decrements item, and applies deterministic gains.
 */
export async function executeFeedAction(userId: string, barcode: string, category?: string) {
  const cleanBarcode = String(barcode || '').trim();
  if (!cleanBarcode) {
    const err = new Error('Invalid barcode');
    (err as any).statusCode = 400;
    throw err;
  }
  const now = Date.now();

  return await prisma.$transaction(async (tx) => {
    // Parallel initial reads to minimize database transaction latency
    const [userInventory, userPet, userProgress, userSettings] = await Promise.all([
      tx.inventory.upsert({
        where: { userId },
        create: { userId },
        update: {},
        include: { items: true },
      }),
      tx.pet.findUnique({ where: { userId }, include: { stats: true } }),
      tx.progress.findUnique({ where: { userId } }),
      tx.settings.findUnique({ where: { userId } }),
    ]);

    let foodItem = userInventory.items.find(
      (item) => item.type === 'FOOD' && item.itemKey === cleanBarcode
    );

    if (!foodItem || foodItem.quantity <= 0) {
      // Safe reconciliation: check if user legitimately scanned this consumable product previously
      const userScanned = await tx.scanHistory.findFirst({
        where: { userId, barcodeNumber: cleanBarcode },
      });

      if (userScanned && isConsumableCategory(category)) {
        foodItem = await tx.inventoryItem.upsert({
          where: {
            inventoryId_type_itemKey: {
              inventoryId: userInventory.id,
              type: 'FOOD',
              itemKey: cleanBarcode,
            },
          },
          create: {
            inventoryId: userInventory.id,
            type: 'FOOD',
            itemKey: cleanBarcode,
            quantity: 1,
          },
          update: {},
        });
      } else {
        const err = new Error('Food item is not available in your cloud inventory');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    // Decrement item atomically
    let remainingQuantity = 0;
    if (foodItem.quantity <= 1) {
      await tx.inventoryItem.delete({
        where: { id: foodItem.id },
      });
      remainingQuantity = 0;
    } else {
      const updatedItem = await tx.inventoryItem.update({
        where: { id: foodItem.id },
        data: { quantity: foodItem.quantity - 1 },
      });
      remainingQuantity = updatedItem.quantity;
    }

    const cat = (category || '').toLowerCase();
    let hungerGain = 15;
    if (cat.includes('dairy') || cat.includes('milk') || cat.includes('susu') || cat.includes('cheese') || cat.includes('yogurt')) {
      hungerGain = 20;
    } else if (cat.includes('drink') || cat.includes('beverage') || cat.includes('minuman') || cat.includes('air mineral') || cat.includes('juice') || cat.includes('water') || cat.includes('teh') || cat.includes('kopi')) {
      hungerGain = 12;
    } else if (cat.includes('instant') || cat.includes('noodle') || cat.includes('ramen') || cat.includes('mie') || cat.includes('meal')) {
      hungerGain = 25;
    } else if (cat.includes('frozen') || cat.includes('ice cream') || cat.includes('es krim')) {
      hungerGain = 18;
    } else if (cat.includes('snack') || cat.includes('candy') || cat.includes('biscuit') || cat.includes('cookie') || cat.includes('camilan') || cat.includes('food') || cat.includes('makanan')) {
      hungerGain = 15;
    }

    const currentHunger = Math.max(0, Math.min(100, Number(userPet?.stats?.hunger ?? 80)));
    if (currentHunger >= 100) {
      const err = new Error('Scan-chan is already full! 😸');
      (err as any).statusCode = 400;
      throw err;
    }
    const currentAffection = Math.max(0, Math.min(100, Number(userPet?.stats?.affection ?? 80)));
    const currentTotalXp = Math.max(0, Number(userProgress?.xp ?? 0));

    const wasDead = currentHunger === 0;
    const isSpecialFood = cat.includes('snack') || cat.includes('candy') || cat.includes('biscuit')
      || cat.includes('treat') || cat.includes('cookie') || cat.includes('cake') || cat.includes('dessert')
      || cat.includes('permen') || cat.includes('cokelat') || cat.includes('coklat') || cat.includes('camilan');
    const baseAffection = isSpecialFood ? 10 : 3;

    const currentMeta = (userSettings?.metadata as any) || {};
    const varietyBonus = cleanBarcode !== currentMeta.lastFedBarcode ? 5 : 0;
    const revivalBonus = wasDead ? 6 : 0;
    const affectionGain = baseAffection + varietyBonus + revivalBonus;

    // Base XP by food category: Dairy & Instant = 15 XP, Snack & Frozen = 12 XP, Drink & Candy = 10 XP
    let baseXp = 10;
    if (
      cat.includes('dairy') || cat.includes('milk') || cat.includes('susu') || cat.includes('cheese') || cat.includes('yogurt') ||
      cat.includes('instant') || cat.includes('noodle') || cat.includes('ramen') || cat.includes('mie')
    ) {
      baseXp = 15;
    } else if (
      cat.includes('snack') || cat.includes('biscuit') || cat.includes('cookie') || cat.includes('camilan') ||
      cat.includes('frozen') || cat.includes('ice cream') || cat.includes('es krim')
    ) {
      baseXp = 12;
    } else {
      baseXp = 10;
    }

    const currentStreak = typeof userProgress?.streak === 'number' ? userProgress.streak : 0;
    const streakMultiplier = calculateStreakMultiplier(currentStreak);
    const xpGain = Math.floor(baseXp * streakMultiplier);

    const newHunger = Math.min(100, currentHunger + hungerGain);
    const newAffection = Math.min(100, currentAffection + affectionGain);
    const newTotalXp = currentTotalXp + xpGain;
    const newLevel = levelFromXp(newTotalXp);
    const newStage = getPetStageFromLevel(newLevel);

    if (userPet?.id) {
      await tx.pet.update({
        where: { id: userPet.id },
        data: {
          stage: newStage,
          stats: {
            update: {
              hunger: newHunger,
              affection: newAffection,
            },
          },
        },
      });
    }

    await tx.progress.upsert({
      where: { userId },
      create: {
        userId,
        xp: newTotalXp,
        level: newLevel,
      },
      update: {
        xp: newTotalXp,
        level: newLevel,
      },
    });

    const updatedMeta = {
      ...currentMeta,
      lastFedBarcode: cleanBarcode,
      lastFedAt: now,
      lastHungerDecayAt: now,
      lastAffectionDecayAt: now,
    };

    await tx.settings.upsert({
      where: { userId },
      create: { userId, theme: 'default', metadata: updatedMeta },
      update: { metadata: updatedMeta },
    });

    const updatedItems = await tx.inventoryItem.findMany({
      where: {
        inventoryId: userInventory!.id,
        type: 'FOOD',
        quantity: { gt: 0 },
      },
    });

    const updatedFoodInventory: Record<string, number> = {};
    for (const item of updatedItems) {
      updatedFoodInventory[item.itemKey] = item.quantity;
    }

    return {
      remainingQuantity,
      petHunger: newHunger,
      petAffection: newAffection,
      petStage: newStage,
      xp: newTotalXp,
      level: newLevel,
      xpGained: xpGain,
      baseXp,
      streakMultiplier,
      foodInventory: updatedFoodInventory,
      lastFedBarcode: cleanBarcode,
      lastFedAt: now,
      lastHungerDecayAt: now,
      lastAffectionDecayAt: now,
    };
  });
}

/**
 * SC-002: Server-Authoritative Barcode Scan Action (Klaim Scan)
 * Validates product, prevents replay, updates streak (WIB), awards XP, and adds food item atomically.
 */
export async function executeScanAction(
  userId: string,
  barcodeNumber: string,
  idempotencyKey?: string,
  deviceType?: string,
  isPostRegistration?: boolean
) {
  const cleanBarcode = String(barcodeNumber || '').trim();
  if (!cleanBarcode) {
    const err = new Error('Invalid barcode number');
    (err as any).statusCode = 400;
    throw err;
  }
  const now = Date.now();
  const todayWIB = getWibDateKey();

  // 1. Process barcode lookup & registration (without writing scanHistory before transaction)
  const scanResult = await processBarcodeScan(cleanBarcode, userId, deviceType, { skipLog: true });
  const { product, isNewProduct } = scanResult;

  // 2. Perform atomic progress & inventory update in transaction
  return await prisma.$transaction(async (tx) => {
    // Replay protection: check recent scan for user within 15 seconds
    const recentScan = await tx.scanHistory.findFirst({
      where: {
        userId,
        barcodeNumber: cleanBarcode,
        scannedAt: { gte: new Date(now - 15000) },
      },
      orderBy: { scannedAt: 'desc' },
    });

    let userProgress = await tx.progress.findUnique({
      where: { userId },
    });

    if (!userProgress) {
      userProgress = await tx.progress.create({
        data: { userId, xp: 0, level: 1, streak: 0 },
      });
    }

    let xpAwarded = 0;
    let dailyFirstScanXp = 0;
    let discoveryXp = 0;
    let newStreak = userProgress.streak;
    let newTotalXp = userProgress.xp;

    // Allow post-registration scan recovery if recent scan occurred before product was registered
    const isPostRegRecovery = Boolean(isPostRegistration && recentScan && !recentScan.productId);

    if (!recentScan || isPostRegRecovery) {
      const lastActiveDateWIB = userProgress.lastActiveDate
        ? getWibDateKey(userProgress.lastActiveDate)
        : null;

      const streakCalc = recordScanStreak(userProgress.streak, lastActiveDateWIB, todayWIB);
      newStreak = streakCalc.newStreak;

      // Anti-Spam XP Source 1: Daily First Scan Bonus (+20 XP)
      const isDailyFirstScan = !hasScannedToday(lastActiveDateWIB, todayWIB);
      dailyFirstScanXp = isDailyFirstScan ? 20 : 0;

      // Anti-Spam XP Source 2: First Global Discovery Bonus (+40 XP)
      const priorGlobalScans = await tx.scanHistory.count({
        where: { barcodeNumber: cleanBarcode },
      });
      const isGlobalDiscovery = Boolean(isNewProduct) || priorGlobalScans === 0 || isPostRegRecovery;
      discoveryXp = isGlobalDiscovery ? 40 : 0;

      xpAwarded = dailyFirstScanXp + discoveryXp;
      newTotalXp = userProgress.xp + xpAwarded;

      // 1. Record scan history atomically inside transaction
      try {
        if (isPostRegRecovery && recentScan) {
          if (product?.id) {
            await tx.scanHistory.update({
              where: { id: recentScan.id },
              data: {
                productId: product.id,
                xpAwarded: Math.max(recentScan.xpAwarded || 0, xpAwarded),
              },
            });
          }
        } else {
          await tx.scanHistory.create({
            data: {
              barcodeNumber: cleanBarcode,
              productId: product?.id ?? null,
              deviceType: deviceType ?? 'webcam',
              userId: userId ?? null,
              xpAwarded: xpAwarded,
              scannedAt: new Date(now),
            },
          });
        }
      } catch (e) {
        console.warn('[executeScanAction] Scan log write error:', e);
      }

      const newLevel = levelFromXp(newTotalXp);
      const newStage = getPetStageFromLevel(newLevel);

      await tx.progress.update({
        where: { userId },
        data: {
          xp: newTotalXp,
          level: newLevel,
          streak: newStreak,
          lastActiveDate: new Date(),
        },
      });

      await tx.pet.updateMany({
        where: { userId },
        data: { stage: newStage },
      });

      // Atomically add consumable item to inventory ONLY if eligible consumable category
      const isFood = isConsumableCategory(product?.category);

      if (isFood) {
        const inv = await tx.inventory.upsert({
          where: { userId },
          create: { userId },
          update: {},
        });

        await tx.inventoryItem.upsert({
          where: {
            inventoryId_type_itemKey: {
              inventoryId: inv.id,
              type: 'FOOD',
              itemKey: cleanBarcode,
            },
          },
          create: {
            inventoryId: inv.id,
            type: 'FOOD',
            itemKey: cleanBarcode,
            quantity: 1,
          },
          update: {
            quantity: { increment: 1 },
          },
        });
      }
    }

    // Fetch updated user inventory
    const userInventory = await tx.inventory.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: true },
    });

    const foodInventory: Record<string, number> = {};
    for (const item of userInventory.items) {
      if (item.type === 'FOOD' && item.quantity > 0) {
        foodInventory[item.itemKey] = item.quantity;
      }
    }

    const recentLogs = await tx.scanHistory.findMany({
      where: { userId },
      orderBy: { scannedAt: 'desc' },
      take: 50,
      select: { barcodeNumber: true },
    });

    const scanHistory = Array.from(new Set(recentLogs.map((l) => l.barcodeNumber)));
    const currentLevel = levelFromXp(newTotalXp);

    return {
      xp: newTotalXp,
      newXp: newTotalXp,
      level: currentLevel,
      newLevel: currentLevel,
      streak: newStreak,
      newStreak: newStreak,
      petStage: getPetStageFromLevel(currentLevel),
      xpAwarded,
      xpGained: xpAwarded,
      pendingXpGain: xpAwarded,
      bonusBreakdown: {
        dailyFirstScan: dailyFirstScanXp,
        firstDiscovery: discoveryXp,
      },
      foodInventory,
      scanHistory,
      lastActiveDate: todayWIB,
      product: scanResult.product,
      isNewProduct: scanResult.isNewProduct,
      found: scanResult.found,
    };
  });
}
