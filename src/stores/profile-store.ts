import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ProfileStoreState {
  isInitialized: boolean;
  mode: 'guest' | 'arashu';
  userId: string | null;
  nickname: string | null;
  avatar: string | null;
  joinedAt: string | null;
  initialize: () => void;
  setMode: (mode: ProfileStoreState['mode']) => void;
  setProfile: (profile: Partial<Pick<ProfileStoreState, 'userId' | 'nickname' | 'avatar' | 'joinedAt'>>) => void;
  reset: () => void;
}

export const initialProfileState = {
  isInitialized: true,
  mode: 'guest' as const,
  userId: null as string | null,
  nickname: null as string | null,
  avatar: null as string | null,
  joinedAt: null as string | null,
};

export const useProfileStore = create<ProfileStoreState>()(
  devtools(
    (set) => ({
      ...initialProfileState,
      initialize: () => set({ isInitialized: true }),
      setMode: (mode) => set({ mode }),
      setProfile: (profile) => set(profile),
      reset: () => set(initialProfileState),
    }),
    { name: 'scan-chan-profile-store' },
  ),
);

export const selectProfileIdentity = (state: ProfileStoreState) => ({
  mode: state.mode,
  nickname: state.nickname,
  avatar: state.avatar,
});
