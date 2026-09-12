import { create } from 'zustand';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/houseMapHitboxes';

type GameStateStatus = 'IDLE' | 'LEVEL_SELECT' | 'PLAYING' | 'PAUSED' | 'FIRE_ACTIVE' | 'BUG_FIXING' | 'FIRE_RESOLVED' | 'FIRE_ESCALATED' | 'HOUSE_BURNED_FAIL' | 'GAME_WON' | 'TIME_UP_FAIL';

interface SessionState {
  currentLevel: 'easy' | 'medium' | 'hard' | null;
  status: GameStateStatus;
  gameSpeed: number;
  timeRemainingSec: number;
  mapRect: { width: number; height: number; scale: number };
  debugHitboxes: boolean;
  
  setCurrentLevel: (level: 'easy' | 'medium' | 'hard' | null) => void;
  setStatus: (status: GameStateStatus) => void;
  setGameSpeed: (speed: number) => void;
  setTimeRemaining: (time: number) => void;
  setMapRect: (rect: { width: number; height: number; scale: number }) => void;
  setDebugHitboxes: (debug: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentLevel: null,
  status: 'IDLE',
  gameSpeed: 1,
  timeRemainingSec: 0,
  mapRect: { width: GAME_WIDTH, height: GAME_HEIGHT, scale: 1 },
  debugHitboxes: new URLSearchParams(window.location.search).has('debug'),
  
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setStatus: (status) => set({ status }),
  setGameSpeed: (gameSpeed) => set({ gameSpeed }),
  setTimeRemaining: (timeRemainingSec) => set({ timeRemainingSec }),
  setMapRect: (mapRect) => set({ mapRect }),
  setDebugHitboxes: (debugHitboxes) => set({ debugHitboxes }),
}));
