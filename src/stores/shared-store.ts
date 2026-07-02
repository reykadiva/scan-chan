import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LoadState } from '@/types/shared';

export interface SharedStoreState {
  isInitialized: boolean;
  appLoadState: LoadState;
  routeLoadState: LoadState;
  errorMessage: string | null;
  isOffline: boolean;
  initialize: () => void;
  setAppLoadState: (appLoadState: LoadState) => void;
  setRouteLoadState: (routeLoadState: LoadState) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setOffline: (isOffline: boolean) => void;
  reset: () => void;
}

export const initialSharedState = {
  isInitialized: false,
  appLoadState: 'idle' as LoadState,
  routeLoadState: 'idle' as LoadState,
  errorMessage: null as string | null,
  isOffline: false,
};

export const useSharedStore = create<SharedStoreState>()(
  devtools(
    (set) => ({
      ...initialSharedState,
      initialize: () => set({ isInitialized: true }),
      setAppLoadState: (appLoadState) => set({ appLoadState }),
      setRouteLoadState: (routeLoadState) => set({ routeLoadState }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      setOffline: (isOffline) => set({ isOffline }),
      reset: () => set(initialSharedState),
    }),
    { name: 'scan-chan-shared-store' },
  ),
);

export const selectSharedStatus = (state: SharedStoreState) => ({
  appLoadState: state.appLoadState,
  routeLoadState: state.routeLoadState,
  errorMessage: state.errorMessage,
  isOffline: state.isOffline,
});
