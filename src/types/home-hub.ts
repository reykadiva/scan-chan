import type {
  FeedingRecord,
  PetLifecycleState,
  PetMemory,
  PetPersonalityState,
  PetStageName,
  PetStatsState,
  PetStatus,
} from './pet';

export type HomeHubLoadState = 'loading' | 'empty' | 'ready';

export type HomeHubGreetingState = 'first-meeting' | 'welcome-back' | 'checking-in' | 'resting';

export type HomeHubRecommendedAction = 'scan' | 'pet' | 'comfort' | 'observe' | 'rest';

export type HomeHubStatusCardId = 'pet' | 'scanner' | 'inventory' | 'settings' | 'profile';

export type HomeHubStatusCardState = 'loading' | 'empty' | 'ready' | 'attention';

export type HomeHubScannerState = 'idle' | 'requesting-permission' | 'ready' | 'scanning' | 'paused' | 'success' | 'error';

export interface HomeHubPetSnapshot {
  readonly isInitialized: boolean;
  readonly hasHydrated: boolean;
  readonly name: string;
  readonly stage: PetStageName;
  readonly stats: PetStatsState;
  readonly personality: PetPersonalityState;
  readonly memories: readonly PetMemory[];
  readonly lifecycle: PetLifecycleState;
  readonly status: PetStatus;
  readonly feedings: readonly FeedingRecord[];
}

export interface HomeHubScannerSnapshot {
  readonly isInitialized: boolean;
  readonly scanState: HomeHubScannerState;
  readonly lastBarcode: string | null;
  readonly errorMessage: string | null;
}

export interface HomeHubInventorySnapshot {
  readonly isInitialized: boolean;
  readonly itemCount: number;
}

export interface HomeHubSettingsSnapshot {
  readonly isInitialized: boolean;
  readonly hasHydrated: boolean;
  readonly reducedMotion: boolean;
}

export interface HomeHubProfileSnapshot {
  readonly isInitialized: boolean;
  readonly mode: 'guest' | 'arashu';
  readonly nickname: string | null;
}

export interface HomeHubInput {
  readonly now: number;
  readonly pet: HomeHubPetSnapshot;
  readonly scanner: HomeHubScannerSnapshot;
  readonly inventory: HomeHubInventorySnapshot;
  readonly settings: HomeHubSettingsSnapshot;
  readonly profile: HomeHubProfileSnapshot;
}

export interface HomeHubPetSummary {
  readonly name: string;
  readonly stage: PetStageName;
  readonly status: PetStatus;
  readonly lifecycle: PetLifecycleState;
  readonly stats: PetStatsState;
  readonly dominantTrait: PetPersonalityState['dominantTrait'];
}

export interface HomeHubStatusCard {
  readonly id: HomeHubStatusCardId;
  readonly label: string;
  readonly state: HomeHubStatusCardState;
  readonly value: string;
}

export interface HomeHubDailySummary {
  readonly feedingsToday: number;
  readonly memoriesToday: number;
  readonly lastBarcode: string | null;
}

export interface HomeHubMascotRuntimeHint {
  readonly lifecycle: PetLifecycleState;
  readonly status: PetStatus;
  readonly reducedMotion: boolean;
}

export interface HomeHubViewModel {
  readonly loadState: HomeHubLoadState;
  readonly greeting: HomeHubGreetingState;
  readonly pet: HomeHubPetSummary | null;
  readonly statusCards: readonly HomeHubStatusCard[];
  readonly recommendedAction: HomeHubRecommendedAction;
  readonly dailySummary: HomeHubDailySummary;
  readonly mascotRuntime: HomeHubMascotRuntimeHint | null;
  readonly isLoading: boolean;
  readonly isEmpty: boolean;
}
