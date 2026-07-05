import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export interface SettingsStoreState {
  isInitialized: boolean;
  hasHydrated: boolean;
  mode: 'guest' | 'arashu';
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  theme: 'light' | 'warm' | 'dark';
  language: string;
  initialize: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setMode: (mode: SettingsStoreState['mode']) => void;
  updateSettings: (settings: Partial<Omit<SettingsStoreState, 'initialize' | 'setHydrated' | 'setMode' | 'updateSettings' | 'reset'>>) => void;
  reset: () => void;
}

export const initialSettingsState = {
  isInitialized: false,
  hasHydrated: false,
  mode: 'guest' as const,
  soundEnabled: true,
  musicEnabled: true,
  reducedMotion: false,
  notificationsEnabled: false,
  hapticFeedback: true,
  theme: 'warm' as const,
  language: 'en',
};

export const useSettingsStore = create<SettingsStoreState>()(
  devtools(
    persist(
      (set) => ({
        ...initialSettingsState,
        initialize: () => set({ isInitialized: true }),
        setHydrated: (hasHydrated) => set({ hasHydrated }),
        setMode: (mode) => set({ mode }),
        updateSettings: (settings) => set(settings),
        reset: () =>
          set((state) => ({
            ...initialSettingsState,
            hasHydrated: state.hasHydrated,
            mode: state.mode,
          })),
      }),
      {
        name: 'scan-chan-settings-state',
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ mode, soundEnabled, musicEnabled, reducedMotion, notificationsEnabled, hapticFeedback, theme, language }) => ({
          mode,
          soundEnabled,
          musicEnabled,
          reducedMotion,
          notificationsEnabled,
          hapticFeedback,
          theme,
          language,
        }),
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              state.setHydrated(true);
              if (!state.isInitialized) {
                state.initialize();
              }
            }
          };
        },
      },
    ),
    { name: 'scan-chan-settings-store' },
  ),
);

export const selectAudioSettings = (state: SettingsStoreState) => ({
  soundEnabled: state.soundEnabled,
  volume: state.volume,
});
