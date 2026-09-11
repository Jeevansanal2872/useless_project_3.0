// config.js
// Central place for every tunable number in the game.
// Nothing in here talks to the DOM or Canvas — pure data.

export const TILE_SIZE = 32;

// --- Movement ---
export const PLAYER_BASE_SPEED = 170;   // px/s — "a little more speed than the rat"
export const RAT_BASE_SPEED = 150;      // px/s
export const PLAYER_ACCEL = 1400;       // px/s^2, how snappy the player feels
export const RAT_STEER_JITTER = 2.6;    // rad/s max turn rate for the rat (sensitive steering)
export const PLAYER_STEER_JITTER = 1.4; // rad/s max turn rate for the player

// --- Collisions / stun ---
export const STUN_DURATION = 3; // seconds frozen after a head-on collision

// --- Attack (the torch slap) ---
export const ATTACK_RANGE = 46;          // px reach of the torch
export const ATTACK_ARC_DEGREES = 100;   // cone width in front of the player
export const ATTACK_COOLDOWN = 0.45;     // seconds between swings

// --- Fire ---
export const FIRE_MAX_DURATION = 300;    // 5 minutes: fire this old burns the house down
export const FIRE_INTERACT_RANGE = 40;   // how close the player must be to fight a fire

// --- Rat AI ---
export const RAT_DETECTION_RADIUS = 190; // player closer than this triggers fleeing
export const RAT_IDLE_MIN = 1.5;         // seconds
export const RAT_IDLE_MAX = 4.5;         // seconds
export const RAT_IDLE_TRIGGER_RADIUS = 260; // must be at least this far from player to go idle

// --- Powerups ---
// Below this solve time (seconds) a task counts as "fast" -> best powerup tier.
export const POWERUP_FAST_SOLVE_SECONDS = { easy: Infinity, medium: 30, hard: 20 };
// Above this solve time (seconds) a task counts as "slow" -> weakest/no powerup tier.
export const POWERUP_SLOW_SOLVE_SECONDS = { easy: Infinity, medium: 70, hard: 45 };

// --- Scoring ---
export const POINTS_PER_FIRE_EXTINGUISHED = 1;
export const POINTS_PER_RAT_KILL = 3;

export const LEVEL_IDS = ['easy', 'medium', 'hard'];

export const LEVEL_META = {
  easy: {
    label: 'Easy — The Cottage',
    difficulty: 'easy',
    ratSpeedMultiplier: 0.90,
    ratDetectionMultiplier: 1.15, // rat notices the player a bit sooner (easier to herd)
    maxSimultaneousFires: 2,
  },
  medium: {
    label: 'Medium — The Townhouse',
    difficulty: 'medium',
    ratSpeedMultiplier: 1.0,
    ratDetectionMultiplier: 1.0,
    maxSimultaneousFires: 3,
  },
  hard: {
    label: 'Hard — The Manor',
    difficulty: 'hard',
    ratSpeedMultiplier: 1.08,
    ratDetectionMultiplier: 0.9, // rat notices later -> more surprise close calls
    maxSimultaneousFires: 4,
  },
};
