// powerups.js
// A powerup is earned every time a fire is successfully put out, and it
// stays active until the *next* fire is put out (not on a timer). On
// medium/hard, how long the player took to solve the bug task limits
// which tier of powerup they can get; easy always gives the full pool.

import {
  POWERUP_FAST_SOLVE_SECONDS,
  POWERUP_SLOW_SOLVE_SECONDS,
} from './config.js';

export const POWERUP_POOL = [
  {
    id: 'speed_boost',
    label: 'Speed Boost',
    tier: 'strong',
    apply(player) {
      player.applyPowerupSpeedMultiplier(1.35);
    },
    remove(player) {
      player.applyPowerupSpeedMultiplier(1);
    },
  },
  {
    id: 'quick_step',
    label: 'Quick Step',
    tier: 'medium',
    apply(player) {
      player.applyPowerupSpeedMultiplier(1.18);
    },
    remove(player) {
      player.applyPowerupSpeedMultiplier(1);
    },
  },
  {
    id: 'steady_hands',
    label: 'Steady Hands (faster torch cooldown)',
    tier: 'medium',
    apply(player) {
      player._attackCooldownScale = 0.6;
    },
    remove(player) {
      player._attackCooldownScale = 1;
    },
  },
  {
    id: 'thick_boots',
    label: 'Thick Boots (shorter stun)',
    tier: 'weak',
    apply(player) {
      player._stunScale = 0.4;
    },
    remove(player) {
      player._stunScale = 1;
    },
  },
];

function poolForTier(tier) {
  if (tier === 'strong') return POWERUP_POOL;
  if (tier === 'medium') return POWERUP_POOL.filter((p) => p.tier !== 'strong');
  return POWERUP_POOL.filter((p) => p.tier === 'weak');
}

/** Decides which quality tier a solve time earns for a given difficulty. */
function tierForSolveTime(difficulty, solveSeconds) {
  if (difficulty === 'easy') return 'strong';
  const fastCutoff = POWERUP_FAST_SOLVE_SECONDS[difficulty];
  const slowCutoff = POWERUP_SLOW_SOLVE_SECONDS[difficulty];
  if (solveSeconds <= fastCutoff) return 'strong';
  if (solveSeconds <= slowCutoff) return 'medium';
  return 'weak';
}

export class PowerupManager {
  constructor() {
    this.current = null; // powerup def currently applied, or null
  }

  /**
   * @param {import('./player.js').Player} player
   * @param {'easy'|'medium'|'hard'} difficulty
   * @param {number} solveSeconds time actually spent solving the task
   */
  grantRandomPowerup(player, difficulty, solveSeconds) {
    if (this.current) this.current.remove(player);

    const tier = tierForSolveTime(difficulty, solveSeconds);
    const pool = poolForTier(tier);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    chosen.apply(player);
    this.current = chosen;
    return chosen;
  }

  clear(player) {
    if (this.current) this.current.remove(player);
    this.current = null;
  }
}
