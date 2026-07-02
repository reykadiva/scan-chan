import { create } from 'zustand';

export interface ProfileStoreState {
  readonly isInitialized: boolean;
}

export const useProfileStore = create<ProfileStoreState>(() => ({
  isInitialized: false,
}));
