export interface SyncState {
  lastSyncedAt: number | null;
  isSyncing: boolean;
  pendingActions: SyncAction[];
  syncError: string | null;
}

export interface SyncAction {
  id: string;
  type: 'pet_update' | 'game_update' | 'inventory_update' | 'settings_update';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  syncedAt?: number;
  error?: string;
  conflictsResolved?: number;
}

export interface SyncMetadata {
  userId: string;
  lastSyncedAt: number | null;
  version: number;
  source: string;
}
