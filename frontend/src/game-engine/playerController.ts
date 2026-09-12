import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { keys } from '../hooks/useKeyboardControls';
import { checkCollisions, handleCollisionStun } from './collisionSystem';
import { triggerFire, getFireTiles } from './fireSystem';

const PLAYER_BASE_SPEED = 4.5;
const SPRINT_MULTIPLIER = 1.6;
const SLAP_COOLDOWN_MS = 500;
const SLAP_RANGE = 80;         // in game-space units (1440×1024)
const FIRE_INTERACT_RANGE = 160;

// Interior playable bounds (inside house walls)
const PLAYER_BOUNDS = { minX: 100, maxX: 1340, minY: 100, maxY: 960 };

let lastSlapTime = 0;

export const updatePlayer = (deltaTime: number) => {
  const store = useGameStore.getState();
  if (store.isStunned) return; // unconscious — no movement

  // ── SLAP / INTERACT / EXTINGUISH ─────────────────────────────────────────
  if (keys[' '] && Date.now() - lastSlapTime > SLAP_COOLDOWN_MS) {
    lastSlapTime = Date.now();
    store.triggerSlap(); // Trigger GSAP torch swing hit animation
    
    const player = store.playerPos;

    // First priority: If fire is active and player is near fire tile, open BugTask window to extinguish fire!
    if (store.fireLevel > 0) {
      const tiles = getFireTiles();
      const nearFire = tiles.some(t => Math.hypot(t.x - player.x, t.y - player.y) < FIRE_INTERACT_RANGE);
      if (nearFire || tiles.length > 0) {
        // Open BugTask window to extinguish fire
        useSessionStore.getState().setStatus('BUG_FIXING');
        return;
      }
    }
    
    // Check if rat is alive and in slap range
    const rat = store.ratPos;
    const dist = Math.hypot(player.x - rat.x, player.y - rat.y);
    
    if (store.ratState !== 'dead' && dist < SLAP_RANGE) {
      // ── HIT! Rat dies ──────────────────────────────────────────────────
      store.addScore(100);
      store.setRatState('dead');
      
      if (store.score + 100 >= 1000) {
        import('./gameLoop').then(({ stopGameLoop }) => stopGameLoop());
        useSessionStore.getState().setStatus('GAME_WON');
      }
    } else {
      // Miss! Torch swipe creates a small fire on the tile where player missed
      triggerFire(player.x, player.y);
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
    
    if (hitX || hitY) {
      // Bounce player BACK 22px so they're clear of the wall when they wake up
      const BOUNCE = 22;
      const bounceX = store.playerPos.x - dx * BOUNCE;
      const bounceY = store.playerPos.y - dy * BOUNCE;
      const safeX = Math.max(PLAYER_BOUNDS.minX, Math.min(PLAYER_BOUNDS.maxX, bounceX));
      const safeY = Math.max(PLAYER_BOUNDS.minY, Math.min(PLAYER_BOUNDS.maxY, bounceY));
      // Only apply bounce if that position is clear
      if (!checkCollisions(safeX, safeY)) {
        store.setPlayerPos({ x: safeX, y: safeY });
      }
      // Stun (unconscious for 4 sec)
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
