import { houseMapHitboxes, type Rect } from '../data/houseMapHitboxes';
import { useSessionStore } from '../store/sessionStore';
import { useGameStore } from '../store/gameStore';

// Player collision circle radius — kept small so player isn't trapped
const PLAYER_SIZE = 18;

// How much to shrink each hitbox inward on all sides before checking.
// Positive = hitbox shrinks → more forgiving collision gaps.
const HITBOX_INSET = 10;

// 4-second unconscious stun on any wall hit
const STUN_DURATION_MS = 4000;

// Cooldown between stuns so a single bump doesn't re-stun immediately after waking
const STUN_COOLDOWN_MS = 500;
let lastStunEnd = 0;

/**
 * Check if a point (representing the player center) collides with any wall/furniture hitbox.
 * Each hitbox is inset by HITBOX_INSET px before testing — this makes narrow corridors passable.
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
    h: PLAYER_SIZE,
  };

  for (const box of hitboxes) {
    // Apply inset — shrink the effective box
    const bx = box.x + HITBOX_INSET;
    const by = box.y + HITBOX_INSET;
    const bw = box.w - HITBOX_INSET * 2;
    const bh = box.h - HITBOX_INSET * 2;

    // Skip degenerate boxes
    if (bw <= 0 || bh <= 0) continue;

    if (
      playerRect.x     < bx + bw &&
      playerRect.x + playerRect.w > bx &&
      playerRect.y     < by + bh &&
      playerRect.y + playerRect.h > by
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Is the player currently INSIDE any hitbox? Used to check spawn safety.
 */
export const isInsideHitbox = (x: number, y: number): boolean =>
  checkCollisions(x, y);

/**
 * Distance-based collision between player and rat circles.
 */
export const checkRatCollision = (): boolean => {
  const store = useGameStore.getState();
  const player = store.playerPos;
  const rat = store.ratPos;
  const dist = Math.hypot(player.x - rat.x, player.y - rat.y);
  return dist < PLAYER_SIZE * 2;
};

/**
 * Stun the player (unconscious) for 4 seconds when they walk into a wall.
 * Has a short cooldown after waking up to prevent instant re-stun.
 */
export const handleCollisionStun = () => {
  const store = useGameStore.getState();
  if (store.isStunned) return;                   // already out
  if (Date.now() - lastStunEnd < STUN_COOLDOWN_MS) return; // just woke up

  store.setStunned(true);
  setTimeout(() => {
    useGameStore.getState().setStunned(false);
    lastStunEnd = Date.now();
  }, STUN_DURATION_MS);
};
