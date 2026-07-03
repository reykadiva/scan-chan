import type {
  BarcodeDecodeResult,
  BarcodeDecoderAdapter,
  CameraAdapter,
  CameraAdapterError,
  CameraCapabilityDetection,
  CameraFacingMode,
  CameraSessionModel,
  CameraSessionState,
  ScanFrameModel,
  ScannerAdapterTarget,
  ScannerMobileReadinessConcern,
} from '@/types/scanner';

export type CameraAdapterRegistry = ReadonlyMap<ScannerAdapterTarget, CameraAdapter>;
export type BarcodeDecoderRegistry = ReadonlyMap<ScannerAdapterTarget, BarcodeDecoderAdapter>;

const MOBILE_CONCERNS: readonly ScannerMobileReadinessConcern[] = [
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
];

export function registerCameraAdapter(registry: CameraAdapterRegistry, adapter: CameraAdapter): CameraAdapterRegistry {
  return new Map(registry).set(adapter.target, adapter);
}

export function registerBarcodeDecoder(registry: BarcodeDecoderRegistry, decoder: BarcodeDecoderAdapter): BarcodeDecoderRegistry {
  return new Map(registry).set(decoder.target, decoder);
}

export function createCameraAdapterFactory(registry: CameraAdapterRegistry) {
  return {
    get(target: ScannerAdapterTarget): CameraAdapter {
      const adapter = registry.get(target);
      if (!adapter) throw createCameraAdapterError('adapter-unavailable', `No camera adapter registered for ${target}.`);
      return adapter;
    },
  };
}

export function createBarcodeDecoderFactory(registry: BarcodeDecoderRegistry) {
  return {
    get(target: ScannerAdapterTarget): BarcodeDecoderAdapter {
      const decoder = registry.get(target);
      if (!decoder) throw createCameraAdapterError('decoder-unavailable', `No barcode decoder registered for ${target}.`);
      return decoder;
    },
  };
}

export function createCameraSession(input: {
  id: string;
  adapterTarget: ScannerAdapterTarget;
  now: number;
  facingMode?: CameraFacingMode;
}): CameraSessionModel {
  return {
    id: input.id,
    adapterTarget: input.adapterTarget,
    state: 'idle',
    facingMode: input.facingMode ?? 'environment',
    startedAt: null,
    updatedAt: input.now,
    orientation: 'unknown',
  };
}

export function transitionCameraSession(
  session: CameraSessionModel,
  state: CameraSessionState,
  now: number,
): CameraSessionModel {
  return {
    ...session,
    state,
    startedAt: state === 'ready' || state === 'scanning' ? session.startedAt ?? now : session.startedAt,
    updatedAt: now,
  };
}

export function createCameraAdapterError(
  code: CameraAdapterError['code'],
  message: string,
  recoverable = true,
): CameraAdapterError {
  return { code, message, recoverable };
}

export function createMockCameraAdapter(options: {
  target?: ScannerAdapterTarget;
  barcodeValue?: string | null;
  available?: boolean;
} = {}): { camera: CameraAdapter; decoder: BarcodeDecoderAdapter } {
  const target = options.target ?? 'custom-adapter';
  const capability = createCameraCapability(target, options.available ?? true);
  let session = createCameraSession({ id: 'mock-camera-session', adapterTarget: target, now: 0 });

  const camera: CameraAdapter = {
    target,
    detectCapabilities: async () => capability,
    createSession: (input) => {
      session = createCameraSession({ id: input.id, adapterTarget: target, now: input.now, facingMode: input.facingMode });
      return session;
    },
    lifecycle: {
      warmUp: async (now) => (session = transitionCameraSession(session, 'warming-up', now)),
      start: async (now) => (session = transitionCameraSession(session, 'ready', now)),
      pause: async (now) => (session = transitionCameraSession(session, 'paused', now)),
      resume: async (now) => (session = transitionCameraSession(session, 'ready', now)),
      stop: async (now) => (session = transitionCameraSession(session, 'stopped', now)),
      dispose: async (now) => {
        session = transitionCameraSession(session, 'stopped', now);
      },
    },
    focus: { supportsContinuousAutofocus: true, requestAutofocus: async () => true },
    torch: { supportsTorch: true, setTorch: async () => true },
    zoom: { supportsZoom: true, setZoom: async () => true },
    readFrame: async (now) => createScanFrame({ id: `mock-frame-${now}`, capturedAt: now }),
  };

  const decoder: BarcodeDecoderAdapter = {
    target,
    detectCapabilities: async () => capability,
    decode: async (frame): Promise<BarcodeDecodeResult> => ({
      barcodeValue: options.barcodeValue ?? '1234567890',
      decodedAt: frame.capturedAt,
      error: null,
    }),
  };

  return { camera, decoder };
}

export function createCameraCapability(
  target: ScannerAdapterTarget,
  available: boolean,
): CameraCapabilityDetection {
  return { target, available, concerns: MOBILE_CONCERNS };
}

export function createScanFrame(input: {
  id: string;
  capturedAt: number;
  width?: number;
  height?: number;
  rotationDegrees?: ScanFrameModel['rotationDegrees'];
  data?: Uint8Array | null;
}): ScanFrameModel {
  return {
    id: input.id,
    capturedAt: input.capturedAt,
    width: input.width ?? 1,
    height: input.height ?? 1,
    rotationDegrees: input.rotationDegrees ?? 0,
    data: input.data ?? null,
  };
}
