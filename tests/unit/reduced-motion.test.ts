import { describe, it, expect } from 'vitest';
import * as hooks from '@/hooks/use-reduced-motion';

describe('useReducedMotion', () => {
  it('exports useReducedMotion hook', () => {
    expect(hooks.useReducedMotion).toBeDefined();
    expect(typeof hooks.useReducedMotion).toBe('function');
  });
});
