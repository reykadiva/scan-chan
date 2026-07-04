import { describe, it, expect } from 'vitest';
import * as hooks from '@/hooks/use-keyboard';

describe('useKeyboard', () => {
  it('exports useKeyboard hook', () => {
    expect(hooks.useKeyboard).toBeDefined();
    expect(typeof hooks.useKeyboard).toBe('function');
  });

  it('exports useEscape hook', () => {
    expect(hooks.useEscape).toBeDefined();
    expect(typeof hooks.useEscape).toBe('function');
  });
});
