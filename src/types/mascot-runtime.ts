import type { PetLifecycleState, PetPersonalityTrait, PetStageName, PetStatsState, PetStatus } from './pet';

export type MascotEmotion = 'content' | 'happy' | 'curious' | 'sleepy' | 'hungry' | 'comforted' | 'focused';

export type MascotExpression = 'neutral' | 'happy' | 'curious' | 'sleepy' | 'hungry' | 'soft-gaze' | 'focused';

export type MascotIdleBehavior = 'breathing' | 'blinking' | 'tail-swish' | 'slow-look' | 'sleeping-breath';

export type MascotAttentionTarget = 'ambient' | 'player' | 'food' | 'scan-area' | 'window' | 'rest';

export type MascotGazeIntent = 'player' | 'cursor' | 'food' | 'window' | 'down' | 'none';

export type MascotRuntimePhase = 'idle' | 'attentive' | 'reacting' | 'resting' | 'sleeping';

export type MascotAnimationIntentName =
  | 'idle'
  | 'greet'
  | 'sleep'
  | 'rest'
  | 'look-at-player'
  | 'look-at-food'
  | 'comfort'
  | 'investigate';

export type MascotAnimationIntensity = 'minimal' | 'ambient' | 'expressive';

export type MascotRuntimeEvent = 'idle' | 'player-return' | 'food-offered' | 'player-touch' | 'scanner-open';

export type MascotAnimationAdapterTarget =
  | 'pixel-sprite-renderer'
  | 'rive'
  | 'live2d'
  | 'spine'
  | 'pixi'
  | 'canvas'
  | 'native-mobile-renderer';

export interface MascotAnimationIntent {
  readonly name: MascotAnimationIntentName;
  readonly intensity: MascotAnimationIntensity;
}

export interface MascotRuntimeInput {
  readonly stage: PetStageName;
  readonly status: PetStatus;
  readonly lifecycle: PetLifecycleState;
  readonly stats: PetStatsState;
  readonly dominantTrait: PetPersonalityTrait;
  readonly reducedMotion: boolean;
  readonly event?: MascotRuntimeEvent;
}

export interface MascotRuntimeState {
  readonly phase: MascotRuntimePhase;
  readonly emotion: MascotEmotion;
  readonly expression: MascotExpression;
  readonly idleBehavior: MascotIdleBehavior;
  readonly attentionTarget: MascotAttentionTarget;
  readonly gaze: MascotGazeIntent;
  readonly animationIntent: MascotAnimationIntent;
}

export interface MascotAnimationAdapterExtensionPoint {
  readonly target: MascotAnimationAdapterTarget;
  readonly ownsRendering: true;
}
