import type { SyncAction } from '@/types/sync';

export const createSyncQueue = () => {
  let queue: SyncAction[] = [];

  return {
    enqueue: (action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>) => {
      queue.push({
        ...action,
        id: `${action.type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      });
    },
    dequeue: () => queue.shift(),
    peek: () => queue[0],
    size: () => queue.length,
    clear: () => { queue = []; },
    incrementRetry: (id: string) => {
      const action = queue.find(a => a.id === id);
      if (action) action.retryCount++;
    },
    remove: (id: string) => {
      queue = queue.filter(a => a.id !== id);
    },
    getAll: () => [...queue],
  };
};
