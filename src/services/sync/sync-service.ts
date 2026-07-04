import type { SyncRepository } from '@/repositories/sync-repository';
import type { SyncResult, SyncAction } from '@/types/sync';
import { createSyncQueue } from '@/lib/sync/queue';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class SyncService {
  private queue = createSyncQueue();
  private isSyncing = false;

  constructor(private repository: SyncRepository) {}

  async syncToServer(userId: string, mode: 'guest' | 'arashu', stores: {
    pet?: unknown;
    game?: unknown;
    inventory?: unknown;
    settings?: unknown;
  }): Promise<SyncResult> {
    if (mode === 'guest') {
      return { success: true };
    }

    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.isSyncing = true;

    try {
      if (stores.pet) await this.repository.syncPetState(userId, stores.pet);
      if (stores.game) await this.repository.syncGameState(userId, stores.game);
      if (stores.inventory) await this.repository.syncInventoryState(userId, stores.inventory);
      if (stores.settings) await this.repository.syncSettingsState(userId, stores.settings);

      const now = Date.now();
      await this.repository.updateSyncMetadata(userId, {
        lastSyncedAt: now,
        version: 1,
        source: 'web',
      });

      return { success: true, syncedAt: now };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
    } finally {
      this.isSyncing = false;
    }
  }

  async loadFromServer(userId: string, mode: 'guest' | 'arashu'): Promise<{
    success: boolean;
    data?: { pet?: unknown; game?: unknown; inventory?: unknown; settings?: unknown };
    error?: string;
  }> {
    if (mode === 'guest') {
      return { success: true, data: {} };
    }

    try {
      const [pet, game, inventory, settings] = await Promise.all([
        this.repository.loadPetState(userId),
        this.repository.loadGameState(userId),
        this.repository.loadInventoryState(userId),
        this.repository.loadSettingsState(userId),
      ]);

      return {
        success: true,
        data: {
          pet: pet ?? undefined,
          game: game ?? undefined,
          inventory: inventory ?? undefined,
          settings: settings ?? undefined,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Load failed' };
    }
  }

  enqueueAction(action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>) {
    this.queue.enqueue(action);
  }

  async processQueue(userId: string, mode: 'guest' | 'arashu'): Promise<void> {
    if (mode === 'guest' || this.queue.size() === 0) return;

    while (this.queue.size() > 0) {
      const action = this.queue.peek();
      if (!action) break;

      if (action.retryCount >= MAX_RETRIES) {
        this.queue.dequeue();
        continue;
      }

      try {
        const stores: Record<string, unknown> = {};
        stores[action.type.replace('_update', '')] = action.payload;
        
        const result = await this.syncToServer(userId, mode, stores);
        
        if (result.success) {
          this.queue.dequeue();
        } else {
          this.queue.incrementRetry(action.id);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (action.retryCount + 1)));
        }
      } catch {
        this.queue.incrementRetry(action.id);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (action.retryCount + 1)));
      }
    }
  }

  getPendingCount(): number {
    return this.queue.size();
  }

  clearQueue(): void {
    this.queue.clear();
  }
}
