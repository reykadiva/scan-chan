import type { createServices } from '@/services';
import type { ServiceResult } from '@/services';

export type ServiceBundle = ReturnType<typeof createServices>;

export type ApplicationFlowName =
  | 'applicationStartup'
  | 'guestInitialization'
  | 'arashuInitialization'
  | 'scannerSession'
  | 'productLookup'
  | 'inventoryUpdate'
  | 'petUpdate'
  | 'missionUpdate'
  | 'achievementUpdate'
  | 'settingsLoad'
  | 'settingsSave'
  | 'shutdownLifecycle';

export type FutureEventSequence =
  | 'scanSuccess'
  | 'scanFailure'
  | 'feeding'
  | 'evolution'
  | 'rewards'
  | 'synchronization';

export interface FlowStep {
  readonly name: string;
  readonly run: () => ServiceResult<unknown>;
}

export interface ApplicationFlow {
  readonly name: ApplicationFlowName;
  readonly steps: readonly FlowStep[];
  run: () => readonly ServiceResult<unknown>[];
}

export type ApplicationFlows = Record<ApplicationFlowName, ApplicationFlow>;

function flow(name: ApplicationFlowName, steps: readonly FlowStep[]): ApplicationFlow {
  return {
    name,
    steps,
    run: () => steps.map((step) => step.run()),
  };
}

export const futureEventSequences: Record<FutureEventSequence, readonly ApplicationFlowName[]> = {
  scanSuccess: ['productLookup', 'inventoryUpdate', 'petUpdate', 'missionUpdate', 'achievementUpdate'],
  scanFailure: ['scannerSession'],
  feeding: ['petUpdate', 'inventoryUpdate'],
  evolution: ['petUpdate'],
  rewards: ['missionUpdate', 'achievementUpdate'],
  synchronization: ['arashuInitialization', 'settingsSave', 'shutdownLifecycle'],
};

export function createApplicationFlows(services: ServiceBundle): ApplicationFlows {
  return {
    applicationStartup: flow('applicationStartup', [
      { name: 'shared.app-load', run: services.shared.prepareAppLoad },
      { name: 'ui.navigation-shell', run: services.ui.prepareNavigationShell },
      { name: 'settings.load', run: services.settings.prepareSettingsLoad },
    ]),
    guestInitialization: flow('guestInitialization', [
      { name: 'profile.load', run: services.profile.prepareProfileLoad },
      { name: 'inventory.read', run: services.inventory.prepareInventoryRead },
    ]),
    arashuInitialization: flow('arashuInitialization', [
      { name: 'profile.sync-identity', run: services.profile.prepareSyncIdentity },
      { name: 'shared.sync-boundary', run: services.shared.prepareSyncBoundary },
    ]),
    scannerSession: flow('scannerSession', [{ name: 'scanner.session', run: services.scanner.prepareScanSession }]),
    productLookup: flow('productLookup', [
      { name: 'scanner.result-handling', run: services.scanner.prepareScanResultHandling },
    ]),
    inventoryUpdate: flow('inventoryUpdate', [{ name: 'inventory.item-mutation', run: services.inventory.prepareItemMutation }]),
    petUpdate: flow('petUpdate', [
      { name: 'pet.feeding', run: services.pet.prepareFeeding },
      { name: 'pet.evolution', run: services.pet.prepareEvolution },
    ]),
    missionUpdate: flow('missionUpdate', [{ name: 'game.mission-pipeline', run: services.game.prepareMissionPipeline }]),
    achievementUpdate: flow('achievementUpdate', [
      { name: 'game.achievement-pipeline', run: services.game.prepareAchievementPipeline },
      { name: 'game.reward-pipeline', run: services.game.prepareRewardPipeline },
    ]),
    settingsLoad: flow('settingsLoad', [{ name: 'settings.load', run: services.settings.prepareSettingsLoad }]),
    settingsSave: flow('settingsSave', [{ name: 'settings.sync', run: services.settings.prepareSettingsSync }]),
    shutdownLifecycle: flow('shutdownLifecycle', [{ name: 'shared.sync-boundary', run: services.shared.prepareSyncBoundary }]),
  };
}

// ponytail: deterministic service sequencing only; add a richer event bus when real async workflows exist.
