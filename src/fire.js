// fire.js
// A miss with the torch starts a fire. Each fire ages independently in
// real time — including while the player is heads-down in a bug-fixing
// task — and if any single fire reaches FIRE_MAX_DURATION, the house is
// lost. Putting a fire out means solving that fire's assigned bug task.

import { FIRE_MAX_DURATION, FIRE_INTERACT_RANGE } from './config.js';
import { distance } from './collision.js';

let nextFireId = 1;

export class Fire {
  constructor(x, y) {
    this.id = nextFireId++;
    this.x = x;
    this.y = y;
    this.elapsed = 0;         // seconds since ignition, keeps ticking always
    this.task = null;         // assigned lazily on first interaction
    this.activeSolveTime = 0; // seconds actually spent solving THIS fire's task
  }

  /** 0..1, how big/dangerous this fire currently looks. */
  get intensity() {
    return Math.min(1, this.elapsed / FIRE_MAX_DURATION);
  }

  get isCritical() {
    return this.elapsed >= FIRE_MAX_DURATION;
  }
}

export class FireManager {
  constructor({ maxSimultaneousFires = Infinity } = {}) {
    this.fires = [];
    this.maxSimultaneousFires = maxSimultaneousFires;
    this.houseBurnedDown = false;
  }

  /** Always called every tick, whether or not a task is being solved. */
  update(dt) {
    for (const fire of this.fires) {
      fire.elapsed += dt;
      if (fire.isCritical) this.houseBurnedDown = true;
    }
  }

  /** Adds a small extra tick to whichever fire is currently being worked on. */
  addSolveTime(fireId, dt) {
    const fire = this.fires.find((f) => f.id === fireId);
    if (fire) fire.activeSolveTime += dt;
  }

  /** Starts a new fire near (x, y) unless the level's cap is already hit. */
  ignite(x, y) {
    if (this.fires.length >= this.maxSimultaneousFires) return null;
    const fire = new Fire(x, y);
    this.fires.push(fire);
    return fire;
  }

  extinguish(fireId) {
    this.fires = this.fires.filter((f) => f.id !== fireId);
  }

  get count() {
    return this.fires.length;
  }

  /** Nearest fire within interact range of a point, or null. */
  findInteractable(point) {
    let best = null;
    let bestDist = FIRE_INTERACT_RANGE;
    for (const fire of this.fires) {
      const d = distance(point, fire);
      if (d <= bestDist) {
        best = fire;
        bestDist = d;
      }
    }
    return best;
  }
}
