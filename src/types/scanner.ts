import type { Product } from './product';
import type { FoodModel, PetStateModel } from './pet';
import type { ProductTranslationInput, ProductTranslationStatus } from './product';

export interface ScanLog {
  id: string;
  barcodeNumber: string;
  productId: string | null;
  deviceType: string | null;
  scannedAt: string;
  product?: Product | null;
}

export interface ScanResult {
  found: boolean;
  product: Product | null;
  scanLog: ScanLog;
}

export interface Statistics {
  totalProducts: number;
  totalScans: number;
  mostScannedProduct: (Product & { scanCount: number }) | null;
  recentScans: ScanLog[];
  dailyScanTrend: { date: string; count: number }[];
}

export type ScannerPipelineStage =
  | 'scan-request'
  | 'barcode-value'
  | 'product-lookup'
  | 'product-translation'
  | 'feeding-engine'
  | 'pet-update';

export type ScannerPipelineState = 'idle' | 'ready' | 'processing' | 'completed' | 'failed';

export type ScannerPipelineErrorCode =
  | 'empty-barcode'
  | 'product-unsupported'
  | 'feeding-rejected';

export type ScannerAdapterTarget =
  | 'camera-adapter'
  | 'barcode-detector-api'
  | 'zxing'
  | 'quagga'
  | 'native-android-camerax'
  | 'native-ios-visionkit'
  | 'ml-kit'
  | 'custom-adapter'
  | 'native-mobile-scanner';

export type ScannerMobileReadinessConcern =
  | 'iphone-11-blurry-preview'
  | 'fast-autofocus'
  | 'low-scan-latency'
  | 'stable-camera-lifecycle'
  | 'safari-camera-compatibility'
  | 'android-camerax-compatibility'
  | 'orientation-handling'
  | 'camera-warm-up'
  | 'background-foreground-recovery'
  | 'memory-safe-disposal';

export type CameraSessionState = 'idle' | 'warming-up' | 'ready' | 'scanning' | 'paused' | 'stopped' | 'failed';

export type CameraFacingMode = 'environment' | 'user' | 'unknown';

export type CameraLifecycleEvent = 'warm-up' | 'start' | 'pause' | 'resume' | 'stop' | 'dispose';

export type CameraPermissionState = 'unknown' | 'prompt' | 'granted' | 'denied' | 'unavailable';

export type CameraLifecycleEventType =
  | CameraLifecycleEvent
  | 'background'
  | 'foreground'
  | 'orientation-change'
  | 'recover';

export type CameraErrorCode =
  | 'adapter-unavailable'
  | 'decoder-unavailable'
  | 'session-not-ready'
  | 'frame-invalid'
  | 'decode-failed'
  | 'lifecycle-failed'
  | 'duplicate-barcode'
  | 'scan-cooldown';

export interface CameraCapabilityDetection {
  readonly target: ScannerAdapterTarget;
  readonly available: boolean;
  readonly concerns: readonly ScannerMobileReadinessConcern[];
}

export interface CameraSessionModel {
  readonly id: string;
  readonly adapterTarget: ScannerAdapterTarget;
  readonly state: CameraSessionState;
  readonly facingMode: CameraFacingMode;
  readonly startedAt: number | null;
  readonly updatedAt: number;
  readonly orientation: 'portrait' | 'landscape' | 'unknown';
}

export interface CameraStateModel {
  readonly session: CameraSessionModel | null;
  readonly capabilities: readonly CameraCapabilityDetection[];
  readonly permission: CameraPermissionState;
  readonly lastError: CameraAdapterError | null;
}

export interface CameraLifecycleEventModel {
  readonly type: CameraLifecycleEventType;
  readonly occurredAt: number;
  readonly orientation?: CameraSessionModel['orientation'];
}

export interface CameraLifecycleStateModel {
  readonly camera: CameraStateModel;
  readonly events: readonly CameraLifecycleEventModel[];
  readonly disposed: boolean;
}

export interface CameraSessionCoordinator {
  warmUp: (now: number) => Promise<CameraLifecycleStateModel>;
  start: (now: number) => Promise<CameraLifecycleStateModel>;
  pause: (now: number) => Promise<CameraLifecycleStateModel>;
  resume: (now: number) => Promise<CameraLifecycleStateModel>;
  enterBackground: (now: number) => Promise<CameraLifecycleStateModel>;
  enterForeground: (now: number) => Promise<CameraLifecycleStateModel>;
  changeOrientation: (orientation: CameraSessionModel['orientation'], now: number) => CameraLifecycleStateModel;
  recover: (now: number) => Promise<CameraLifecycleStateModel>;
  shutdown: (now: number) => Promise<CameraLifecycleStateModel>;
}

export interface ScanFrameModel {
  readonly id: string;
  readonly capturedAt: number;
  readonly width: number;
  readonly height: number;
  readonly rotationDegrees: 0 | 90 | 180 | 270;
  readonly data: Uint8Array | null;
}

export interface CameraAdapterError {
  readonly code: CameraErrorCode;
  readonly message: string;
  readonly recoverable: boolean;
}

export interface CameraLifecycleControls {
  warmUp: (now: number) => Promise<CameraSessionModel>;
  start: (now: number) => Promise<CameraSessionModel>;
  pause: (now: number) => Promise<CameraSessionModel>;
  resume: (now: number) => Promise<CameraSessionModel>;
  stop: (now: number) => Promise<CameraSessionModel>;
  dispose: (now: number) => Promise<void>;
}

export interface CameraFocusControls {
  readonly supportsContinuousAutofocus: boolean;
  requestAutofocus: () => Promise<boolean>;
}

export interface CameraTorchControls {
  readonly supportsTorch: boolean;
  setTorch: (enabled: boolean) => Promise<boolean>;
}

export interface CameraZoomControls {
  readonly supportsZoom: boolean;
  setZoom: (level: number) => Promise<boolean>;
}

export interface BarcodeDecodeResult {
  readonly barcodeValue: string | null;
  readonly decodedAt: number;
  readonly error: CameraAdapterError | null;
}

export interface NormalizedBarcodeResult {
  readonly value: string;
  readonly format: string;
  readonly decodedAt: number;
  readonly source: ScannerAdapterTarget;
  readonly metrics: BarcodeDecoderMetrics;
}

export interface BarcodeDecoderMetrics {
  readonly startedAt: number;
  readonly completedAt: number;
  readonly durationMs: number;
  readonly attempts: number;
}

export interface BarcodeScanGuardState {
  readonly lastValue: string | null;
  readonly lastScannedAt: number | null;
  readonly cooldownMs: number;
}

export interface BarcodeDecoderSelectionResult {
  readonly decoder: BarcodeDecoderAdapter;
  readonly fallback: BarcodeDecoderAdapter | null;
}

export interface BarcodeDecoderAdapter {
  readonly target: ScannerAdapterTarget;
  detectCapabilities: () => Promise<CameraCapabilityDetection>;
  decode: (frame: ScanFrameModel) => Promise<BarcodeDecodeResult>;
}

export interface CameraAdapter {
  readonly target: ScannerAdapterTarget;
  detectCapabilities: () => Promise<CameraCapabilityDetection>;
  createSession: (input: { id: string; now: number; facingMode?: CameraFacingMode }) => CameraSessionModel;
  lifecycle: CameraLifecycleControls;
  focus: CameraFocusControls;
  torch: CameraTorchControls;
  zoom: CameraZoomControls;
  readFrame: (now: number) => Promise<ScanFrameModel>;
}

export interface BrowserCameraDeviceModel {
  readonly deviceId: string;
  readonly label: string;
  readonly facingMode: CameraFacingMode;
}

export interface BrowserCameraAdapter extends CameraAdapter {
  enumerateDevices: () => Promise<readonly BrowserCameraDeviceModel[]>;
  createStream: (input: { deviceId?: string; facingMode?: CameraFacingMode; now: number }) => Promise<MediaStream>;
  switchCamera: (input: { deviceId?: string; facingMode?: CameraFacingMode; now: number }) => Promise<MediaStream>;
  shutdownStream: () => void;
  getStream: () => MediaStream | null;
}

export interface ScanRequestModel {
  readonly barcodeValue: string;
  readonly requestedAt: number;
  readonly source: 'camera-adapter' | 'manual' | 'test';
}

export interface ScanSessionModel {
  readonly id: string;
  readonly state: ScannerPipelineState;
  readonly startedAt: number;
  readonly completedAt: number | null;
  readonly lastStage: ScannerPipelineStage | null;
}

export interface ScannerPipelineError {
  readonly code: ScannerPipelineErrorCode;
  readonly stage: ScannerPipelineStage;
  readonly message: string;
}

export interface ScannerPipelineResult {
  readonly session: ScanSessionModel;
  readonly request: ScanRequestModel;
  readonly stages: readonly ScannerPipelineStage[];
  readonly product: ProductTranslationInput | null;
  readonly translationStatus: ProductTranslationStatus | null;
  readonly food: FoodModel | null;
  readonly pet: PetStateModel;
  readonly error: ScannerPipelineError | null;
}

export interface ScannerAdapterExtensionPoint {
  readonly target: ScannerAdapterTarget;
  readonly ownedConcerns: readonly ScannerMobileReadinessConcern[];
}
