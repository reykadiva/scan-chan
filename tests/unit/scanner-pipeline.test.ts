import { describe, expect, it } from 'vitest';
import {
  applyBarcodeScanGuard,
  createBarcodeDecoderFactory,
  createBarcodeDetectorDecoder,
  createMockBarcodeDecoder,
  createMockBrowserCameraAdapter,
  createCameraAdapterFactory,
  createCameraSessionCoordinator,
  createMockCameraAdapter,
  createScanSession,
  createScanFrame,
  createZXingDecoder,
  decodeBarcodeWithFallback,
  executeScannerGameplay,
  lookupScannedProduct,
  registerBarcodeDecoder,
  registerCameraAdapter,
  runScannerPipeline,
  SCANNER_ADAPTER_EXTENSION_POINTS,
  selectBarcodeDecoder,
  transitionScannerState,
} from '@/lib/scanner';
import { normalizePetState } from '@/lib/pet';
import { DefaultScannerService } from '@/services/scanner';
import { createMockRepositories } from '@tests/mocks';

const pet = normalizePetState({ stats: { hunger: 40, mood: 40, energy: 40, affection: 25, curiosity: 40 } });
const session = createScanSession('scan-1', 1_000);
const request = { barcodeValue: '123', requestedAt: 2_000, source: 'test' as const };

describe('scanner pipeline', () => {
  it('manages scanner session state deterministically', () => {
    expect(session).toMatchObject({ id: 'scan-1', state: 'ready', startedAt: 1_000 });
    expect(transitionScannerState('ready', 'start')).toBe('processing');
    expect(transitionScannerState('processing', 'complete')).toBe('completed');
    expect(transitionScannerState('processing', 'fail')).toBe('failed');
    expect(transitionScannerState('failed', 'reset')).toBe('idle');
  });

  it('orchestrates barcode to product translation to feeding to pet update', () => {
    const result = runScannerPipeline({
      session,
      request,
      product: { barcodeNumber: '123', productName: 'Berry Snack', category: 'Snack' },
      pet,
    });

    expect(result.error).toBeNull();
    expect(result.session).toMatchObject({ state: 'completed', lastStage: 'pet-update' });
    expect(result.stages).toEqual([
      'scan-request',
      'barcode-value',
      'product-lookup',
      'product-translation',
      'feeding-engine',
      'pet-update',
    ]);
    expect(result.food).toMatchObject({ id: '123', category: 'snack' });
    expect(result.pet.stats.hunger).toBe(60);
  });

  it('fails empty barcodes before product or feeding work', () => {
    const result = runScannerPipeline({ session, request: { ...request, barcodeValue: ' ' }, product: null, pet });

    expect(result.error).toMatchObject({ code: 'empty-barcode', stage: 'barcode-value' });
    expect(result.pet).toBe(pet);
  });

  it('fails unsupported products before feeding engine mutation', () => {
    const result = runScannerPipeline({
      session,
      request,
      product: { barcodeNumber: '123', productName: 'Soap', category: 'Personal Care' },
      pet,
    });

    expect(result.error).toMatchObject({ code: 'product-unsupported', stage: 'product-translation' });
    expect(result.food).toMatchObject({ category: 'unknown' });
    expect(result.pet).toBe(pet);
  });

  it('keeps scanner service as a thin pipeline boundary', () => {
    const service = new DefaultScannerService(createMockRepositories().scanner);
    const result = service.runPipeline({
      session,
      request,
      product: { barcodeNumber: '123', productName: 'Milk', category: 'Dairy' },
      pet,
    });

    expect(result.data?.food).toMatchObject({ category: 'fresh' });
  });

  it('keeps future mobile camera concerns in adapter extension points', () => {
    expect(SCANNER_ADAPTER_EXTENSION_POINTS.find((point) => point.target === 'camera-adapter')?.ownedConcerns).toEqual(
      expect.arrayContaining([
        'iphone-11-blurry-preview',
        'fast-autofocus',
        'low-scan-latency',
        'stable-camera-lifecycle',
        'safari-camera-compatibility',
        'android-camerax-compatibility',
      ]),
    );
  });

  it('registers mock camera and decoder adapters without browser APIs', async () => {
    const { camera, decoder } = createMockCameraAdapter({ target: 'barcode-detector-api', barcodeValue: '987' });
    const cameraFactory = createCameraAdapterFactory(registerCameraAdapter(new Map(), camera));
    const decoderFactory = createBarcodeDecoderFactory(registerBarcodeDecoder(new Map(), decoder));
    const adapter = cameraFactory.get('barcode-detector-api');
    const session = adapter.createSession({ id: 'camera-1', now: 1_000 });
    const ready = await adapter.lifecycle.start(1_100);
    const frame = await adapter.readFrame(1_200);
    const decoded = await decoderFactory.get('barcode-detector-api').decode(frame);

    expect(session).toMatchObject({ state: 'idle', facingMode: 'environment' });
    expect(ready).toMatchObject({ state: 'ready', startedAt: 1_100 });
    expect(frame).toMatchObject({ id: 'mock-frame-1200', rotationDegrees: 0 });
    expect(decoded).toMatchObject({ barcodeValue: '987', decodedAt: 1_200, error: null });
    await expect(adapter.detectCapabilities()).resolves.toMatchObject({
      available: true,
      concerns: expect.arrayContaining(['iphone-11-blurry-preview', 'camera-warm-up', 'memory-safe-disposal']),
    });
  });

  it('coordinates camera lifecycle without platform details', async () => {
    const { camera } = createMockCameraAdapter({ target: 'native-android-camerax' });
    const session = camera.createSession({ id: 'camera-life-1', now: 1_000 });
    const lifecycle = createCameraSessionCoordinator({ adapter: camera, session, permission: 'granted' });

    const warmed = await lifecycle.warmUp(1_100);
    const started = await lifecycle.start(1_200);
    const backgrounded = await lifecycle.enterBackground(1_300);
    const oriented = lifecycle.changeOrientation('landscape', 1_400);
    const recovered = await lifecycle.recover(1_500);
    const stopped = await lifecycle.shutdown(1_600);

    expect(warmed.camera.session).toMatchObject({ state: 'warming-up' });
    expect(started.camera.session).toMatchObject({ state: 'ready', startedAt: 1_200 });
    expect(backgrounded.camera.session).toMatchObject({ state: 'paused' });
    expect(oriented.camera.session).toMatchObject({ orientation: 'landscape' });
    expect(recovered.events.map((event) => event.type)).toContain('recover');
    expect(stopped).toMatchObject({ disposed: true });
    expect(stopped.events.map((event) => event.type)).toEqual([
      'warm-up',
      'start',
      'background',
      'orientation-change',
      'recover',
      'dispose',
    ]);
  });

  it('creates, switches, and cleans up browser camera streams', async () => {
    const stopped: string[] = [];
    const firstStream = { getTracks: () => [{ stop: () => stopped.push('first') }] } as unknown as MediaStream;
    const secondStream = { getTracks: () => [{ stop: () => stopped.push('second') }] } as unknown as MediaStream;
    const adapter = createMockBrowserCameraAdapter({
      devices: [
        { deviceId: 'front', label: 'Front Camera', facingMode: 'user' },
        { deviceId: 'rear', label: 'Rear Camera', facingMode: 'environment' },
      ],
      stream: [firstStream],
    });
    const switchingAdapter = createMockBrowserCameraAdapter({
      devices: [{ deviceId: 'rear', label: 'Rear Camera', facingMode: 'environment' }],
      stream: [firstStream, secondStream],
    });

    expect(await adapter.enumerateDevices()).toEqual([
      { deviceId: 'front', label: 'Front Camera', facingMode: 'user' },
      { deviceId: 'rear', label: 'Rear Camera', facingMode: 'environment' },
    ]);

    expect(await switchingAdapter.createStream({ facingMode: 'environment', now: 1_000 })).toBe(firstStream);
    expect(switchingAdapter.getStream()).toBe(firstStream);
    expect(await switchingAdapter.switchCamera({ deviceId: 'rear', now: 1_100 })).toBe(secondStream);
    switchingAdapter.shutdownStream();

    expect(stopped).toEqual(['first', 'second']);
  });

  it('selects BarcodeDetector first and falls back to ZXing with normalized metrics', async () => {
    const frame = createScanFrame({ id: 'decode-frame-1', capturedAt: 1_250 });
    const barcodeDetector = createMockBarcodeDecoder({
      target: 'barcode-detector-api',
      error: { code: 'decode-failed', message: 'No barcode.', recoverable: true },
    });
    const zxing = createZXingDecoder(async () => ' 998877 ');
    const selected = selectBarcodeDecoder({ barcodeDetector, zxing });
    const result = await decodeBarcodeWithFallback({ frame, selected, now: 1_200 });

    expect(result).toMatchObject({
      value: '998877',
      source: 'zxing',
      metrics: { startedAt: 1_200, completedAt: 1_250, durationMs: 50, attempts: 2 },
    });
  });

  it('normalizes BarcodeDetector results when supported', async () => {
    const decoder = createBarcodeDetectorDecoder({
      detect: async () => [{ rawValue: '12345', format: 'ean_13' }],
    });
    const selected = selectBarcodeDecoder({ barcodeDetector: decoder, zxing: createMockBarcodeDecoder({ target: 'zxing' }) });
    const result = await decodeBarcodeWithFallback({
      frame: createScanFrame({ id: 'detector-frame-1', capturedAt: 2_000 }),
      selected,
      now: 1_990,
    });

    expect(result).toMatchObject({ value: '12345', source: 'barcode-detector-api' });
  });

  it('filters duplicate and cooldown scan results', () => {
    const result = {
      value: '12345',
      format: 'unknown',
      decodedAt: 2_000,
      source: 'zxing' as const,
      metrics: { startedAt: 1_990, completedAt: 2_000, durationMs: 10, attempts: 1 },
    };

    expect(applyBarcodeScanGuard(result, { lastValue: '12345', lastScannedAt: 1_000, cooldownMs: 250 })).toMatchObject({
      code: 'duplicate-barcode',
    });
    expect(applyBarcodeScanGuard(result, { lastValue: '98765', lastScannedAt: 1_900, cooldownMs: 250 })).toMatchObject({
      code: 'scan-cooldown',
    });
    expect(applyBarcodeScanGuard(result, { lastValue: '98765', lastScannedAt: 1_000, cooldownMs: 250 })).toBe(result);
  });

  it('looks up scanned products, translates food, and caches without feeding', async () => {
    const first = await lookupScannedProduct({
      barcode: '123',
      now: 3_000,
      lookup: async () => ({ barcodeNumber: '123', productName: 'Berry Snack', category: 'Snack' }),
    });
    const second = await lookupScannedProduct({
      barcode: '123',
      now: 4_000,
      cache: first.cache,
      lookup: async () => {
        throw new Error('should use cache');
      },
    });

    expect(first.result).toMatchObject({ status: 'found', translationStatus: 'translated', attempts: 1, fromCache: false });
    expect(first.result.food).toMatchObject({ id: '123', category: 'snack' });
    expect(second.result).toMatchObject({ status: 'found', attempts: 0, fromCache: true });
  });

  it('handles unknown, unsupported, retry, and offline lookup states', async () => {
    const unknown = await lookupScannedProduct({ barcode: '404', now: 1, lookup: async () => null });
    const unsupported = await lookupScannedProduct({
      barcode: '777',
      now: 1,
      lookup: async () => ({ barcodeNumber: '777', productName: 'Soap', category: 'Personal Care' }),
    });
    let attempts = 0;
    const retried = await lookupScannedProduct({
      barcode: '500',
      now: 1,
      retries: 1,
      lookup: async () => {
        attempts += 1;
        throw new Error('network');
      },
    });
    const offline = await lookupScannedProduct({ barcode: '123', now: 1, offline: true, lookup: async () => null });

    expect(unknown.result).toMatchObject({ status: 'unknown', food: { category: 'unknown' } });
    expect(unsupported.result).toMatchObject({ status: 'unsupported', translationStatus: 'unsupported' });
    expect(retried.result).toMatchObject({ status: 'failed', attempts: 2, error: 'network' });
    expect(attempts).toBe(2);
    expect(offline.result).toMatchObject({ status: 'offline', attempts: 0 });
  });

  it('executes scanner gameplay through feeding and xp without rewards', async () => {
    const lookup = await lookupScannedProduct({
      barcode: '123',
      now: 4_000,
      lookup: async () => ({ barcodeNumber: '123', productName: 'Berry Snack', category: 'Snack' }),
    });
    const result = executeScannerGameplay({ lookup: lookup.result, pet, currentXp: 20, now: 4_000 });

    expect(result).toMatchObject({
      barcode: '123',
      status: 'success',
      xpGain: 10,
      nextXp: 30,
      memoryCreated: true,
      homeHubShouldRefresh: true,
      error: null,
    });
    expect(result.pet.stats.hunger).toBeGreaterThan(pet.stats.hunger);
  });

  it('keeps gameplay failure from mutating pet or xp', async () => {
    const lookup = await lookupScannedProduct({
      barcode: '777',
      now: 4_000,
      lookup: async () => ({ barcodeNumber: '777', productName: 'Soap', category: 'Personal Care' }),
    });
    const result = executeScannerGameplay({ lookup: lookup.result, pet, currentXp: 20, now: 4_000 });

    expect(result).toMatchObject({ status: 'failed', xpGain: 0, nextXp: 20, homeHubShouldRefresh: false });
    expect(result.pet).toBe(pet);
  });
});
