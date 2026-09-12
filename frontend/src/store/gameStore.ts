import { create } from 'zustand';

interface Vector2 {
  x: number;
  y: number;
}

// Safe spawn positions per level — chosen to be in clear open areas
export const LEVEL_SPAWN = {
  easy:   { player: { x: 580, y: 300 }, rat: { x: 1100, y: 750 } },
  medium: { player: { x: 720, y: 560 }, rat: { x: 400,  y: 200 } },
  hard:   { player: { x: 500, y: 200 }, rat: { x: 1150, y: 800 } },
};

interface GameState {
  playerPos: Vector2;
  playerDirection: 'Up' | 'Down' | 'Left' | 'Right';
  isSprinting: boolean;
  isStunned: boolean;
  isTired: boolean;

  ratPos: Vector2;
  ratDirection: 'Up' | 'Down' | 'Left' | 'Right';
  ratState: 'idle' | 'evading' | 'dead';

  score: number;
  fireLevel: number; // 0 to 7
  firePos: Vector2 | null;
  slapTrigger: number; // Increment to trigger GSAP hit animation

  setPlayerPos: (pos: Vector2) => void;
  setPlayerDirection: (dir: 'Up' | 'Down' | 'Left' | 'Right') => void;
  setSprinting: (sprinting: boolean) => void;
  setStunned: (stunned: boolean) => void;
  setTired: (tired: boolean) => void;

  setRatPos: (pos: Vector2) => void;
  setRatDirection: (dir: 'Up' | 'Down' | 'Left' | 'Right') => void;
  setRatState: (state: 'idle' | 'evading' | 'dead') => void;

  addScore: (points: number) => void;
  setFireLevel: (level: number) => void;
  setFirePos: (pos: Vector2 | null) => void;
  triggerSlap: () => void;
  resetGame: () => void;
}

const initialState = {
  playerPos: { x: 580, y: 300 },   // default (easy) spawn
  playerDirection: 'Down' as const,
  isSprinting: false,
  isStunned: false,
  isTired: false,

  ratPos: { x: 1100, y: 750 },     // default (easy) rat spawn
  ratDirection: 'Down' as const,
  ratState: 'idle' as const,

  score: 0,
  fireLevel: 0,
  firePos: null as Vector2 | null,
  slapTrigger: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setPlayerPos:     (pos)          => set({ playerPos: pos }),
  setPlayerDirection:(dir)         => set({ playerDirection: dir }),
  setSprinting:     (isSprinting)  => set({ isSprinting }),
  setStunned:       (isStunned)    => set({ isStunned }),
  setTired:         (isTired)      => set({ isTired }),

  setRatPos:        (pos)          => set({ ratPos: pos }),
  setRatDirection:  (dir)          => set({ ratDirection: dir }),
  setRatState:      (state)        => set({ ratState: state }),

  addScore:  (points) => set((s) => ({ score: s.score + points })),
  setFireLevel: (level) => set({ fireLevel: Math.max(0, Math.min(7, level)) }),
  setFirePos:   (pos: Vector2 | null) => set({ firePos: pos }),
  triggerSlap:  () => set((s) => ({ slapTrigger: s.slapTrigger + 1 })),

  resetGame: () => set(initialState),
}));
