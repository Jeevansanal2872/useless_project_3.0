// player.js
// The house owner. Controlled by input, can slap with a torch, gets
// knocked out for a few seconds after a head-on collision.

import { Entity } from './entity.js';
import { moveWithSliding } from './collision.js';
import {
  PLAYER_BASE_SPEED,
  STUN_DURATION,
  ATTACK_RANGE,
  ATTACK_ARC_DEGREES,
  ATTACK_COOLDOWN,
} from './config.js';

export class Player extends Entity {
  constructor({ x, y }) {
    super({ x, y, width: 22, height: 22 });
    this.state = 'ACTIVE'; // 'ACTIVE' | 'STUNNED'
    this.stunTimer = 0;
    this.attackCooldownTimer = 0;
    this.speedMultiplier = 1; // set by the active powerup, defaults to none
    this._attackCooldownScale = 1; // set by "Steady Hands" powerup
    this._stunScale = 1; // set by "Thick Boots" powerup
    this.lastCollision = null; // {x,y} for FX hooks, cleared each frame it doesn't happen
  }

  get isStunned() {
    return this.state === 'STUNNED';
  }

  get effectiveSpeed() {
    return PLAYER_BASE_SPEED * this.speedMultiplier;
  }

  /**
   * @param {number} dt seconds
   * @param {{x:number,y:number}} moveVector normalized-ish input direction, each in [-1,1]
   * @param {Array} walls
   */
  update(dt, moveVector, walls) {
    this.lastCollision = null;
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);

    if (this.isStunned) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.state = 'ACTIVE';
      }
      return; // frozen — no movement while stunned
    }

    const len = Math.hypot(moveVector.x, moveVector.y);
    if (len < 1e-4) return; // no input, nothing to do

    const nx = moveVector.x / len;
    const ny = moveVector.y / len;
    this.facingAngle = Math.atan2(ny, nx);

    const dx = nx * this.effectiveSpeed * dt;
    const dy = ny * this.effectiveSpeed * dt;

    const result = moveWithSliding(this.rect(), dx, dy, walls);
    this.x = result.x;
    this.y = result.y;

    if (result.directHit) {
      this.state = 'STUNNED';
      this.stunTimer = STUN_DURATION * this._stunScale;
      this.lastCollision = { x: this.centerX, y: this.centerY };
    }
  }

  /** True once cooldown has elapsed and the player isn't stunned. */
  canAttack() {
    return !this.isStunned && this.attackCooldownTimer <= 0;
  }

  /**
   * Swings the torch. Returns a hit descriptor for the game engine to test
   * against the rat; does not know about the rat itself (kept decoupled).
   */
  swingTorch() {
    this.attackCooldownTimer = ATTACK_COOLDOWN * this._attackCooldownScale;
    return {
      originX: this.centerX,
      originY: this.centerY,
      facingAngle: this.facingAngle,
      range: ATTACK_RANGE,
      arcDegrees: ATTACK_ARC_DEGREES,
    };
  }

  applyPowerupSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
  }
}
