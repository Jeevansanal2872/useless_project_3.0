import { create } from 'zustand';
import type { UserProfile, UserProgress } from '../api/types';

interface UserState {
  profile: UserProfile | null;
  progress: UserProgress | null;
  
  setProfile: (profile: UserProfile | null) => void;
  setProgress: (progress: UserProgress | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  progress: null,
  
  setProfile: (profile) => set({ profile }),
  setProgress: (progress) => set({ progress }),
}));
