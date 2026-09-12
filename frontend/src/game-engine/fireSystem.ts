/**
 * fireSystem.ts
 *
 * Fire mechanic:
 * - Individual fire "tiles" spawn on the map when the player MISSES the rat
 * - Each tile grows over time (spreads to neighbours)
 * - The fireLevel (0-7) represents the TOTAL spread progress across the house
 *   and is displayed on the in-map fire icon as a progress indicator
 * - If fireLevel reaches MAX → game fails (house burns down)
 * - Player must walk near a fire tile and press SPACE to extinguish it
 * - BugFixModal success also extinguishes fires
 */

import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/houseMapHitboxes';

// ── Types ──────────────────────────────────────────────────────────────────
export interface FireTile {
  id: number;
  x: number;
  y: number;
  intensity: number; // 1–3, drives visual size
}

let nextFireId = 1;

// Internal list of active fire tiles (drives FireOverlay rendering)
let fireTiles: FireTile[] = [];
let spreadInterval: ReturnType<typeof setInterval> | null = null;

const FIRE_MAX_LEVEL = 7;
// How long (ms) before fire spreads another step / level escalates
const SPREAD_INTERVAL_MS = 8000; // 8s per level (56s to max on easy)

// ── Helpers ────────────────────────────────────────────────────────────────

/** Recalculate and sync the global fireLevel from tile count */
const syncFireLevel = () => {
  const store = useGameStore.getState();
  // Map tile count to 0-7 level band
  const level = Math.min(FIRE_MAX_LEVEL, Math.ceil(fireTiles.length / 2));
  store.setFireLevel(level);

  if (level >= FIRE_MAX_LEVEL) {
    stopFireSpread();
    useSessionStore.getState().setStatus('HOUSE_BURNED_FAIL');
  }
};

/** Add a new fire tile at a position (must be inside the house) */
const addFireTile = (x: number, y: number, intensity = 1) => {
  fireTiles = [...fireTiles, { id: nextFireId++, x, y, intensity }];
  syncFireLevel();
};

/** Spread fire: grow existing tiles and occasionally spawn new neighbours */
const spreadFire = () => {
  if (fireTiles.length === 0) return;

  const updated: FireTile[] = fireTiles.map((tile) => ({
    ...tile,
    intensity: Math.min(3, tile.intensity + 1),
  }));

  // Spawn a new tile near a random existing tile
  const source = updated[Math.floor(Math.random() * updated.length)];
  const angle  = Math.random() * Math.PI * 2;
  const dist   = 80 + Math.random() * 80;
  const nx     = Math.max(150, Math.min(GAME_WIDTH - 150, source.x + Math.cos(angle) * dist));
  const ny     = Math.max(150, Math.min(GAME_HEIGHT - 150, source.y + Math.sin(angle) * dist));

  fireTiles = [...updated, { id: nextFireId++, x: nx, y: ny, intensity: 1 }];
  syncFireLevel();
};

const stopFireSpread = () => {
  if (spreadInterval) {
    clearInterval(spreadInterval);
    spreadInterval = null;
  }
};

const startFireSpread = () => {
  if (spreadInterval) return;
  const level = useSessionStore.getState().currentLevel ?? 'easy';
  const interval = level === 'hard' ? SPREAD_INTERVAL_MS / 2
    : level === 'medium' ? SPREAD_INTERVAL_MS * 0.7
    : SPREAD_INTERVAL_MS;

  spreadInterval = setInterval(spreadFire, interval);
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Spawn a small fire at a random interior position.
 * Called when the player MISSES the rat with a swipe.
 * Multiple misses = multiple tiles = fire spreads faster.
 */
export const triggerFire = (px?: number, py?: number) => {
  let x: number;
  let y: number;
  if (px !== undefined && py !== undefined) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    x = Math.max(150, Math.min(GAME_WIDTH - 150, px + Math.cos(angle) * dist));
    y = Math.max(150, Math.min(GAME_HEIGHT - 150, py + Math.sin(angle) * dist));
  } else {
    x = 150 + Math.random() * (GAME_WIDTH - 300);
    y = 150 + Math.random() * (GAME_HEIGHT - 300);
  }
  addFireTile(x, y, 1);
  startFireSpread();

  const store = useGameStore.getState();
  if (!store.firePos) {
    store.setFirePos({ x, y });
  }
};

/**
 * Try to extinguish the fire tile closest to (px, py).
 * Returns true if a tile was close enough to be removed.
 */
export const extinguishNearestFire = (px: number, py: number, range: number): boolean => {
  const idx = fireTiles.findIndex(
    (t) => Math.hypot(t.x - px, t.y - py) < range
  );
  if (idx === -1) return false;

  fireTiles = fireTiles.filter((_, i) => i !== idx);
  syncFireLevel();

  if (fireTiles.length === 0) {
    stopFireSpread();
    useGameStore.getState().setFirePos(null);
  } else {
    // Update store firePos to the new nearest tile
    const nearest = fireTiles[0];
    useGameStore.getState().setFirePos({ x: nearest.x, y: nearest.y });
  }
  return true;
};

/**
 * Extinguish ALL fires (used when BugFixModal succeeds).
 */
export const extinguishFire = () => {
  fireTiles = [];
  stopFireSpread();
  const store = useGameStore.getState();
  store.setFireLevel(0);
  store.setFirePos(null);
};

/**
 * Get the current fire tiles for rendering (read-only snapshot).
 */
export const getFireTiles = (): readonly FireTile[] => fireTiles;

// Legacy compat shim (used in some older imports)
export const startFireEscalation = startFireSpread;
export const stopFireEscalation  = stopFireSpread;
