import type {
  GameStoreState,
  InventoryStoreState,
  PetStoreState,
  ProfileStoreState,
  ScannerStoreState,
  SettingsStoreState,
  SharedStoreState,
  UIStoreState,
} from '@/stores';

export function createMockStoreStates(overrides: {
  pet?: Partial<PetStoreState>;
  game?: Partial<GameStoreState>;
  scanner?: Partial<ScannerStoreState>;
  ui?: Partial<UIStoreState>;
  inventory?: Partial<InventoryStoreState>;
  profile?: Partial<ProfileStoreState>;
  settings?: Partial<SettingsStoreState>;
  shared?: Partial<SharedStoreState>;
} = {}) {
  return overrides;
}
