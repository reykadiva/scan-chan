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
  | 'native-mobile-scanner';

export type ScannerMobileReadinessConcern =
  | 'iphone-11-blurry-preview'
  | 'fast-autofocus'
  | 'low-scan-latency'
  | 'stable-camera-lifecycle'
  | 'safari-camera-compatibility'
  | 'android-camerax-compatibility';

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
