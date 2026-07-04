import { vi } from 'vitest';
import { FoodCategory } from '@/types/pet';
import type {
  GameService,
  InventoryService,
  PetService,
  ProfileService,
  ScannerService,
  SettingsService,
  SharedService,
  UIService,
} from '@/services';
import { initialPetPersonality, initialPetStats } from '@/lib/pet';

const ok = () => ({ ok: true });
const pet = {
  name: 'Scan Chan',
  stage: 'kitten' as const,
  stats: initialPetStats,
  personality: initialPetPersonality,
  memories: [],
  lifecycle: 'awake' as const,
  lastDecayTimestamp: null,
  interactions: {},
  feedings: [],
};

export function createMockServices() {
  return {
    pet: {
      domain: 'pet',
      normalizePet: vi.fn(() => ({ ok: true, data: pet })),
      updateStats: vi.fn(() => ({ ok: true, data: pet })),
      applyPassiveDecay: vi.fn(() => ({ ok: true, data: pet })),
      calculateStatus: vi.fn(() => ({ ok: true, data: { lifecycle: 'awake' as const, status: 'content' as const } })),
      applyPersonalitySignal: vi.fn(() => ({ ok: true, data: pet })),
      createMemory: vi.fn(() => ({
        ok: true,
        data: { id: 'memory-1', type: 'first-feed' as const, title: 'First Feed', createdAt: '2026-07-03T00:00:00.000Z' },
      })),
      interact: vi.fn(() => ({ ok: true, data: { pet, applied: true, cooldownRemainingMs: 0 } })),
      feed: vi.fn(() => ({ ok: true, data: { pet, applied: true } })),
      preparePetState: vi.fn(ok),
      preparePetInteraction: vi.fn(ok),
      prepareFeeding: vi.fn(ok),
      prepareEvolution: vi.fn(ok),
    } satisfies PetService,
    game: {
      domain: 'game',
      prepareMissionPipeline: vi.fn(ok),
      checkAchievements: vi.fn(() => ({ ok: true, data: { unlocked: [], progress: {} } })),
      prepareRewardPipeline: vi.fn(ok),
    } satisfies GameService,
    scanner: {
      domain: 'scanner',
      translateProductToFood: vi.fn(() => ({
        ok: true,
        data: {
          status: 'unknown' as const,
          canFeed: true,
          qualityScore: 0,
          reasons: [],
          food: { id: 'unknown', name: 'Mysterious find', category: FoodCategory.UNKNOWN, nutrition: initialPetStats, isNew: true },
        },
      })),
      lookupProduct: vi.fn(async () => ({
        ok: true,
        data: {
          cache: new Map(),
          result: {
            barcode: '123',
            status: 'unknown' as const,
            product: null,
            food: null,
            translationStatus: null,
            fromCache: false,
            attempts: 0,
            error: null,
          },
        },
      })),
      runScanFeedFlow: vi.fn(async () => ({
        ok: true,
        data: {
          barcode: '123',
          timestamp: 1,
          lookupStatus: 'unknown' as const,
          lookupProduct: null,
          lookupFood: null,
          lookupFromCache: false,
          lookupAttempts: 0,
          lookupCache: new Map(),
          gameplayStatus: 'failed' as const,
          pet,
          xpGain: 0,
          nextXp: 0,
          memoryCreated: false,
          homeHubShouldRefresh: false,
          success: false,
          error: null,
        },
      })),
      runPipeline: vi.fn(() => ({
        ok: true,
        data: {
          session: { id: 'scan-1', state: 'completed' as const, startedAt: 1, completedAt: 1, lastStage: 'pet-update' as const },
          request: { barcodeValue: '123', requestedAt: 1, source: 'test' as const },
          stages: [],
          product: null,
          translationStatus: null,
          food: null,
          pet,
          error: null,
        },
      })),
      prepareScanSession: vi.fn(ok),
      prepareScanResultHandling: vi.fn(ok),
      prepareProductTranslation: vi.fn(ok),
    } satisfies ScannerService,
    ui: {
      domain: 'ui',
      prepareNavigationShell: vi.fn(ok),
      prepareFeedbackSurface: vi.fn(ok),
    } satisfies UIService,
    inventory: {
      domain: 'inventory',
      prepareInventoryRead: vi.fn(ok),
      prepareItemMutation: vi.fn(ok),
      getInventory: vi.fn(async (userId) => ({ id: 'inv-' + userId, userId, items: [], capacity: 20 })),
      addItem: vi.fn(async (userId, item) => ({ id: 'inv-' + userId, userId, items: [{ id: '1', type: item.type, itemKey: item.itemKey, quantity: item.quantity }], capacity: 20 })),
      removeItem: vi.fn(async (userId) => ({ id: 'inv-' + userId, userId, items: [], capacity: 20 })),
      executeGameplayAction: vi.fn(async (userId, action, itemId, petState, currentXp) => ({
        success: true,
        status: 'success' as const,
        inventory: { id: 'inv-' + userId, userId, items: [], capacity: 20 },
        pet: petState,
        xpGain: 10,
        nextXp: currentXp + 10,
        memoryCreated: false,
        petRefreshNeeded: true,
        homeHubRefreshNeeded: true,
        error: null,
      })),
    } satisfies InventoryService,
    profile: {
      domain: 'profile',
      prepareProfileLoad: vi.fn(ok),
      prepareSyncIdentity: vi.fn(ok),
    } satisfies ProfileService,
    settings: {
      domain: 'settings',
      prepareSettingsLoad: vi.fn(ok),
      prepareSettingsSync: vi.fn(ok),
    } satisfies SettingsService,
    shared: {
      domain: 'shared',
      prepareAppLoad: vi.fn(ok),
      prepareSyncBoundary: vi.fn(ok),
    } satisfies SharedService,
  };
}
