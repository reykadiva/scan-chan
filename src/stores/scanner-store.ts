import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ScanFeedFlowResult } from '@/types/scanner';

export interface ScannerStoreState {
  isInitialized: boolean;
  permissionState: 'unknown' | 'prompt' | 'granted' | 'denied';
  scanState: 'idle' | 'requesting-permission' | 'ready' | 'scanning' | 'paused' | 'success' | 'error';
  lastBarcode: string | null;
  errorMessage: string | null;
  lastScanFeedResult: ScanFeedFlowResult | null;
  homeHubRefreshNeeded: boolean;
  initialize: () => void;
  setPermissionState: (permissionState: ScannerStoreState['permissionState']) => void;
  setScanState: (scanState: ScannerStoreState['scanState']) => void;
  setLastBarcode: (lastBarcode: string | null) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  applyScanFeedResult: (result: ScanFeedFlowResult) => void;
  clearHomeHubRefresh: () => void;
  clearLastResult: () => void;
  reset: () => void;
}

export const initialScannerState = {
  isInitialized: false,
  permissionState: 'unknown' as const,
  scanState: 'idle' as const,
  lastBarcode: null as string | null,
  errorMessage: null as string | null,
  lastScanFeedResult: null as ScanFeedFlowResult | null,
  homeHubRefreshNeeded: false,
};

export const useScannerStore = create<ScannerStoreState>()(
  devtools(
    (set) => ({
      ...initialScannerState,
      initialize: () => set({ isInitialized: true }),
      setPermissionState: (permissionState) => set({ permissionState }),
      setScanState: (scanState) => set({ scanState }),
      setLastBarcode: (lastBarcode) => set({ lastBarcode }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      applyScanFeedResult: (result) =>
        set({
          lastScanFeedResult: result,
          lastBarcode: result.barcode,
          scanState: result.success ? 'success' : 'error',
          errorMessage: result.error,
          homeHubRefreshNeeded: result.homeHubShouldRefresh,
        }),
      clearHomeHubRefresh: () => set({ homeHubRefreshNeeded: false }),
      clearLastResult: () => set({ lastScanFeedResult: null }),
      reset: () => set(initialScannerState),
    }),
    { name: 'scan-chan-scanner-store' },
  ),
);

export const selectScannerStatus = (state: ScannerStoreState) => ({
  permissionState: state.permissionState,
  scanState: state.scanState,
  errorMessage: state.errorMessage,
});

export const selectLastScanFeedResult = (state: ScannerStoreState) => state.lastScanFeedResult;
export const selectHomeHubRefreshNeeded = (state: ScannerStoreState) => state.homeHubRefreshNeeded;
