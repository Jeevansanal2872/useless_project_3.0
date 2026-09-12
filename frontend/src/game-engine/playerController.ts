import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { keys } from '../hooks/useKeyboardControls';
import { checkCollisions, handleCollisionStun } from './collisionSystem';
import { triggerFire, extinguishFire } from './fireSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/houseMapHitboxes';

const PLAYER_BASE_SPEED = 4.5;
const SPRINT_MULTIPLIER = 1.6;
const SLAP_COOLDOWN_MS = 500;
const SLAP_RANGE = 80;         // in game-space units (1440×1024)
const FIRE_EXTINGUISH_RANGE = 120;

// Interior playable bounds (inside house walls)
const PLAYER_BOUNDS = { minX: 100, maxX: 1340, minY: 100, maxY: 960 };

let lastSlapTime = 0;

export const updatePlayer = (deltaTime: number) => {
  const store = useGameStore.getState();
  if (store.isStunned) return;

  // ── SLAP / INTERACT ───────────────────────────────────────────────────────
  if (keys[' '] && Date.now() - lastSlapTime > SLAP_COOLDOWN_MS) {
    lastSlapTime = Date.now();
    
    const player = store.playerPos;

    // Check if there's a fire and player is close to it — extinguish
    if (store.fireLevel > 0 && store.firePos) {
      const fireDist = Math.hypot(player.x - store.firePos.x, player.y - store.firePos.y);
      if (fireDist < FIRE_EXTINGUISH_RANGE) {
        extinguishFire();
        return;
      }
    }
    
    // Check if rat is in slap range
    const rat = store.ratPos;
    const dist = Math.hypot(player.x - rat.x, player.y - rat.y);
    
    if (dist < SLAP_RANGE) {
      // Hit!
      store.addScore(100);
      
      if (store.score >= 1000) {
        import('./gameLoop').then(({ stopGameLoop }) => stopGameLoop());
        useSessionStore.getState().setStatus('GAME_WON');
      } else {
        // Teleport rat to a new random interior location
        store.setRatPos({
          x: 150 + Math.random() * (GAME_WIDTH - 300),
          y: 150 + Math.random() * (GAME_HEIGHT - 300)
        });
      }
    } else {
      // Miss! Trigger fire if none active
      if (store.fireLevel === 0) {
        triggerFire();
      }
    }
  }

  // ── MOVEMENT ──────────────────────────────────────────────────────────────
  let dx = 0;
  let dy = 0;

  if (keys.w || keys.ArrowUp)    dy -= 1;
  if (keys.s || keys.ArrowDown)  dy += 1;
  if (keys.a || keys.ArrowLeft)  dx -= 1;
  if (keys.d || keys.ArrowRight) dx += 1;

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
  }

  const isSprinting = !!(keys.Shift && (dx !== 0 || dy !== 0));
  const speed = (isSprinting ? PLAYER_BASE_SPEED * SPRINT_MULTIPLIER : PLAYER_BASE_SPEED) * (deltaTime / 16.66);

  if (dx !== 0 || dy !== 0) {
    // Update facing direction (horizontal takes priority for side-view sprite)
    let newDirection = store.playerDirection;
    if (Math.abs(dx) >= Math.abs(dy)) {
      newDirection = dx > 0 ? 'Right' : 'Left';
    } else {
      newDirection = dy > 0 ? 'Down' : 'Up';
    }

    if (store.playerDirection !== newDirection) {
      store.setPlayerDirection(newDirection);
    }

    let newX = store.playerPos.x + dx * speed;
    let newY = store.playerPos.y + dy * speed;
    
    // Clamp to interior house bounds
    newX = Math.max(PLAYER_BOUNDS.minX, Math.min(PLAYER_BOUNDS.maxX, newX));
    newY = Math.max(PLAYER_BOUNDS.minY, Math.min(PLAYER_BOUNDS.maxY, newY));

    // Collision sliding: check X movement independently of Y
    let hitX = false;
    let hitY = false;

    if (checkCollisions(newX, store.playerPos.y)) {
      newX = store.playerPos.x;
      hitX = true;
    }

    if (checkCollisions(newX, newY)) {
      newY = store.playerPos.y;
      hitY = true;
    }
    
    if ((hitX || hitY) && isSprinting) {
      handleCollisionStun();
    } else {
      store.setPlayerPos({ x: newX, y: newY });
    }
  }

  // ── SPRINT STATE UPDATE ───────────────────────────────────────────────────
  if (store.isSprinting !== isSprinting) {
    store.setSprinting(isSprinting);
    
    // Set tired briefly when stopping sprint
    if (!isSprinting && store.isSprinting) {
      store.setTired(true);
      setTimeout(() => {
        useGameStore.getState().setTired(false);
      }, 1000);
    }
  }
};
