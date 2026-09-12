import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { checkCollisions } from './collisionSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/houseMapHitboxes';

// Interior playable bounds (inside house walls, in 1440×1024 coords)
const RAT_BOUNDS = { minX: 90, maxX: 1350, minY: 90, maxY: 970 };
const DETECTION_RADIUS = 250;
const IDLE_WANDER_INTERVAL_MS = 2000;

let idleTimer = 0;
let idleTargetX = 400;
let idleTargetY = 400;

export const updateRat = (deltaTime: number) => {
  const store = useGameStore.getState();
  const level = useSessionStore.getState().currentLevel || 'easy';
  const player = store.playerPos;
  const rat = store.ratPos;
  
  let fleeSpeed = 5.0;
  if (level === 'medium') fleeSpeed = 6.5;
  if (level === 'hard') fleeSpeed = 8.5;

  const dist = Math.sqrt(Math.pow(player.x - rat.x, 2) + Math.pow(player.y - rat.y, 2));
  
  if (dist < DETECTION_RADIUS) {
    // ── EVADING ──────────────────────────────────────────────────────────────
    if (store.ratState !== 'evading') store.setRatState('evading');
    
    // Flee directly away from player
    const dirX = rat.x - player.x;
    const dirY = rat.y - player.y;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    
    const moveX = (dirX / len) * fleeSpeed * (deltaTime / 16.66);
    const moveY = (dirY / len) * fleeSpeed * (deltaTime / 16.66);
    
    let newDirection = store.ratDirection;
    if (Math.abs(moveX) > Math.abs(moveY)) {
      newDirection = moveX > 0 ? 'Right' : 'Left';
    } else {
      newDirection = moveY > 0 ? 'Down' : 'Up';
    }
    
    if (store.ratDirection !== newDirection) {
      store.setRatDirection(newDirection);
    }
    
    let newX = rat.x + moveX;
    let newY = rat.y + moveY;

    // Clamp to interior bounds
    newX = Math.max(RAT_BOUNDS.minX, Math.min(RAT_BOUNDS.maxX, newX));
    newY = Math.max(RAT_BOUNDS.minY, Math.min(RAT_BOUNDS.maxY, newY));

    // Collision sliding (X then Y)
    if (checkCollisions(newX, rat.y)) {
      newX = rat.x;
    }
    if (checkCollisions(newX, newY)) {
      newY = rat.y;
    }

    store.setRatPos({ x: newX, y: newY });
  } else {
    // ── IDLE WANDERING ────────────────────────────────────────────────────────
    if (store.ratState !== 'idle') store.setRatState('idle');
    
    idleTimer += deltaTime;
    if (idleTimer > IDLE_WANDER_INTERVAL_MS) {
      idleTimer = 0;
      // Pick a random interior position to wander to
      idleTargetX = RAT_BOUNDS.minX + Math.random() * (RAT_BOUNDS.maxX - RAT_BOUNDS.minX);
      idleTargetY = RAT_BOUNDS.minY + Math.random() * (RAT_BOUNDS.maxY - RAT_BOUNDS.minY);
    }

    // Slowly wander toward idle target
    const dxIdle = idleTargetX - rat.x;
    const dyIdle = idleTargetY - rat.y;
    const distIdle = Math.sqrt(dxIdle * dxIdle + dyIdle * dyIdle);

    if (distIdle > 5) {
      const idleSpeed = 1.5;
      const normX = dxIdle / distIdle;
      const normY = dyIdle / distIdle;

      let newX = rat.x + normX * idleSpeed * (deltaTime / 16.66);
      let newY = rat.y + normY * idleSpeed * (deltaTime / 16.66);

      newX = Math.max(RAT_BOUNDS.minX, Math.min(RAT_BOUNDS.maxX, newX));
      newY = Math.max(RAT_BOUNDS.minY, Math.min(RAT_BOUNDS.maxY, newY));

      if (checkCollisions(newX, rat.y)) newX = rat.x;
      if (checkCollisions(newX, newY)) newY = rat.y;

      // Update direction during idle wander
      if (Math.abs(normX) > Math.abs(normY)) {
        store.setRatDirection(normX > 0 ? 'Right' : 'Left');
      } else {
        store.setRatDirection(normY > 0 ? 'Down' : 'Up');
      }

      store.setRatPos({ x: newX, y: newY });
    }
  }
};
