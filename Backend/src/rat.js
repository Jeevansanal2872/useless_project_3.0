// rat.js
// The rat never gets stunned and never really collides with the world the
// way the player does — it "evades obstacles more freely". We model that
// by letting it probe a handful of candidate headings each frame and pick
// whichever gets it closest to its desired direction without hitting a
// wall, rather than doing hard axis-aligned collision like the player.

import { Entity } from './entity.js';
import { collidesWithAny, distance } from './collision.js';
import {
  RAT_BASE_SPEED,
  RAT_STEER_JITTER,
  RAT_DETECTION_RADIUS,
  RAT_IDLE_MIN,
  RAT_IDLE_MAX,
  RAT_IDLE_TRIGGER_RADIUS,
} from './config.js';

const CANDIDATE_OFFSETS_DEG = [0, -20, 20, -45, 45, -70, 70, -100, 100, 135, -135, 180];

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export class Rat extends Entity {
  /**
   * @param {object} opts
   * @param {number} opts.speedMultiplier level-specific speed tuning
   * @param {number} opts.detectionMultiplier level-specific "notices you" tuning
   */
  constructor({ x, y, speedMultiplier = 1, detectionMultiplier = 1 }) {
    super({ x, y, width: 16, height: 16 });
    this.speedMultiplier = speedMultiplier;
    this.detectionRadius = RAT_DETECTION_RADIUS * detectionMultiplier;
    this.state = 'WANDER'; // 'WANDER' | 'FLEE' | 'IDLE'
    this.idleTimer = 0;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderChangeTimer = randRange(0.6, 1.8);
    this.alive = true;
  }

  get speed() {
    return RAT_BASE_SPEED * this.speedMultiplier;
  }

  kill() {
    this.alive = false;
  }

  /**
   * @param {number} dt
   * @param {{x:number,y:number}} playerPos world-space player center
   * @param {Array} walls
   */
  update(dt, playerPos, walls) {
    if (!this.alive) return;

    const myPos = this.position();
    const distToPlayer = distance(myPos, playerPos);

    this._updateState(dt, distToPlayer);

    if (this.state === 'IDLE') {
      return; // sits still, doesn't even face a particular way
    }

    let desiredAngle;
    if (this.state === 'FLEE') {
      // Directly away from the player.
      desiredAngle = Math.atan2(myPos.y - playerPos.y, myPos.x - playerPos.x);
    } else {
      // WANDER: occasionally pick a new lazy heading.
      this.wanderChangeTimer -= dt;
      if (this.wanderChangeTimer <= 0) {
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderChangeTimer = randRange(1.2, 3);
      }
      desiredAngle = this.wanderAngle;
    }

    // Sensitive steering: snap (almost) straight to the desired heading
    // rather than slowly arcing toward it, which reads as skittish/twitchy.
    this.facingAngle = stepTowardsAngle(
      this.facingAngle,
      desiredAngle,
      RAT_STEER_JITTER * (this.state === 'FLEE' ? 2 : 1) * dt
    );

    const speed = this.speed * (this.state === 'FLEE' ? 1 : 0.45);
    this._moveEvadingObstacles(dt, speed, walls);
  }

  _updateState(dt, distToPlayer) {
    if (this.state === 'IDLE') {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0 || distToPlayer < this.detectionRadius) {
        this.state = distToPlayer < this.detectionRadius ? 'FLEE' : 'WANDER';
      }
      return;
    }

    if (distToPlayer < this.detectionRadius) {
      this.state = 'FLEE';
      return;
    }

    if (this.state === 'FLEE') {
      // Player fell out of range — settle back into wandering.
      this.state = 'WANDER';
    }

    if (this.state === 'WANDER' && distToPlayer > RAT_IDLE_TRIGGER_RADIUS) {
      // "The rat is not always in motion" — randomly freeze when far away.
      if (Math.random() < 0.004) {
        this.state = 'IDLE';
        this.idleTimer = randRange(RAT_IDLE_MIN, RAT_IDLE_MAX);
      }
    }
  }

  /** Tries the desired heading first, then fans out to nearby headings. */
  _moveEvadingObstacles(dt, speed, walls) {
    for (const offsetDeg of CANDIDATE_OFFSETS_DEG) {
      const angle = this.facingAngle + (offsetDeg * Math.PI) / 180;
      const dx = Math.cos(angle) * speed * dt;
      const dy = Math.sin(angle) * speed * dt;
      const tryRect = { x: this.x + dx, y: this.y + dy, width: this.width, height: this.height };
      if (!collidesWithAny(tryRect, walls)) {
        this.x = tryRect.x;
        this.y = tryRect.y;
        if (offsetDeg !== 0) {
          // Adopt the heading that actually worked so it doesn't fight the wall.
          this.facingAngle = angle;
        }
        return;
      }
    }
    // Totally boxed in for this frame (rare) — just sit tight.
  }
}

function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function stepTowardsAngle(current, target, maxDelta) {
  const diff = normalizeAngle(target - current);
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}
