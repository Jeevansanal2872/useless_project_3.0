# Torch & Rat — backend

Backend/game-logic implementation for the "chase the rat, don't burn the
house down" game. Everything under `src/` is pure logic with **no DOM,
canvas, or UI code in it** — it's designed to be dropped behind whatever
real UI your UX dev builds. `index.html` + `main.js` + `style.css` at the
project root are a throwaway canvas harness for exercising that logic.

## Running the test harness

This uses native ES modules, so it needs to be served over HTTP (browsers
block `import` from `file://`). From this folder:

```bash
python -m http.server 8000
# or: npx serve .
```

Then open `http://localhost:8000`. Pick a level, use WASD/arrows to move,
Space to swing the torch, E to fight the nearest fire, Esc to pause a task
and keep chasing.

**Note on `.venv`:** nothing here needs a Python virtual environment — the
game itself is plain JS, and the bug-fixing mini-task runs real Python
*in the browser* via Pyodide (WASM), loaded from a CDN, not on any local
Python interpreter. `python -m http.server` above only needs the stdlib.
A `.gitignore` is included anyway in case you add local tooling later.

## Running the logic sanity tests

```bash
node test/sanity.mjs
```

These are plain Node smoke tests (no browser) covering map parsing,
collision/sliding math, the bug-task bank's shape, and a full engine
playthrough (miss → fire → solve → score → win). They already caught two
real bugs during development — see "Known-good behavior" below. Because
Pyodide needs a real browser + network, the Node tests exercise the
offline fallback validator (see `pyRunner.js`); the real Python grading
path is exercised by actually opening `index.html`.

## Module map

| File | Responsibility |
|---|---|
| `src/config.js` | Every tunable number/constant, plus per-level metadata. |
| `src/map.js` | ASCII house layouts → wall rectangles + spawn points. |
| `src/collision.js` | Pure AABB geometry: intersection test + slide-resolution. |
| `src/entity.js` | Tiny shared base (position, size, facing angle) for Player/Rat. |
| `src/player.js` | Movement, stun-on-direct-hit, torch swing. |
| `src/rat.js` | Wander / idle / flee state machine, jittery steering, obstacle evasion. |
| `src/fire.js` | `Fire` (ages in real time) + `FireManager` (ignite/extinguish/lose-check). |
| `src/bugTasks.js` | The bank of buggy Python functions + test cases, by difficulty. |
| `src/pyRunner.js` | Executes submitted Python via Pyodide and grades it against test cases (with an offline fallback). |
| `src/powerups.js` | Powerup pool + tiering by how fast a task was solved. |
| `src/score.js` | Point totals. |
| `src/inputController.js` | Keyboard → movement vector + one-shot action events. |
| `src/gameEngine.js` | **The orchestrator.** State machine, win/lose rules, the only thing the UI talks to. |
| `src/render.js` | Bare-bones canvas drawing for the test harness only. |
| `main.js` / `index.html` / `style.css` | Throwaway test UI. |

## How the game rules map to code

- **Chase & slap** — `Player.swingTorch()` returns a cone (`range`,
  `arcDegrees`, `facingAngle`); `GameEngine.attemptAttack()` tests the
  rat's position against that cone. Any swing that doesn't land — too far
  *or* wrong angle — is a miss.
- **Miss → fire** — a miss calls `fireManager.ignite(x, y)` at the swing
  origin. Each `Fire` tracks its own `elapsed` seconds independently.
- **Fire grows / house burns down** — `Fire.intensity` is
  `elapsed / FIRE_MAX_DURATION` (0–1, for rendering size). `FireManager`
  flags `houseBurnedDown` the instant any single fire's `elapsed` passes
  `FIRE_MAX_DURATION` (5 minutes); `GameEngine.update()` checks that every
  tick and transitions to `LOST`.
- **The game freezes during the bug task, but the clock doesn't** —
  `GameEngine.update()` unconditionally calls `fireManager.update(dt)`
  first, *then* returns early without moving Player/Rat if
  `state === TASK_ACTIVE`. Fires literally cannot be paused; only entity
  movement can.
- **Pausing a task to keep chasing** — `GameEngine.pauseTask()` just drops
  back to `PLAYING` without clearing the fire's assigned task or resetting
  `activeSolveTime`, so re-opening it later resumes the same task and the
  solve-time clock keeps counting only while a task is actually open.
- **Win condition** — `_checkWinCondition()` requires **both**
  `!rat.alive` **and** `fireManager.count === 0`. Killing the rat first is
  necessary but never sufficient on its own.
- **Player stun on collision** — `collision.moveWithSliding()` slides
  along a wall if either axis alone has room; a `directHit` (no axis has
  room) is what triggers `Player`'s 3-second `STUNNED` state. The rat
  never uses this path — `Rat._moveEvadingObstacles()` fans out across
  candidate headings instead, so it "evades obstacles more freely" and
  never gets stuck or stunned.
- **Rat behavior** — `Rat.js` is a 3-state machine (`WANDER` / `IDLE` /
  `FLEE`) with a much higher turn-rate constant than the player
  (`RAT_STEER_JITTER`), giving it noticeably twitchier steering, and a
  small per-frame chance to freeze into `IDLE` when far from the player.
- **Powerups** — granted in `PowerupManager.grantRandomPowerup()` on every
  successful `submitTaskSolution()`. On `easy` the full pool is always in
  play; on `medium`/`hard`, `activeSolveTime` (real seconds spent with
  that task open) is checked against `POWERUP_FAST_SOLVE_SECONDS` /
  `POWERUP_SLOW_SOLVE_SECONDS` in `config.js` to pick a weaker tier for
  slower solves. The powerup persists (no internal timer) until the next
  fire is put out, per the spec.
- **Levels** — `config.js#LEVEL_META` drives map choice, rat speed/
  detection multipliers, and the simultaneous-fire cap; `bugTasks.js`
  buckets tasks into `easy` / `medium` / `hard` pools for task intensity.

## Extending it

- **Add a bug task**: append an object to the right difficulty array in
  `bugTasks.js` — `functionName`, `buggyCode`, `description`, `hint`,
  and a few `testCases`. It's in rotation immediately.
- **Add a powerup**: append a `{id, label, tier, apply(player), remove(player)}`
  entry to `POWERUP_POOL` in `powerups.js`.
- **Add/edit a map**: edit the ASCII layout strings in `map.js`. `#` is
  wall, `.` is floor, exactly one `P` and one `R` per layout.
- **Swap in a real UI**: only `main.js`/`index.html`/`style.css`/`render.js`
  should need to change. Talk to `GameEngine` the same way `main.js` does:
  construct with a level id, call `update(dt, moveVector)` every frame,
  call `attemptAttack()` / `attemptInteract()` / `pauseTask()` /
  `submitTaskSolution(code)` on input, and read `getSnapshot()` to draw.
