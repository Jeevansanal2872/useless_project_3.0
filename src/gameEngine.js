// gameEngine.js
// The only module that knows how all the pieces fit together. The
// rendering/UI layer talks exclusively to this class: feed it dt + input
// each frame, read back a plain snapshot object to draw.

import { getMap } from './map.js';
import { Player } from './player.js';
import { Rat } from './rat.js';
import { FireManager } from './fire.js';
import { PowerupManager } from './powerups.js';
import { ScoreManager } from './score.js';
import { pickRandomTask } from './bugTasks.js';
import { runTestCases, warmUpPyodide } from './pyRunner.js';
import { distance } from './collision.js';
import { LEVEL_META } from './config.js';

export const GameState = Object.freeze({
  PLAYING: 'PLAYING',
  TASK_ACTIVE: 'TASK_ACTIVE',
  WON: 'WON',
  LOST: 'LOST',
});

export class GameEngine {
  constructor(levelId) {
    if (!LEVEL_META[levelId]) throw new Error(`Unknown level: ${levelId}`);
    this.levelId = levelId;
    this.levelMeta = LEVEL_META[levelId];

    const map = getMap(levelId);
    this.map = map;

    this.player = new Player({ x: map.playerSpawn.x, y: map.playerSpawn.y });
    
    // Spawn 3 rats initially with a slight spread
    this.rats = [];
    for (let i = 0; i < 3; i++) {
      this.rats.push(this._spawnRatSafe());
    }
    this.ratRespawnTimers = [];

    this.fireManager = new FireManager({ maxSimultaneousFires: this.levelMeta.maxSimultaneousFires });
    this.powerupManager = new PowerupManager();
    this.scoreManager = new ScoreManager();

    this.state = GameState.PLAYING;
    this.activeFireId = null;
    this.lastTaskFeedback = null;
    this.pendingValidation = false;

    warmUpPyodide();
  }

  _spawnRatSafe() {
    const ratWidth = 16;
    const ratHeight = 16;
    let attempts = 0;

    while (attempts < 50) {
      // Keep within map boundaries, subtracting the rat's size so it doesn't hang off the edge
      const x = Math.random() * (this.map.width - ratWidth);
      const y = Math.random() * (this.map.height - ratHeight);
      
      // Standard AABB (Axis-Aligned Bounding Box) collision check against all walls
      let hitWall = false;
      for (const wall of this.map.walls) {
        if (
          x < wall.x + wall.width &&
          x + ratWidth > wall.x &&
          y < wall.y + wall.height &&
          y + ratHeight > wall.y
        ) {
          hitWall = true;
          break;
        }
      }
      
      // If we found a spot with no walls, create the rat here
      if (!hitWall) {
        return this._createRat(x, y);
      }
      attempts++;
    }
    
    // Fallback to the designer's guaranteed safe spawn if we get incredibly unlucky
    return this._createRat(this.map.ratSpawn.x, this.map.ratSpawn.y);
  }

  _createRat(x, y) {
    return new Rat({
      x,
      y,
      speedMultiplier: this.levelMeta.ratSpeedMultiplier,
      detectionMultiplier: this.levelMeta.ratDetectionMultiplier,
    });
  }

  get isFrozenForMovement() {
    return this.state === GameState.TASK_ACTIVE;
  }

  get isGameOver() {
    return this.state === GameState.WON || this.state === GameState.LOST;
  }

  /**
   * Advances the simulation by dt seconds.
   * @param {number} dt
   * @param {{x:number,y:number}} moveVector
   */
  update(dt, moveVector) {
    if (this.isGameOver) return;

    this.fireManager.update(dt);
    if (this.activeFireId != null) {
      this.fireManager.addSolveTime(this.activeFireId, dt);
    }

    if (this.fireManager.houseBurnedDown) {
      this.state = GameState.LOST;
      return;
    }

    if (this.state === GameState.TASK_ACTIVE) {
      return;
    }

    // Process respawn timers
    for (let i = this.ratRespawnTimers.length - 1; i >= 0; i--) {
      this.ratRespawnTimers[i] -= dt;
      if (this.ratRespawnTimers[i] <= 0) {
        this.rats.push(this._spawnRatSafe());
        this.ratRespawnTimers.splice(i, 1);
      }
    }

    this.player.update(dt, moveVector, this.map.walls);
    for (const rat of this.rats) {
      rat.update(dt, this.player.position(), this.map.walls);
    }
  }

  /** Torch swing. Returns true if it connected with the rat. */
  attemptAttack() {
    if (this.state !== GameState.PLAYING || !this.player.canAttack()) {
      return false;
    }

    const swing = this.player.swingTorch();
    const halfArc = (swing.arcDegrees / 2) * (Math.PI / 180);
    let hitAny = false;

    for (let i = this.rats.length - 1; i >= 0; i--) {
      const rat = this.rats[i];
      if (!rat.alive) continue;

      const ratPos = rat.position();
      const d = distance({ x: swing.originX, y: swing.originY }, ratPos);
      const angleToRat = Math.atan2(ratPos.y - swing.originY, ratPos.x - swing.originX);
      let diff = angleToRat - swing.facingAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      if (d <= swing.range && Math.abs(diff) <= halfArc) {
        rat.kill();
        this.rats.splice(i, 1); // Remove from active list
        this.scoreManager.addRatKill();
        this.ratRespawnTimers.push(3.0); // 3-second respawn delay
        hitAny = true;
      }
    }

    if (!hitAny) {
      this.fireManager.ignite(swing.originX, swing.originY);
    }
    return hitAny;
  }

  /** Opens (or re-opens) the bug task for whichever fire is in reach. */
  attemptInteract() {
    if (this.state !== GameState.PLAYING) return false;
    const fire = this.fireManager.findInteractable(this.player.position());
    if (!fire) return false;

    if (!fire.task) {
      fire.task = pickRandomTask(this.levelMeta.difficulty);
      fire.workingCode = fire.task.buggyCode;
    }

    this.activeFireId = fire.id;
    this.lastTaskFeedback = null;
    this.state = GameState.TASK_ACTIVE;
    return true;
  }

  /** Leaves the task open (unsolved) and lets the player move/chase again. */
  pauseTask() {
    if (this.state !== GameState.TASK_ACTIVE) return;
    this.state = GameState.PLAYING;
    this.activeFireId = null;
  }

  /** Currently open fire + its task, or null if no task is active. */
  getActiveTask() {
    if (this.activeFireId == null) return null;
    const fire = this.fireManager.fires.find((f) => f.id === this.activeFireId);
    return fire ? { fire, task: fire.task } : null;
  }

  /**
   * Runs the player's code against the active task's test cases.
   * @param {string} code
   */
  async submitTaskSolution(code) {
    // If the house burned down while the modal was open, reject immediately.
    if (this.fireManager.houseBurnedDown || this.state === GameState.LOST) {
      this.state = GameState.LOST;
      return { ok: false, error: 'The house burned down while you were coding!' };
    }

    const active = this.getActiveTask();
    if (!active) return { ok: false, error: 'No task is currently active.' };

    this.pendingValidation = true;
    const { task, fire } = active;
    fire.workingCode = code;

    const outcome = await runTestCases(code, task.functionName, task.testCases);
    this.pendingValidation = false;
    this.lastTaskFeedback = outcome;

    // Reject if house burned down while awaiting runTestCases
    if (this.fireManager.houseBurnedDown) {
      this.state = GameState.LOST;
      return { ok: false, error: 'The house burned down while tests were running!' };
    }

    if (outcome.ok) {
      const solveSeconds = fire.activeSolveTime;
      this.fireManager.extinguish(fire.id);
      this.scoreManager.addFireExtinguished();
      this.powerupManager.grantRandomPowerup(this.player, this.levelMeta.difficulty, solveSeconds);
      this.activeFireId = null;
      this.state = GameState.PLAYING;
    }

    return outcome;
  }


  /** Flat, UI-friendly snapshot of everything worth drawing/displaying. */
  /** Flat, UI-friendly snapshot of everything worth drawing/displaying. */
  getSnapshot() {
    return {
      state: this.state,
      levelId: this.levelId,
      map: this.map,
      player: {
        x: this.player.x,
        y: this.player.y,
        width: this.player.width,
        height: this.player.height,
        facingAngle: this.player.facingAngle,
        isStunned: this.player.isStunned,
        stunTimer: this.player.stunTimer,
      },
      // FIX: Map over the array of active rats instead of checking this.rat
      rats: this.rats.map((r) => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        facingAngle: r.facingAngle,
        alive: r.alive,
        state: r.state,
      })),
      fires: this.fireManager.fires.map((f) => ({
        id: f.id,
        x: f.x,
        y: f.y,
        elapsed: f.elapsed,
        intensity: f.intensity,
        hasTask: !!f.task,
      })),
      score: {
        points: this.scoreManager.points,
        firesExtinguished: this.scoreManager.firesExtinguished,
        ratKilled: this.scoreManager.ratKilled,
      },
      currentPowerup: this.powerupManager.current ? this.powerupManager.current.label : null,
      activeFireId: this.activeFireId,
      lastTaskFeedback: this.lastTaskFeedback,
      pendingValidation: this.pendingValidation,
    };
  }
}
