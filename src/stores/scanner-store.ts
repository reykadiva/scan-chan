import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ScannerStoreState {
  isInitialized: boolean;
  permissionState: 'unknown' | 'prompt' | 'granted' | 'denied';
  scanState: 'idle' | 'requesting-permission' | 'ready' | 'scanning' | 'paused' | 'success' | 'error';
  lastBarcode: string | null;
  errorMessage: string | null;
  initialize: () => void;
  setPermissionState: (permissionState: ScannerStoreState['permissionState']) => void;
  setScanState: (scanState: ScannerStoreState['scanState']) => void;
  setLastBarcode: (lastBarcode: string | null) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  reset: () => void;
}

export const initialScannerState = {
  isInitialized: false,
  permissionState: 'unknown' as const,
  scanState: 'idle' as const,
  lastBarcode: null as string | null,
  errorMessage: null as string | null,
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
