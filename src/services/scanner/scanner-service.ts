import type { ScannerRepository } from '@/repositories';
import { translateProductToFood } from '@/lib/product';
import { lookupScannedProduct, runScannerPipeline, type ProductLookupFn } from '@/lib/scanner';
import type { ProductTranslationInput } from '@/types/product';
import type { PetStateModel } from '@/types/pet';
import type { ScanRequestModel, ScanSessionModel } from '@/types/scanner';
import { deferred, type FutureOrchestrationPoint, type ServiceResult } from '../service-result';

export interface ScannerService {
  readonly domain: 'scanner';
  translateProductToFood: (product: ProductTranslationInput | null) => ServiceResult<ReturnType<typeof translateProductToFood>>;
  lookupProduct: (input: { barcode: string; lookup: ProductLookupFn; now: number; retries?: number; offline?: boolean }) => Promise<ServiceResult<Awaited<ReturnType<typeof lookupScannedProduct>>>>;
  runPipeline: (input: { session: ScanSessionModel; request: ScanRequestModel; product: ProductTranslationInput | null; pet: PetStateModel }) => ServiceResult<ReturnType<typeof runScannerPipeline>>;
  prepareScanSession: () => ServiceResult<FutureOrchestrationPoint>;
  prepareScanResultHandling: () => ServiceResult<FutureOrchestrationPoint>;
  prepareProductTranslation: () => ServiceResult;
}

export class DefaultScannerService implements ScannerService {
  readonly domain = 'scanner' as const;

  constructor(readonly repository: ScannerRepository) {}

  translateProductToFood(product: ProductTranslationInput | null) {
    return { ok: true, data: translateProductToFood(product) };
  }

  async lookupProduct(input: { barcode: string; lookup: ProductLookupFn; now: number; retries?: number; offline?: boolean }) {
    return { ok: true, data: await lookupScannedProduct(input) };
  }

  runPipeline(input: { session: ScanSessionModel; request: ScanRequestModel; product: ProductTranslationInput | null; pet: PetStateModel }) {
    return { ok: true, data: runScannerPipeline(input) };
  }

  /** Future Sprint 2 extension point: coordinate scan sessions without camera or decoder logic here. */
  prepareScanSession() {
    return deferred('scanning');
  }

  /** Future Sprint 2 extension point: hand scan results toward services, not directly to repositories. */
  prepareScanResultHandling() {
    return deferred('scanning');
  }

  /** Sprint 2.4 hook: product metadata becomes FoodModel outside scanner/camera code. */
  prepareProductTranslation() {
    return { ok: true };
  }
}
