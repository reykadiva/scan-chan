import type {
  MascotAnimationAdapterExtensionPoint,
  MascotAnimationIntentName,
  MascotAttentionTarget,
  MascotEmotion,
  MascotExpression,
  MascotGazeIntent,
  MascotIdleBehavior,
  MascotRuntimeInput,
  MascotRuntimePhase,
  MascotRuntimeState,
} from '@/types/mascot-runtime';

export const MASCOT_ANIMATION_ADAPTER_EXTENSION_POINTS: readonly MascotAnimationAdapterExtensionPoint[] = [
  { target: 'pixel-sprite-renderer', ownsRendering: true },
  { target: 'rive', ownsRendering: true },
  { target: 'live2d', ownsRendering: true },
  { target: 'spine', ownsRendering: true },
  { target: 'pixi', ownsRendering: true },
  { target: 'canvas', ownsRendering: true },
  { target: 'native-mobile-renderer', ownsRendering: true },
];

export const buildMascotRuntime = (input: MascotRuntimeInput): MascotRuntimeState => {
  if (input.lifecycle === 'sleeping') {
    return state(input, 'sleeping', 'sleepy', 'sleepy', 'sleeping-breath', 'rest', 'none', 'sleep');
  }

  if (input.lifecycle === 'resting' || input.status === 'resting' || input.status === 'tired') {
    return state(input, 'resting', 'sleepy', 'sleepy', 'slow-look', 'rest', 'down', 'rest');
  }

  if (input.event === 'player-return' || input.lifecycle === 'greeting') {
    return state(input, 'attentive', 'happy', 'soft-gaze', 'tail-swish', 'player', 'player', 'greet');
  }

  if (input.event === 'food-offered' || input.status === 'hungry') {
    return state(input, 'attentive', 'hungry', 'hungry', 'slow-look', 'food', 'food', 'look-at-food');
  }

  if (input.event === 'player-touch') {
    return state(input, 'reacting', 'comforted', 'soft-gaze', 'tail-swish', 'player', 'cursor', 'comfort');
  }

  if (input.event === 'scanner-open' || input.status === 'curious') {
    return state(input, 'attentive', 'curious', 'curious', 'slow-look', 'scan-area', 'window', 'investigate');
  }

  if (input.status === 'bonded' || input.stats.affection >= 80) {
    return state(input, 'idle', 'happy', 'soft-gaze', 'blinking', 'player', 'player', 'look-at-player');
  }

  return state(input, 'idle', 'content', 'neutral', input.dominantTrait === 'independent' ? 'slow-look' : 'breathing', 'ambient', 'none', 'idle');
};

const state = (
  input: MascotRuntimeInput,
  phase: MascotRuntimePhase,
  emotion: MascotEmotion,
  expression: MascotExpression,
  idleBehavior: MascotIdleBehavior,
  attentionTarget: MascotAttentionTarget,
  gaze: MascotGazeIntent,
  animation: MascotAnimationIntentName,
): MascotRuntimeState => ({
  phase,
  emotion,
  expression,
  idleBehavior,
  attentionTarget,
  gaze,
  animationIntent: {
    name: animation,
    intensity: input.reducedMotion ? 'minimal' : phase === 'reacting' || phase === 'attentive' ? 'expressive' : 'ambient',
  },
});
