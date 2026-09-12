import { houseMapHitboxes, type Rect } from '../data/houseMapHitboxes';
import { useSessionStore } from '../store/sessionStore';
import { useGameStore } from '../store/gameStore';

// Player hitbox is a square centered on playerPos
const PLAYER_SIZE = 56;
const STUN_DURATION_MS = 30;

/**
 * Check if a point (representing the player center) collides with any wall/furniture hitbox.
 * Coordinates are in game-space (1440×1024).
 */
export const checkCollisions = (newX: number, newY: number): boolean => {
  const level = useSessionStore.getState().currentLevel;
  if (!level) return false;

  const hitboxes = houseMapHitboxes[level];
  const half = PLAYER_SIZE / 2;
  const playerRect: Rect = {
    x: newX - half,
    y: newY - half,
    w: PLAYER_SIZE,
    h: PLAYER_SIZE
  };

  for (const box of hitboxes) {
    if (
      playerRect.x < box.x + box.w &&
      playerRect.x + playerRect.w > box.x &&
      playerRect.y < box.y + box.h &&
      playerRect.y + playerRect.h > box.y
    ) {
      return true; // Collision!
    }
  }

  return false;
};

/**
 * Distance-based collision between player and rat circles.
 */
export const checkRatCollision = (): boolean => {
  const store = useGameStore.getState();
  const player = store.playerPos;
  const rat = store.ratPos;
  const dist = Math.hypot(player.x - rat.x, player.y - rat.y);
  return dist < PLAYER_SIZE * 1.5;
};

/**
 * If the player is sprinting and hits a wall, stun them briefly.
 */
export const handleCollisionStun = () => {
  const store = useGameStore.getState();
  if (store.isStunned) return;

  if (store.isSprinting) {
    store.setStunned(true);
    setTimeout(() => {
      useGameStore.getState().setStunned(false);
    }, STUN_DURATION_MS);
  }
};
