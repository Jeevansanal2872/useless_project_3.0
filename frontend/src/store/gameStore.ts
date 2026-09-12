import { create } from 'zustand';

interface Vector2 {
  x: number;
  y: number;
}

interface GameState {
  playerPos: Vector2;
  playerDirection: 'Up' | 'Down' | 'Left' | 'Right';
  isSprinting: boolean;
  isStunned: boolean;
  isTired: boolean;
  
  ratPos: Vector2;
  ratDirection: 'Up' | 'Down' | 'Left' | 'Right';
  ratState: 'idle' | 'evading';
  
  score: number;
  fireLevel: number; // 0 to 7
  
  setPlayerPos: (pos: Vector2) => void;
  setPlayerDirection: (dir: 'Up' | 'Down' | 'Left' | 'Right') => void;
  setSprinting: (sprinting: boolean) => void;
  setStunned: (stunned: boolean) => void;
  setTired: (tired: boolean) => void;
  
  setRatPos: (pos: Vector2) => void;
  setRatDirection: (dir: 'Up' | 'Down' | 'Left' | 'Right') => void;
  setRatState: (state: 'idle' | 'evading') => void;
  
  addScore: (points: number) => void;
  setFireLevel: (level: number) => void;
  setFirePos: (pos: Vector2 | null) => void;
  resetGame: () => void;
}

const initialState = {
  playerPos: { x: 400, y: 500 }, // Inside house in 1440×1024 space
  playerDirection: 'Down' as const,
  isSprinting: false,
  isStunned: false,
  isTired: false,
  
  ratPos: { x: 900, y: 700 }, // Rat starts in a different room
  ratDirection: 'Down' as const,
  ratState: 'idle' as const,
  
  score: 0,
  fireLevel: 0,
  firePos: null as Vector2 | null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  
  setPlayerPos: (pos) => set({ playerPos: pos }),
  setPlayerDirection: (dir) => set({ playerDirection: dir }),
  setSprinting: (isSprinting) => set({ isSprinting }),
  setStunned: (isStunned) => set({ isStunned }),
  setTired: (isTired) => set({ isTired }),
  
  setRatPos: (pos) => set({ ratPos: pos }),
  setRatDirection: (dir) => set({ ratDirection: dir }),
  setRatState: (state) => set({ ratState: state }),
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setFireLevel: (level) => set({ fireLevel: Math.max(0, Math.min(7, level)) }),
  setFirePos: (pos: Vector2 | null) => set({ firePos: pos }),
  
  resetGame: () => set(initialState),
}));
