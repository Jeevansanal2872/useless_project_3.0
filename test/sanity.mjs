// test/sanity.mjs
// Quick non-browser smoke tests for the pure-logic modules. Run with:
//   node test/sanity.mjs
// Note: Pyodide needs network + a browser-like environment, so the bug
// task validation here exercises the offline fallback path only. Real
// Python grading is exercised by actually opening index.html.

import assert from 'node:assert/strict';
import { getMap } from '../src/map.js';
import { GameEngine, GameState } from '../src/gameEngine.js';
import { LEVEL_IDS } from '../src/config.js';
import { BUG_TASKS } from '../src/bugTasks.js';
import { rectsIntersect, moveWithSliding } from '../src/collision.js';

let passed = 0;
function check(label, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  - ${label}`);
  } catch (err) {
    console.error(`FAIL - ${label}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('Map integrity');
for (const levelId of LEVEL_IDS) {
  check(`${levelId} map parses and has a player + rat spawn`, () => {
    const map = getMap(levelId);
    assert.ok(map.walls.length > 0, 'expected some walls');
    assert.ok(map.width > 0 && map.height > 0);
    assert.notDeepEqual(map.playerSpawn, map.ratSpawn, 'spawns should differ');
  });
}

console.log('\nCollision helpers');
check('rectsIntersect basic overlap', () => {
  assert.equal(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 }), true);
  assert.equal(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 }), false);
});

check('moveWithSliding detects a direct hit with no give on either axis', () => {
  // A wall big enough that neither the diagonal move nor either single
  // axis offers any way through — a genuine dead-on hit.
  const walls = [{ x: 5, y: 5, width: 20, height: 20 }];
  const body = { x: 0, y: 0, width: 10, height: 10 };
  const result = moveWithSliding(body, 10, 10, walls);
  assert.equal(result.directHit, true);
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
});

check('moveWithSliding does not call a diagonal corner-graze a direct hit', () => {
  // Wall sits diagonally adjacent; a pure x-only or y-only step has room,
  // so this should slide rather than stun.
  const walls = [{ x: 10, y: 10, width: 10, height: 10 }];
  const body = { x: 0, y: 0, width: 10, height: 10 };
  const result = moveWithSliding(body, 10, 10, walls);
  assert.equal(result.directHit, false);
});

check('moveWithSliding allows sliding along a wall', () => {
  const walls = [{ x: 10, y: -100, width: 10, height: 1000 }]; // a long vertical wall to the right
  const body = { x: 0, y: 0, width: 10, height: 10 };
  // Try to move right into the wall AND down — x should block, y should not.
  const result = moveWithSliding(body, 10, 5, walls);
  assert.equal(result.xBlocked, true);
  assert.equal(result.yBlocked, false);
  assert.equal(result.directHit, false);
});

console.log('\nBug task bank');
for (const [difficulty, tasks] of Object.entries(BUG_TASKS)) {
  check(`${difficulty} tasks all have functionName present in buggyCode`, () => {
    for (const t of tasks) {
      assert.ok(t.buggyCode.includes(`def ${t.functionName}`), `${t.id} buggyCode missing def`);
      assert.ok(t.testCases.length >= 2, `${t.id} needs at least 2 test cases`);
    }
  });
}

console.log('\nGameEngine flow (offline fallback validation)');
await (async () => {
  const engine = new GameEngine('easy');
  assert.equal(engine.state, GameState.PLAYING);

  // Simulate a few frames of chasing without input — nothing should throw.
  for (let i = 0; i < 30; i++) {
    engine.update(1 / 60, { x: 0, y: 0 });
  }
  check('engine ticks without throwing', () => assert.ok(true));

  // Force a miss by attacking at a moment the rat is (almost certainly) out
  // of torch range at spawn — this should ignite a fire.
  const beforeFires = engine.fireManager.count;
  engine.attemptAttack();
  check('a whiffed swing ignites a fire', () => {
    assert.equal(engine.fireManager.count, beforeFires + 1);
  });

  // Move the player onto the fire's exact spot so interact is in range,
  // then open + submit the task through the offline fallback path.
  const fire = engine.fireManager.fires[0];
  engine.player.x = fire.x - engine.player.width / 2;
  engine.player.y = fire.y - engine.player.height / 2;

  const opened = engine.attemptInteract();
  check('interact opens a task when standing on a fire', () => assert.equal(opened, true));
  check('engine state is TASK_ACTIVE while a task is open', () => {
    assert.equal(engine.state, GameState.TASK_ACTIVE);
  });

  const active = engine.getActiveTask();
  const outcome = await engine.submitTaskSolution(active.task.buggyCode);
  check('submitTaskSolution returns a result object (fallback mode expected offline)', () => {
    assert.ok('ok' in outcome);
    assert.ok(outcome.degraded === true, 'expected offline fallback in this sandbox (no network)');
  });
  check('a passing submission clears the fire and resumes PLAYING', () => {
    assert.equal(engine.fireManager.count, beforeFires);
    assert.equal(engine.state, GameState.PLAYING);
    assert.equal(engine.scoreManager.points, 1);
  });

  // Line the player up right on top of the rat (centers coincident, so the
  // facing angle can't put it outside the attack cone) and land a real hit
  // through attemptAttack(), so scoring + win-condition go through the
  // real code path rather than being poked directly.
  engine.player.x = 100;
  engine.player.y = 100;
  engine.player.facingAngle = 0;
  engine.player.attackCooldownTimer = 0;
  engine.rat.x = engine.player.centerX - engine.rat.width / 2;
  engine.rat.y = engine.player.centerY - engine.rat.height / 2;
  const killed = engine.attemptAttack();
  check('a torch swing on top of the rat kills it', () => assert.equal(killed, true));
  check('killing the rat with no fires left wins the level', () => {
    assert.equal(engine.state, GameState.WON);
  });
  check('rat kill awarded 3 points on top of the 1 from the fire', () => {
    assert.equal(engine.scoreManager.points, 4);
  });
})();

console.log('\nFire lifecycle edge cases');
check('a fire left burning past FIRE_MAX_DURATION burns the house down', () => {
  const engine = new GameEngine('easy');
  const fire = engine.fireManager.ignite(50, 50);
  // Fast-forward without ever going near the fire.
  for (let i = 0; i < 400; i++) engine.update(1, { x: 0, y: 0 }); // 400 simulated seconds
  assert.equal(engine.state, GameState.LOST);
  assert.ok(fire.elapsed >= 300);
});

check('a level respects its simultaneous-fire cap', () => {
  const engine = new GameEngine('easy'); // easy caps at 2 simultaneous fires
  engine.fireManager.ignite(10, 10);
  engine.fireManager.ignite(20, 20);
  const third = engine.fireManager.ignite(30, 30);
  assert.equal(third, null);
  assert.equal(engine.fireManager.count, 2);
});

console.log(`\n${passed} checks passed.`);
if (process.exitCode) {
  console.error('SOME CHECKS FAILED');
} else {
  console.log('All good.');
}
