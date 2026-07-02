import { vi } from 'vitest';
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

const ok = () => ({ ok: true });

export function createMockServices() {
  return {
    pet: {
      domain: 'pet',
      prepareFeeding: vi.fn(ok),
      prepareEvolution: vi.fn(ok),
    } satisfies PetService,
    game: {
      domain: 'game',
      prepareMissionPipeline: vi.fn(ok),
      prepareAchievementPipeline: vi.fn(ok),
      prepareRewardPipeline: vi.fn(ok),
    } satisfies GameService,
    scanner: {
      domain: 'scanner',
      prepareScanSession: vi.fn(ok),
      prepareScanResultHandling: vi.fn(ok),
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
