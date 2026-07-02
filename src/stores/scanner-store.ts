import { create } from 'zustand';

export interface ScannerStoreState {
  readonly isInitialized: boolean;
}

export const useScannerStore = create<ScannerStoreState>(() => ({
  isInitialized: false,
}));
