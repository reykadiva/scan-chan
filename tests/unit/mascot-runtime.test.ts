import { describe, expect, it } from 'vitest';
import { buildMascotRuntime, MASCOT_ANIMATION_ADAPTER_EXTENSION_POINTS } from '@/lib/mascot-runtime';
import { initialPetStats } from '@/lib/pet';
import type { MascotRuntimeInput } from '@/types';

const input: MascotRuntimeInput = {
  stage: 'kitten',
  status: 'content',
  lifecycle: 'awake',
  stats: initialPetStats,
  dominantTrait: 'gentle',
  reducedMotion: false,
};

describe('mascot runtime', () => {
  it('derives default idle intent without renderer details', () => {
    expect(buildMascotRuntime(input)).toMatchObject({
      phase: 'idle',
      emotion: 'content',
      expression: 'neutral',
      animationIntent: { name: 'idle', intensity: 'ambient' },
    });
  });

  it('prioritizes sleep and rest states from pet lifecycle/status', () => {
    expect(buildMascotRuntime({ ...input, lifecycle: 'sleeping' })).toMatchObject({
      phase: 'sleeping',
      gaze: 'none',
      animationIntent: { name: 'sleep' },
    });
    expect(buildMascotRuntime({ ...input, status: 'tired' })).toMatchObject({
      phase: 'resting',
      attentionTarget: 'rest',
      animationIntent: { name: 'rest' },
    });
  });

  it('turns pet events into deterministic expression and gaze intent', () => {
    expect(buildMascotRuntime({ ...input, event: 'player-return' })).toMatchObject({
      emotion: 'happy',
      expression: 'soft-gaze',
      gaze: 'player',
    });
    expect(buildMascotRuntime({ ...input, event: 'food-offered' })).toMatchObject({
      emotion: 'hungry',
      gaze: 'food',
      animationIntent: { name: 'look-at-food' },
    });
  });

  it('keeps reduced motion as intent, not animation implementation', () => {
    expect(buildMascotRuntime({ ...input, event: 'player-touch', reducedMotion: true }).animationIntent).toEqual({
      name: 'comfort',
      intensity: 'minimal',
    });
  });

  it('keeps future renderers isolated behind adapter extension points', () => {
    expect(MASCOT_ANIMATION_ADAPTER_EXTENSION_POINTS.map((point) => point.target)).toEqual([
      'pixel-sprite-renderer',
      'rive',
      'live2d',
      'spine',
      'pixi',
      'canvas',
      'native-mobile-renderer',
    ]);
  });
});
