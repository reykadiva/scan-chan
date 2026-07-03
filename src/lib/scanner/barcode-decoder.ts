import { createCameraAdapterError, createCameraCapability } from '@/lib/scanner/camera-adapter';
import type {
  BarcodeDecodeResult,
  BarcodeDecoderAdapter,
  BarcodeDecoderMetrics,
  BarcodeDecoderSelectionResult,
  BarcodeScanGuardState,
  CameraAdapterError,
  NormalizedBarcodeResult,
  ScanFrameModel,
  ScannerAdapterTarget,
} from '@/types/scanner';

type BarcodeDetectorLike = {
  detect: (frame: ScanFrameModel) => Promise<readonly { rawValue?: string; format?: string }[]>;
};

type ZXingDecode = (frame: ScanFrameModel) => Promise<string | null>;

export function createBarcodeDetectorDecoder(detector: BarcodeDetectorLike | null = getBarcodeDetector()): BarcodeDecoderAdapter {
  return {
    target: 'barcode-detector-api',
    detectCapabilities: async () => createCameraCapability('barcode-detector-api', Boolean(detector)),
    decode: async (frame) => {
      if (!detector) return failedDecode(frame, 'decoder-unavailable', 'BarcodeDetector is unavailable.');
      const [result] = await detector.detect(frame);
      return { barcodeValue: result?.rawValue?.trim() || null, decodedAt: frame.capturedAt, error: null };
    },
  };
}

export function createZXingDecoder(decode: ZXingDecode | null = null): BarcodeDecoderAdapter {
  return {
    target: 'zxing',
    detectCapabilities: async () => createCameraCapability('zxing', Boolean(decode)),
    decode: async (frame) => {
      if (!decode) return failedDecode(frame, 'decoder-unavailable', 'ZXing decoder is unavailable.');
      return { barcodeValue: (await decode(frame))?.trim() || null, decodedAt: frame.capturedAt, error: null };
    },
  };
}

export function selectBarcodeDecoder(input: {
  barcodeDetector: BarcodeDecoderAdapter;
  zxing: BarcodeDecoderAdapter;
  prefer?: ScannerAdapterTarget;
}): BarcodeDecoderSelectionResult {
  return input.prefer === 'zxing'
    ? { decoder: input.zxing, fallback: input.barcodeDetector }
    : { decoder: input.barcodeDetector, fallback: input.zxing };
}

export async function decodeBarcodeWithFallback(input: {
  frame: ScanFrameModel;
  selected: BarcodeDecoderSelectionResult;
  now: number;
}): Promise<NormalizedBarcodeResult | CameraAdapterError> {
  const startedAt = input.now;
  const primary = await input.selected.decoder.decode(input.frame);
  const first = normalizeDecoded(primary, input.selected.decoder.target, startedAt, 1);

  if (!isDecoderError(first)) return first;
  if (!input.selected.fallback) return first;

  const fallback = await input.selected.fallback.decode(input.frame);
  return normalizeDecoded(fallback, input.selected.fallback.target, startedAt, 2);
}

export function applyBarcodeScanGuard(
  result: NormalizedBarcodeResult,
  guard: BarcodeScanGuardState,
): NormalizedBarcodeResult | CameraAdapterError {
  if (guard.lastValue === result.value) {
    return createCameraAdapterError('duplicate-barcode', 'Duplicate barcode ignored.');
  }

  if (guard.lastScannedAt !== null && result.decodedAt - guard.lastScannedAt < guard.cooldownMs) {
    return createCameraAdapterError('scan-cooldown', 'Scan cooldown is active.');
  }

  return result;
}

export function createMockBarcodeDecoder(input: {
  target?: ScannerAdapterTarget;
  value?: string | null;
  error?: CameraAdapterError | null;
} = {}): BarcodeDecoderAdapter {
  const target = input.target ?? 'custom-adapter';
  return {
    target,
    detectCapabilities: async () => createCameraCapability(target, !input.error),
    decode: async (frame): Promise<BarcodeDecodeResult> => ({
      barcodeValue: input.value ?? null,
      decodedAt: frame.capturedAt,
      error: input.error ?? null,
    }),
  };
}

function normalizeDecoded(
  result: BarcodeDecodeResult,
  source: ScannerAdapterTarget,
  startedAt: number,
  attempts: number,
): NormalizedBarcodeResult | CameraAdapterError {
  if (result.error) return result.error;
  if (!result.barcodeValue) return createCameraAdapterError('decode-failed', 'No barcode was decoded.');

  return {
    value: result.barcodeValue,
    format: 'unknown',
    decodedAt: result.decodedAt,
    source,
    metrics: createDecoderMetrics(startedAt, result.decodedAt, attempts),
  };
}

function createDecoderMetrics(startedAt: number, completedAt: number, attempts: number): BarcodeDecoderMetrics {
  return { startedAt, completedAt, durationMs: Math.max(0, completedAt - startedAt), attempts };
}

function failedDecode(frame: ScanFrameModel, code: CameraAdapterError['code'], message: string): BarcodeDecodeResult {
  return { barcodeValue: null, decodedAt: frame.capturedAt, error: createCameraAdapterError(code, message) };
}

function isDecoderError(result: NormalizedBarcodeResult | CameraAdapterError): result is CameraAdapterError {
  return 'code' in result;
}

function getBarcodeDetector(): BarcodeDetectorLike | null {
  const Detector = (globalThis as unknown as { BarcodeDetector?: new () => BarcodeDetectorLike }).BarcodeDetector;
  return Detector ? new Detector() : null;
}
