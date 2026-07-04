import type {
  GameRepository,
  InventoryRepository,
  PetRepository,
  ProfileRepository,
  ScannerRepository,
  SettingsRepository,
  SharedRepository,
  UIRepository,
} from '@/repositories';

export function createMockRepositories() {
  return {
    pet: { domain: 'pet' } satisfies PetRepository,
    game: {
      domain: 'game',
      getAchievementProgress: async () => ({}),
      saveAchievementProgress: async () => {},
    } satisfies GameRepository,
    scanner: { domain: 'scanner' } satisfies ScannerRepository,
    ui: { domain: 'ui' } satisfies UIRepository,
    inventory: {
      domain: 'inventory',
      getInventoryByUserId: async () => null,
      saveInventory: async (inv) => inv,
    } satisfies InventoryRepository,
    profile: { domain: 'profile' } satisfies ProfileRepository,
    settings: { domain: 'settings' } satisfies SettingsRepository,
    shared: { domain: 'shared' } satisfies SharedRepository,
  };
}
