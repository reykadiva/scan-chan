import { applyPetFeeding } from '@/lib/pet';
import { translateProductToFood } from '@/lib/product';
import type { FoodModel, PetStateModel } from '@/types/pet';
import type { ProductTranslationInput, ProductTranslationStatus } from '@/types/product';
import type {
  ScanRequestModel,
  ScannerPipelineError,
  ScannerPipelineResult,
  ScannerPipelineStage,
  ScannerPipelineState,
  ScanSessionModel,
  ScannerAdapterExtensionPoint,
} from '@/types/scanner';

const STAGES: readonly ScannerPipelineStage[] = [
  'scan-request',
  'barcode-value',
  'product-lookup',
  'product-translation',
  'feeding-engine',
  'pet-update',
];

export const SCANNER_ADAPTER_EXTENSION_POINTS: readonly ScannerAdapterExtensionPoint[] = [
  {
    target: 'camera-adapter',
    ownedConcerns: [
      'iphone-11-blurry-preview',
      'fast-autofocus',
      'low-scan-latency',
      'stable-camera-lifecycle',
      'safari-camera-compatibility',
      'android-camerax-compatibility',
      'orientation-handling',
      'camera-warm-up',
      'background-foreground-recovery',
      'memory-safe-disposal',
    ],
  },
  { target: 'barcode-detector-api', ownedConcerns: ['low-scan-latency', 'safari-camera-compatibility'] },
  { target: 'zxing', ownedConcerns: ['low-scan-latency'] },
  { target: 'quagga', ownedConcerns: ['low-scan-latency'] },
  { target: 'native-android-camerax', ownedConcerns: ['fast-autofocus', 'stable-camera-lifecycle', 'android-camerax-compatibility'] },
  { target: 'native-ios-visionkit', ownedConcerns: ['fast-autofocus', 'stable-camera-lifecycle'] },
  { target: 'ml-kit', ownedConcerns: ['low-scan-latency', 'orientation-handling'] },
  { target: 'custom-adapter', ownedConcerns: ['memory-safe-disposal'] },
  { target: 'native-mobile-scanner', ownedConcerns: ['fast-autofocus', 'stable-camera-lifecycle', 'android-camerax-compatibility'] },
];

export {
  applyBarcodeScanGuard,
  createBarcodeDetectorDecoder,
  createMockBarcodeDecoder,
  createZXingDecoder,
  decodeBarcodeWithFallback,
  selectBarcodeDecoder,
} from './barcode-decoder';

export {
  executeScannerGameplay,
} from './gameplay';

export {
  lookupScannedProduct,
  type ProductLookupCache,
  type ProductLookupFn,
} from './product-lookup';

export {
  executeScanFeedFlow,
} from './scan-feed-flow';

export {
  createBrowserCameraAdapter,
  createMockBrowserCameraAdapter,
} from './browser-camera-adapter';

export {
  createCameraLifecycleState,
  createCameraSessionCoordinator,
  createMockCameraLifecycle,
} from './camera-lifecycle';

export {
  createBarcodeDecoderFactory,
  createCameraAdapterError,
  createCameraAdapterFactory,
  createCameraCapability,
  createCameraSession,
  createMockCameraAdapter,
  createScanFrame,
  registerBarcodeDecoder,
  registerCameraAdapter,
  transitionCameraSession,
  type BarcodeDecoderRegistry,
  type CameraAdapterRegistry,
} from './camera-adapter';

export function createScanSession(id: string, startedAt: number): ScanSessionModel {
  return { id, state: 'ready', startedAt, completedAt: null, lastStage: null };
}

export function transitionScannerState(state: ScannerPipelineState, event: 'start' | 'complete' | 'fail' | 'reset'): ScannerPipelineState {
  if (event === 'reset') return 'idle';
  if (event === 'start') return state === 'ready' ? 'processing' : state;
  if (event === 'complete') return state === 'processing' ? 'completed' : state;
  return 'failed';
}

export function runScannerPipeline(input: {
  session: ScanSessionModel;
  request: ScanRequestModel;
  product: ProductTranslationInput | null;
  pet: PetStateModel;
}): ScannerPipelineResult {
  const barcode = input.request.barcodeValue.trim();

  if (!barcode) return fail(input, 'empty-barcode', 'barcode-value', 'Barcode value is required.');

  const translated = translateProductToFood(input.product ? { ...input.product, barcodeNumber: barcode } : null);

  if (!translated.canFeed) {
    return fail(input, 'product-unsupported', 'product-translation', 'Product cannot become pet food.', translated.food, translated.status);
  }

  const fed = applyPetFeeding(input.pet, { food: translated.food, now: input.request.requestedAt });

  if (!fed.applied) {
    return fail(input, 'feeding-rejected', 'feeding-engine', fed.reason ?? 'Feeding was rejected.', translated.food, translated.status);
  }

  return {
    session: { ...input.session, state: 'completed', completedAt: input.request.requestedAt, lastStage: 'pet-update' },
    request: input.request,
    stages: STAGES,
    product: input.product,
    translationStatus: translated.status,
    food: translated.food,
    pet: fed.pet,
    error: null,
  };
}

function fail(
  input: { session: ScanSessionModel; request: ScanRequestModel; product: ProductTranslationInput | null; pet: PetStateModel },
  code: ScannerPipelineError['code'],
  stage: ScannerPipelineStage,
  message: string,
  food: FoodModel | null = null,
  translationStatus: ProductTranslationStatus | null = null,
): ScannerPipelineResult {
  return {
    session: { ...input.session, state: 'failed', completedAt: input.request.requestedAt, lastStage: stage },
    request: input.request,
    stages: STAGES.slice(0, STAGES.indexOf(stage) + 1),
    product: input.product,
    translationStatus,
    food,
    pet: input.pet,
    error: { code, stage, message },
  };
}
