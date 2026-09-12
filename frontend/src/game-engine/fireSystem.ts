import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/houseMapHitboxes';

let fireTimer: ReturnType<typeof setTimeout> | null = null;
const FIRE_MAX_LEVEL = 7;

// A simple escalation calculation based on difficulty.
// Default to 300s / 7 = 42.8s per level for Easy.
export const startFireEscalation = () => {
  if (fireTimer) return;

  const level = useSessionStore.getState().currentLevel || 'easy';
  let totalDurationSec = 300;
  if (level === 'medium') totalDurationSec = 210;
  if (level === 'hard') totalDurationSec = 120;

  const intervalMs = (totalDurationSec * 1000) / FIRE_MAX_LEVEL;

    fireTimer = setInterval(() => {
      const store = useGameStore.getState();
      const currentFire = store.fireLevel;
      
      if (currentFire < FIRE_MAX_LEVEL) {
        store.setFireLevel(currentFire + 1);
      } else {
        // Reached max level -> House burns down!
        stopFireEscalation();
        useSessionStore.getState().setStatus('HOUSE_BURNED_FAIL');
      }
    }, intervalMs);
  };
  
  export const stopFireEscalation = () => {
    if (fireTimer) {
      clearInterval(fireTimer);
      fireTimer = null;
    }
  };

export const triggerFire = () => {
  const store = useGameStore.getState();
  if (store.fireLevel === 0) {
    // Spawn fire in a random interior location within the house (1440×1024 space)
    store.setFirePos({
      x: 120 + Math.random() * (GAME_WIDTH - 240),
      y: 120 + Math.random() * (GAME_HEIGHT - 240)
    });
    store.setFireLevel(1);
    startFireEscalation();
  }
};

export const extinguishFire = () => {
  stopFireEscalation();
  const store = useGameStore.getState();
  store.setFireLevel(0);
  store.setFirePos(null);
};
