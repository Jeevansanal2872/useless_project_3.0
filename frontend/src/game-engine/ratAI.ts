import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { checkCollisions } from './collisionSystem';

const RAT_BOUNDS = { minX: 90, maxX: 1350, minY: 90, maxY: 970 };
const DETECTION_RADIUS = 280;
const IDLE_WANDER_INTERVAL_MS = 2000;
const RAT_RESPAWN_DELAY_MS = 2000; // time dead before respawning

let idleTimer = 0;
let idleTargetX = 600;
let idleTargetY = 400;
let respawnTimer = 0;

let currentVx = 0;
let currentVy = 0;

/** Pick a new idle wander target that is not inside a hitbox */
const newIdleTarget = () => {
  for (let attempts = 0; attempts < 30; attempts++) {
    const x = RAT_BOUNDS.minX + Math.random() * (RAT_BOUNDS.maxX - RAT_BOUNDS.minX);
    const y = RAT_BOUNDS.minY + Math.random() * (RAT_BOUNDS.maxY - RAT_BOUNDS.minY);
    if (!checkCollisions(x, y)) {
      idleTargetX = x;
      idleTargetY = y;
      return;
    }
  }
};

export const updateRat = (deltaTime: number) => {
  const store = useGameStore.getState();
  const level = useSessionStore.getState().currentLevel || 'easy';

  // ── DEAD — wait then respawn ─────────────────────────────────────────────
  if (store.ratState === 'dead') {
    respawnTimer += deltaTime;
    if (respawnTimer >= RAT_RESPAWN_DELAY_MS) {
      respawnTimer = 0;
      // Respawn far from player
      const player = store.playerPos;
      for (let i = 0; i < 40; i++) {
        const rx = RAT_BOUNDS.minX + Math.random() * (RAT_BOUNDS.maxX - RAT_BOUNDS.minX);
        const ry = RAT_BOUNDS.minY + Math.random() * (RAT_BOUNDS.maxY - RAT_BOUNDS.minY);
        const dist = Math.hypot(rx - player.x, ry - player.y);
        if (!checkCollisions(rx, ry) && dist > 400) {
          store.setRatPos({ x: rx, y: ry });
          store.setRatState('idle');
          newIdleTarget();
          currentVx = 0;
          currentVy = 0;
          break;
        }
      }
    }
    return;
  }

  let fleeSpeed = 5.2;
  if (level === 'medium') fleeSpeed = 6.8;
  if (level === 'hard')   fleeSpeed = 8.5;

  const player = store.playerPos;
  const rat    = store.ratPos;
  const dist   = Math.hypot(player.x - rat.x, player.y - rat.y);

  if (dist < DETECTION_RADIUS) {
    // ── EVADING ──────────────────────────────────────────────────────────────
    if (store.ratState !== 'evading') store.setRatState('evading');

    // Desired velocity directly away from player
    let dx = rat.x - player.x;
    let dy = rat.y - player.y;
    const len = Math.hypot(dx, dy) || 1;
    dx = (dx / len) * fleeSpeed;
    dy = (dy / len) * fleeSpeed;

    // Smooth velocity steering interpolation to eliminate jitter
    const smoothFactor = 0.25;
    currentVx = currentVx + (dx - currentVx) * smoothFactor;
    currentVy = currentVy + (dy - currentVy) * smoothFactor;

    const moveStepX = currentVx * (deltaTime / 16.66);
    const moveStepY = currentVy * (deltaTime / 16.66);

    let nextX = rat.x + moveStepX;
    let nextY = rat.y + moveStepY;

    // Clamp to interior house bounds
    nextX = Math.max(RAT_BOUNDS.minX, Math.min(RAT_BOUNDS.maxX, nextX));
    nextY = Math.max(RAT_BOUNDS.minY, Math.min(RAT_BOUNDS.maxY, nextY));

    // Smooth wall sliding collision resolution
    let finalX = rat.x;
    let finalY = rat.y;

    if (!checkCollisions(nextX, nextY)) {
      finalX = nextX;
      finalY = nextY;
    } else {
      // Test X-only slide
      if (!checkCollisions(nextX, rat.y)) {
        finalX = nextX;
      }
      // Test Y-only slide
      if (!checkCollisions(rat.x, nextY)) {
        finalY = nextY;
      }

      // If both single-axis moves are blocked, try perpendicular slide along wall
      if (finalX === rat.x && finalY === rat.y) {
        const altX1 = rat.x + moveStepY;
        const altY1 = rat.y - moveStepX;
        const altX2 = rat.x - moveStepY;
        const altY2 = rat.y + moveStepX;

        if (!checkCollisions(altX1, altY1)) {
          finalX = Math.max(RAT_BOUNDS.minX, Math.min(RAT_BOUNDS.maxX, altX1));
          finalY = Math.max(RAT_BOUNDS.minY, Math.min(RAT_BOUNDS.maxY, altY1));
        } else if (!checkCollisions(altX2, altY2)) {
          finalX = Math.max(RAT_BOUNDS.minX, Math.min(RAT_BOUNDS.maxX, altX2));
          finalY = Math.max(RAT_BOUNDS.minY, Math.min(RAT_BOUNDS.maxY, altY2));
        }
      }
    }

    // Hysteresis direction update (prevents rapid left/right flipping)
    const effectiveDx = finalX - rat.x;
    const effectiveDy = finalY - rat.y;
    if (Math.hypot(effectiveDx, effectiveDy) > 0.3) {
      if (Math.abs(effectiveDx) > Math.abs(effectiveDy) * 1.2) {
        const newDir = effectiveDx > 0 ? 'Right' : 'Left';
        if (store.ratDirection !== newDir) store.setRatDirection(newDir);
      } else if (Math.abs(effectiveDy) > Math.abs(effectiveDx) * 1.2) {
        const newDir = effectiveDy > 0 ? 'Down' : 'Up';
        if (store.ratDirection !== newDir) store.setRatDirection(newDir);
      }
    }

    store.setRatPos({ x: finalX, y: finalY });
  } else {
    // ── IDLE WANDERING ────────────────────────────────────────────────────────
    if (store.ratState !== 'idle') store.setRatState('idle');

    idleTimer += deltaTime;
    if (idleTimer > IDLE_WANDER_INTERVAL_MS) {
      idleTimer = 0;
      newIdleTarget();
    }

    const dxIdle = idleTargetX - rat.x;
    const dyIdle = idleTargetY - rat.y;
    const distIdle = Math.hypot(dxIdle, dyIdle);

    if (distIdle > 5) {
      const idleSpeed = 1.6;
      const normX = dxIdle / distIdle;
      const normY = dyIdle / distIdle;

      let newX = Math.max(RAT_BOUNDS.minX, Math.min(RAT_BOUNDS.maxX,
        rat.x + normX * idleSpeed * (deltaTime / 16.66)));
      let newY = Math.max(RAT_BOUNDS.minY, Math.min(RAT_BOUNDS.maxY,
        rat.y + normY * idleSpeed * (deltaTime / 16.66)));

      if (checkCollisions(newX, rat.y)) {
        newX = rat.x;
        newIdleTarget();
      }
      if (checkCollisions(newX, newY)) {
        newY = rat.y;
        newIdleTarget();
      }

      if (Math.abs(normX) > Math.abs(normY)) {
        const newDir = normX > 0 ? 'Right' : 'Left';
        if (store.ratDirection !== newDir) store.setRatDirection(newDir);
      } else {
        const newDir = normY > 0 ? 'Down' : 'Up';
        if (store.ratDirection !== newDir) store.setRatDirection(newDir);
      }

      store.setRatPos({ x: newX, y: newY });
    } else {
      newIdleTarget();
    }
  }
};
