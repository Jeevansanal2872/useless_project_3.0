// score.js
import { POINTS_PER_FIRE_EXTINGUISHED, POINTS_PER_RAT_KILL } from './config.js';

export class ScoreManager {
  constructor() {
    this.points = 0;
    this.firesExtinguished = 0;
    this.ratKilled = false;
  }

  addFireExtinguished() {
    this.points += POINTS_PER_FIRE_EXTINGUISHED;
    this.firesExtinguished += 1;
  }

  addRatKill() {
    this.points += POINTS_PER_RAT_KILL;
    this.ratKilled = true;
  }
}
