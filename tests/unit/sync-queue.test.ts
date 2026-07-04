import { describe, it, expect, beforeEach } from 'vitest';
import { createSyncQueue } from '@/lib/sync/queue';

describe('Sync Queue', () => {
  let queue: ReturnType<typeof createSyncQueue>;

  beforeEach(() => {
    queue = createSyncQueue();
  });

  it('enqueues and dequeues actions', () => {
    queue.enqueue({ type: 'pet_update', payload: { hunger: 50 } });
    expect(queue.size()).toBe(1);

    const action = queue.dequeue();
    expect(action?.type).toBe('pet_update');
    expect(queue.size()).toBe(0);
  });

  it('generates unique action IDs', () => {
    queue.enqueue({ type: 'pet_update', payload: {} });
    queue.enqueue({ type: 'game_update', payload: {} });

    const all = queue.getAll();
    expect(all[0].id).not.toBe(all[1].id);
  });

  it('increments retry count', () => {
    queue.enqueue({ type: 'pet_update', payload: {} });
    const action = queue.peek()!;
    
    queue.incrementRetry(action.id);
    expect(queue.peek()?.retryCount).toBe(1);
  });

  it('removes specific action by ID', () => {
    queue.enqueue({ type: 'pet_update', payload: {} });
    const action = queue.peek()!;
    
    queue.remove(action.id);
    expect(queue.size()).toBe(0);
  });

  it('clears all actions', () => {
    queue.enqueue({ type: 'pet_update', payload: {} });
    queue.enqueue({ type: 'game_update', payload: {} });
    
    queue.clear();
    expect(queue.size()).toBe(0);
  });
});
