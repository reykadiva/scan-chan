import { describe, expect, it } from 'vitest';
import {
  createBarcodeDecoderFactory,
  createCameraAdapterFactory,
  createMockCameraAdapter,
  createScanSession,
  registerBarcodeDecoder,
  registerCameraAdapter,
  runScannerPipeline,
  SCANNER_ADAPTER_EXTENSION_POINTS,
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
});
