import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ModalId, SheetId } from '@/types/ui';

export type AppTab = 'home' | 'scan' | 'collection' | 'missions' | 'settings';

export interface ToastMessage {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'error';
}

export interface UIStoreState {
  isInitialized: boolean;
  activeModal: ModalId | null;
  activeSheet: SheetId | null;
  toastQueue: ToastMessage[];
  isLoading: boolean;
  isScanning: boolean;
  showEvolutionSequence: boolean;
  activeTab: AppTab;
  initialize: () => void;
  openModal: (activeModal: ModalId) => void;
  closeModal: () => void;
  openSheet: (activeSheet: SheetId) => void;
  closeSheet: () => void;
  enqueueToast: (toast: ToastMessage) => void;
  dismissToast: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setScanning: (isScanning: boolean) => void;
  setEvolutionSequenceVisible: (showEvolutionSequence: boolean) => void;
  setActiveTab: (activeTab: AppTab) => void;
  reset: () => void;
}

export const initialUIState = {
  isInitialized: true,
  activeModal: null as ModalId | null,
  activeSheet: null as SheetId | null,
  toastQueue: [] as ToastMessage[],
  isLoading: false,
  isScanning: false,
  showEvolutionSequence: false,
  activeTab: 'home' as AppTab,
};

export const useUIStore = create<UIStoreState>()(
  devtools(
    (set) => ({
      ...initialUIState,
      initialize: () => set({ isInitialized: true }),
      openModal: (activeModal) => set({ activeModal }),
      closeModal: () => set({ activeModal: null }),
      openSheet: (activeSheet) => set({ activeSheet }),
      closeSheet: () => set({ activeSheet: null }),
      enqueueToast: (toast) => set((state) => ({ toastQueue: [...state.toastQueue, toast] })),
      dismissToast: (id) => set((state) => ({ toastQueue: state.toastQueue.filter((toast) => toast.id !== id) })),
      setLoading: (isLoading) => set({ isLoading }),
      setScanning: (isScanning) => set({ isScanning }),
      setEvolutionSequenceVisible: (showEvolutionSequence) => set({ showEvolutionSequence }),
      setActiveTab: (activeTab) => set({ activeTab }),
      reset: () => set(initialUIState),
    }),
    { name: 'scan-chan-ui-store' },
  ),
);

export const selectActiveOverlay = (state: UIStoreState) => ({
  activeModal: state.activeModal,
  activeSheet: state.activeSheet,
});
