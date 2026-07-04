import { describe, it, expect } from 'vitest';
import * as hooks from '@/hooks/use-focus-trap';

describe('useFocusTrap', () => {
  it('exports useFocusTrap hook', () => {
    expect(hooks.useFocusTrap).toBeDefined();
    expect(typeof hooks.useFocusTrap).toBe('function');
  });
});
