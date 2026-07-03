import type {
  HomeHubDailySummary,
  HomeHubGreetingState,
  HomeHubInput,
  HomeHubRecommendedAction,
  HomeHubStatusCard,
  HomeHubViewModel,
} from '@/types/home-hub';

export const buildHomeHubViewModel = (input: HomeHubInput): HomeHubViewModel => {
  const isLoading = !input.pet.hasHydrated || !input.settings.hasHydrated;
  const isEmpty = !input.pet.isInitialized;
  const dailySummary = buildDailySummary(input);
  const pet = isEmpty
    ? null
    : {
        name: input.pet.name,
        stage: input.pet.stage,
        status: input.pet.status,
        lifecycle: input.pet.lifecycle,
        stats: input.pet.stats,
        dominantTrait: input.pet.personality.dominantTrait,
      };

  return {
    loadState: isLoading ? 'loading' : isEmpty ? 'empty' : 'ready',
    greeting: getGreetingState(input),
    pet,
    statusCards: buildStatusCards(input, isLoading, isEmpty),
    recommendedAction: pet ? getRecommendedAction(input.pet.stats) : 'scan',
    dailySummary,
    mascotRuntime: pet
      ? {
          lifecycle: input.pet.lifecycle,
          status: input.pet.status,
          reducedMotion: input.settings.reducedMotion,
        }
      : null,
    isLoading,
    isEmpty,
  };
};

const getGreetingState = (input: HomeHubInput): HomeHubGreetingState => {
  if (!input.pet.isInitialized) return 'first-meeting';
  if (input.pet.lifecycle === 'sleeping' || input.pet.lifecycle === 'resting') return 'resting';
  if (input.pet.lifecycle === 'greeting') return 'welcome-back';

  return input.pet.memories.length === 0 ? 'checking-in' : 'welcome-back';
};

const getRecommendedAction = (stats: HomeHubInput['pet']['stats']): HomeHubRecommendedAction => {
  if (stats.hunger < 45) return 'scan';
  if (stats.mood < 35) return 'comfort';
  if (stats.energy < 35) return 'rest';
  if (stats.affection < 35) return 'pet';
  if (stats.curiosity < 35) return 'observe';

  return 'scan';
};

const buildDailySummary = (input: HomeHubInput): HomeHubDailySummary => ({
  feedingsToday: input.pet.feedings.filter((feeding) => isSameUtcDay(feeding.fedAt, input.now)).length,
  memoriesToday: input.pet.memories.filter((memory) => isSameUtcDay(Date.parse(memory.createdAt), input.now)).length,
  lastBarcode: input.scanner.lastBarcode,
});

const buildStatusCards = (input: HomeHubInput, isLoading: boolean, isEmpty: boolean): HomeHubStatusCard[] => {
  if (isLoading) {
    return [
      card('pet', 'Pet', 'loading', 'Settling in'),
      card('scanner', 'Scanner', 'loading', 'Getting ready'),
      card('inventory', 'Inventory', 'loading', 'Checking items'),
      card('settings', 'Settings', 'loading', 'Loading preferences'),
      card('profile', 'Profile', 'loading', 'Loading profile'),
    ];
  }

  return [
    card('pet', 'Pet', isEmpty ? 'empty' : input.pet.status === 'content' || input.pet.status === 'bonded' ? 'ready' : 'attention', isEmpty ? 'Waiting to meet' : input.pet.status),
    card('scanner', 'Scanner', input.scanner.errorMessage ? 'attention' : input.scanner.lastBarcode ? 'ready' : 'empty', input.scanner.errorMessage ?? input.scanner.lastBarcode ?? 'No scan yet'),
    card('inventory', 'Inventory', input.inventory.itemCount > 0 ? 'ready' : 'empty', `${input.inventory.itemCount} items`),
    card('settings', 'Settings', input.settings.isInitialized ? 'ready' : 'empty', input.settings.reducedMotion ? 'Reduced motion' : 'Motion ready'),
    card('profile', 'Profile', input.profile.nickname ? 'ready' : 'empty', input.profile.nickname ?? input.profile.mode),
  ];
};

const card = (id: HomeHubStatusCard['id'], label: string, state: HomeHubStatusCard['state'], value: string): HomeHubStatusCard => ({
  id,
  label,
  state,
  value,
});

const isSameUtcDay = (left: number, right: number) => {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;

  return new Date(left).toISOString().slice(0, 10) === new Date(right).toISOString().slice(0, 10);
};
