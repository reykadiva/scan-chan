import { prisma } from '@/lib/prisma';
import { GAME_CONFIG } from '@/lib/game-config';
import { calculateStreakMultiplier } from '@/lib/streak-multiplier';
import { localDb, type LocalUser } from '@/lib/database/local-db';
import type { ProfileUpdateInput } from '@/lib/validations/profile';

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
        stats: { hunger: 50, affection: 10 },
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

  return {
    nickname: localUser.nickname || 'Hunter',
    avatar: localUser.avatar || 'calico',
    mode: localUser.mode,
    xp,
    level: levelFromXp(xp),
    streak,
    streakMultiplier,
    lastActiveDate,
    petName: localUser.pet?.name ?? 'Scan-chan Jr.',
    petStage: localUser.pet?.stage ?? 'KITTEN',
    petHunger: localUser.pet?.stats?.hunger ?? 50,
    petAffection: localUser.pet?.stats?.affection ?? 10,
    foodInventory: localUser.foodInventory || {},
    selectedTheme,
    selectedBorder,
    selectedAccessory,
    selectedTitle,
    selectedRoom,
    registeredBarcodes: Array.isArray(rawMeta.registeredBarcodes) ? rawMeta.registeredBarcodes : [],
    scanHistory: Array.isArray(rawMeta.scanHistory) ? rawMeta.scanHistory : [],
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
    ...(input.registeredBarcodes !== undefined && { registeredBarcodes: input.registeredBarcodes }),
    ...(input.scanHistory !== undefined && { scanHistory: input.scanHistory }),
  };

  const foodInv = { ...(localUser.foodInventory || {}) };
  if (input.foodInventory) {
    for (const [key, qty] of Object.entries(input.foodInventory)) {
      if (qty <= 0) {
        delete foodInv[key];
      } else {
        foodInv[key] = qty;
      }
    }
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
    stage: (input.petStage as any) || localUser.pet.stage,
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
                create: { hunger: 50, affection: 10 },
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
    let streak = dbUser.progress?.streak ?? 0;
    const lastActiveDate = dbUser.progress?.lastActiveDate
      ? dbUser.progress.lastActiveDate.toISOString().split('T')[0]
      : (rawMeta.lastActiveDate || null);

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
      level: levelFromXp(xp),
      streak,
      streakMultiplier,
      lastActiveDate,
      petName: dbUser.pet?.name ?? 'Scan-chan Jr.',
      petStage: dbUser.pet?.stage ?? 'KITTEN',
      petHunger: dbUser.pet?.stats?.hunger ?? 50,
      petAffection: dbUser.pet?.stats?.affection ?? 10,
      foodInventory,
      selectedTheme,
      selectedBorder,
      selectedAccessory,
      selectedTitle,
      selectedRoom,
      registeredBarcodes,
      scanHistory,
    };
  } catch (error) {
    console.warn('[getPlayerProfile] Prisma error, using local fallback:', error);
    return getLocalProfile(userId);
  }
}

export async function updatePlayerProfile(userId: string, input: ProfileUpdateInput) {
  // Always update local store to stay in sync
  try {
    updateLocalProfile(userId, input);
  } catch (e) {
    console.warn('[updatePlayerProfile] Error updating local profile:', e);
  }

  try {
    const xp = typeof input.xp === 'number' ? input.xp : undefined;
    const level = xp !== undefined ? levelFromXp(xp) : undefined;
    const streak = typeof input.streak === 'number' ? input.streak : undefined;

    // Fetch current user settings to merge metadata safely
    const currentSettings = await prisma.settings.findUnique({
      where: { userId },
    });

    const existingMeta = (currentSettings?.metadata as any) || {};
    const updatedMeta = {
      ...existingMeta,
      ...(input.selectedBorder !== undefined && { selectedBorder: input.selectedBorder }),
      ...(input.selectedAccessory !== undefined && { selectedAccessory: input.selectedAccessory }),
      ...(input.selectedTitle !== undefined && { selectedTitle: input.selectedTitle }),
      ...(input.selectedRoom !== undefined && { selectedRoom: input.selectedRoom }),
      ...(input.registeredBarcodes !== undefined && { registeredBarcodes: input.registeredBarcodes }),
      ...(input.scanHistory !== undefined && { scanHistory: input.scanHistory }),
      ...(input.lastActiveDate !== undefined && { lastActiveDate: input.lastActiveDate }),
    };

    // Perform transactional or chained update
    await prisma.user.update({
      where: { id: userId },
      data: {
        mode: 'ARASHU',
        ...((xp !== undefined || streak !== undefined || input.lastActiveDate !== undefined) && {
          progress: {
            upsert: {
              create: {
                xp: xp ?? 0,
                level: level ?? 1,
                streak: streak ?? 0,
                ...(input.lastActiveDate ? { lastActiveDate: new Date(input.lastActiveDate) } : {}),
              },
              update: {
                ...(xp !== undefined && { xp, level: level ?? 1 }),
                ...(streak !== undefined && { streak }),
                ...(input.lastActiveDate ? { lastActiveDate: new Date(input.lastActiveDate) } : {}),
              },
            },
          },
        }),
        pet: {
          upsert: {
            create: {
              name: input.petName || 'Scan-chan Jr.',
              stage: input.petStage || 'KITTEN',
              stats: {
                create: {
                  hunger: input.petHunger ?? 50,
                  affection: input.petAffection ?? 10,
                },
              },
            },
            update: {
              ...(input.petName && { name: input.petName }),
              ...(input.petStage && { stage: input.petStage }),
              stats: {
                upsert: {
                  create: {
                    hunger: input.petHunger ?? 50,
                    affection: input.petAffection ?? 10,
                  },
                  update: {
                    ...(input.petHunger !== undefined && { hunger: input.petHunger }),
                    ...(input.petAffection !== undefined && { affection: input.petAffection }),
                  },
                },
              },
            },
          },
        },
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

    // Update inventory items if specified
    if (input.foodInventory) {
      const userInventory = await prisma.inventory.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      for (const [itemKey, quantity] of Object.entries(input.foodInventory)) {
        if (quantity <= 0) {
          await prisma.inventoryItem.deleteMany({
            where: {
              inventoryId: userInventory.id,
              type: 'FOOD',
              itemKey,
            },
          });
        } else {
          await prisma.inventoryItem.upsert({
            where: {
              inventoryId_type_itemKey: {
                inventoryId: userInventory.id,
                type: 'FOOD',
                itemKey,
              },
            },
            create: {
              inventoryId: userInventory.id,
              type: 'FOOD',
              itemKey,
              quantity,
            },
            update: {
              quantity,
            },
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.warn('[updatePlayerProfile] Prisma error, handled via local fallback:', error);
    return { success: true };
  }
}
