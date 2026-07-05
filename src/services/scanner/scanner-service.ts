import type { ScannerRepository } from '@/repositories';
import { deferred, type FutureOrchestrationPoint, type ServiceResult } from '../service-result';

export interface ScannerService {
  readonly domain: 'scanner';
  prepareScanSession: () => ServiceResult<FutureOrchestrationPoint>;
  prepareScanResultHandling: () => ServiceResult<FutureOrchestrationPoint>;
  prepareProductTranslation: () => ServiceResult;
}

export class DefaultScannerService implements ScannerService {
  readonly domain = 'scanner' as const;

  constructor(readonly repository: ScannerRepository) {}

  prepareScanSession() {
    return deferred('scanning');
  }

  prepareScanResultHandling() {
    return deferred('scanning');
  }

  prepareProductTranslation() {
    return { ok: true };
  }
}
