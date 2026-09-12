# Frontend Build Prompt — "Rat Chase" React Game

Use this document as a direct build prompt for a coding agent (Claude Code, Cursor, etc.) or as a spec to build from manually. It assumes the asset structure already present in `frontend/Assets/` as shown below.

---

## 0. Known Asset Inventory (from your project tree)

```
frontend/Assets/
├── House_map/
│   ├── House-Easy.svg
│   ├── House-Medium.svg
│   └── House-Hard.svg
├── icons/
│   ├── Dialogues/
│   │   ├── character/
│   │   │   ├── Angry.svg
│   │   │   ├── Hero.svg
│   │   │   └── Winner.svg
│   │   └── rat/
│   │       ├── Front.svg
│   │       ├── left.svg
│   │       ├── Right.svg
│   │       └── Top.svg
│   ├── in-game/
│   │   ├── Character/
│   │   │   ├── Down.svg
│   │   │   ├── sprinting.svg
│   │   │   ├── Tired.svg
│   │   │   ├── Unconsious.svg
│   │   │   ├── Up-1.svg
│   │   │   └── Up.svg
│   │   ├── fire/
│   │   │   ├── Level0.svg ... Level7.svg   (8-stage fire escalation)
│   │   │   └── Rat/                         (rat directional/movement sprites — subfolder present but not expanded)
│   │   ├── Bag.svg
│   │   ├── Forward.svg
│   │   └── Pause.svg
│   └── Task/
│       └── Task.svg
```

**Known gaps the coding agent should flag or ask about, not silently invent:**
- Character sprite set has `Down`, `Up`, `Up-1`, `sprinting`, `Tired`, `Unconsious` — no explicit `Left`/`Right`. Confirm whether left/right are meant to be the `Down`/`Up`/`sprinting` assets mirrored via CSS `transform: scaleX(-1)`, or whether separate files exist elsewhere.
- Rat in-game movement sprites live in `icons/in-game/fire/Rat/` (unexpanded in the tree) — confirm this is not a misplaced folder (a "Rat" folder nested inside "fire" is likely a mis-drop and should probably sit at `icons/in-game/Rat/` alongside `Character/`).
- No explicit "torch" or "weapon" sprite separate from the character poses — confirm the torch is baked into each character SVG or needs its own layered asset.
- No exterior/road or garden decoration assets beyond the three house maps — confirm whether the house map SVGs already include exterior garden/road art or whether that's a separate background layer to be added.

---

## 1. Tech Stack & Project Structure

```
Framework: React 18+ (Vite, not CRA)
Language: TypeScript
State management: Zustand (lightweight, ideal for real-time game state — avoid Redux boilerplate for this)
Animation: Framer Motion for UI transitions; requestAnimationFrame-driven custom game loop for character/rat movement (Framer Motion is too heavy for 60fps sprite movement)
Styling: Tailwind CSS + CSS Modules for game-canvas-specific positioning
SVG handling: vite-plugin-svgr (import SVGs as React components, not <img> tags, so they can be recolored/manipulated via props)
Code editor for bug-fix minigame: @monaco-editor/react (VS Code's editor, in-browser)
Sound: Howler.js
Networking: fetch/axios wrapped in a typed API client layer (see Section 6)
Real-time (if backend supports it): Socket.io-client for live score/leaderboard updates
```

**Folder structure to generate:**

```
frontend/
├── src/
│   ├── assets/                    (existing SVGs — do not move, reference via alias)
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameCanvas.tsx           # fixed map + moving sprite layers
│   │   │   ├── HouseMap.tsx             # renders the correct level SVG map
│   │   │   ├── PlayerSprite.tsx         # directional/animated player
│   │   │   ├── RatSprite.tsx            # directional/animated rat, AI-driven
│   │   │   ├── FireOverlay.tsx          # renders Level0–Level7 fire SVGs based on state
│   │   │   ├── CollisionObstacle.tsx    # invisible hitboxes overlaid on map furniture
│   │   │   └── Minimap.tsx
│   │   ├── hud/
│   │   │   ├── NavBar.tsx               # in-game top navbar (pause, speed, timer, fire meter)
│   │   │   ├── FireMeter.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   ├── InventorySlot.tsx        # Bag.svg
│   │   │   └── PauseMenu.tsx            # Pause.svg triggers this
│   │   ├── modals/
│   │   │   ├── BugFixModal.tsx          # Monaco editor + Task.svg framing
│   │   │   ├── DialogueBox.tsx          # Angry/Hero/Winner character reactions
│   │   │   └── EndScreen.tsx            # win/fail screens
│   │   ├── menu/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LevelSelect.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── shared/
│   │       ├── IconButton.tsx           # wraps every icon SVG as a clickable button
│   │       └── GlassPanel.tsx           # reusable rounded glassmorphic container
│   ├── game-engine/
│   │   ├── gameLoop.ts                  # requestAnimationFrame core loop
│   │   ├── playerController.ts          # keyboard/touch input → velocity
│   │   ├── ratAI.ts                     # evasion/idle-wander state machine
│   │   ├── collisionSystem.ts           # AABB collision vs house-map hitbox data
│   │   ├── fireSystem.ts                # fire spawn/spread/escalation timer logic
│   │   └── difficultyConfig.ts          # per-level speed/timer/bug-intensity tuning
│   ├── store/
│   │   ├── gameStore.ts                 # Zustand: player pos, rat pos, score, fire state
│   │   ├── sessionStore.ts              # current level, pause state, timers
│   │   └── userStore.ts                 # auth/profile/currency (backend-synced)
│   ├── api/
│   │   ├── client.ts                    # axios instance, base URL, interceptors
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── progress.ts
│   │   │   ├── leaderboard.ts
│   │   │   └── bugTasks.ts              # fetches random Python bug snippets per difficulty
│   │   └── types.ts                     # shared request/response TypeScript interfaces
│   ├── hooks/
│   │   ├── useGameLoop.ts
│   │   ├── useKeyboardControls.ts
│   │   ├── useCollision.ts
│   │   └── useSocket.ts
│   ├── data/
│   │   ├── houseMapHitboxes.ts          # per-level obstacle coordinate maps
│   │   └── bugSnippets.local.ts         # fallback local bug tasks if backend offline
│   ├── App.tsx
│   └── main.tsx
```

---

## 2. Core Gameplay Loop (implementation spec)

### 2.1 Game state machine
```
IDLE → PLAYING → (PAUSED ⇄ PLAYING) → (FIRE_ACTIVE → BUG_MODAL_OPEN → FIRE_RESOLVED | FIRE_ESCALATED → HOUSE_BURNED_FAIL) → RAT_CAUGHT_WIN | TIME_UP_FAIL
```

### 2.2 Player movement
- Arrow keys / WASD (desktop), on-screen virtual joystick (touch/mobile web)
- Base speed constant `PLAYER_BASE_SPEED`, slightly higher than `RAT_BASE_SPEED` per difficulty config
- Holding the run/sprint key beyond `SPRINT_THRESHOLD_MS` (~1.2s) triggers `sprinting.svg` sprite + a speed multiplier, and increases collision-check sensitivity
- On collision with an obstacle while sprinting: trigger `Unconsious.svg` state, freeze player input for 3–4s (configurable per difficulty), play a "stun" sound
- Sprite selection logic: map current movement vector → `Up.svg` / `Up-1.svg` (alternate for run-cycle) / `Down.svg`, mirror horizontally via CSS transform for left/right movement (pending confirmation from Section 0 gap)

### 2.3 Rat AI
- Idle-wander state: rat pauses at intervals (`Front.svg`/`Top.svg` idle poses), resumes movement after a random timer
- Evasion state: when player is within `DETECTION_RADIUS`, rat pathfinds away using simple steering (flee vector), ignoring obstacles more freely than the player (smaller hitbox or obstacle-passthrough flag)
- Rat never enters the `Unconsious` state — no collision penalty for the rat
- Difficulty scaling: `RAT_SENSITIVITY` (turn responsiveness) and `RAT_IDLE_FREQUENCY` should both be defined in `difficultyConfig.ts`, tuned higher (more evasive) as difficulty increases

### 2.4 Fire system
- Triggered on a missed slap attempt (player attack input near rat but no hit registered)
- Fire severity escalates through `Level0.svg` → `Level7.svg` on a timer (8 stages across the 5-minute burn-down window — calculate per-stage duration as `300s / 7 transitions` per difficulty, adjusted by `difficultyConfig`)
- Player can "interact" with an active fire tile to open `BugFixModal`
- On successful bug fix: fire resets to extinguished, +1 point
- On modal timeout or Level7 reached: trigger `HOUSE_BURNED_FAIL` end state

### 2.5 Bug-fix minigame
- `BugFixModal` renders Monaco editor pre-loaded with a snippet fetched from `api/endpoints/bugTasks.ts` (or local fallback), scoped by current difficulty
- Countdown ring synced to `fireSystem.ts`'s remaining burn time
- Validate submitted code either via a lightweight client-side test-case runner (Pyodide for in-browser Python execution) or a backend `/api/bug-tasks/validate` endpoint — **flag this to the user as a decision point**: running Python in-browser (Pyodide) avoids backend round-trip latency but adds ~6MB WASM payload; a backend validation endpoint is lighter client-side but requires the backend to sandbox-execute user code safely.

---

## 3. House Map Navbar (in-map HUD)

The house map screen's navbar (per your Frame 4 HUD spec) should be built as `<NavBar />`, absolutely positioned over `<HouseMap />`, using these existing icon assets:

| Icon asset | Button behavior |
|---|---|
| `Pause.svg` | Opens `PauseMenu` modal, freezes `gameLoop` |
| `Forward.svg` | Fast-forward/speed-toggle (2x game speed for testing/accessibility) |
| `Bag.svg` | Opens inventory panel (torch/consumables) |
| Fire meter (custom, built from `fire/Level*.svg` mini-preview or a separate gauge component) | Live-bound to `fireSystem` severity state |
| Score badge (custom) | Live-bound to `gameStore.score` |

Navbar should use flexbox with `justify-content: space-between`, fixed to `top: 0`, `z-index` above the map layer but below modals.

---

## 4. Layer Stack (z-index order, top to bottom in code = bottom to top visually)

```
1. HouseMap (fixed background, z-0)
2. CollisionObstacle hitbox layer (invisible, z-0, dev-mode toggle to visualize)
3. FireOverlay (z-10)
4. RatSprite (z-20)
5. PlayerSprite (z-20, same layer as rat so depth-sorting by Y-position is possible if desired)
6. NavBar / HUD (z-30, position: fixed)
7. DialogueBox (Angry/Hero/Winner reactions) (z-40, transient)
8. BugFixModal / PauseMenu / EndScreen (z-50, full overlay with backdrop blur)
```

---

## 5. Difficulty Config Example (`difficultyConfig.ts`)

```ts
export const DIFFICULTY_CONFIG = {
  easy: {
    mapAsset: 'House-Easy.svg',
    playerSpeed: 4.5,
    ratSpeed: 3.5,
    ratIdleFrequency: 0.4,
    fireBurnDurationSec: 300,
    bugSnippetComplexity: 'simple',
    stunDurationMs: 3000,
  },
  medium: {
    mapAsset: 'House-Medium.svg',
    playerSpeed: 4.5,
    ratSpeed: 3.8,
    ratIdleFrequency: 0.25,
    fireBurnDurationSec: 210,
    bugSnippetComplexity: 'moderate',
    stunDurationMs: 3500,
  },
  hard: {
    mapAsset: 'House-Hard.svg',
    playerSpeed: 4.5,
    ratSpeed: 4.2,
    ratIdleFrequency: 0.1,
    fireBurnDurationSec: 120,
    bugSnippetComplexity: 'complex',
    stunDurationMs: 4000,
  },
} as const;
```

---

## 6. Backend Integration

Since the actual backend implementation wasn't shared, this section specifies the **contract** the frontend should be built against, so it can be wired up as soon as backend endpoints exist (or so you can hand this same contract to whoever builds the backend).

### 6.1 Expected REST endpoints
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/user/profile
GET    /api/user/progress              → { level, stars, unlockedLevels, currency }
POST   /api/user/progress               → save run result (score, time, level, outcome)
GET    /api/bug-tasks?difficulty=easy   → returns a random Python snippet + expected fix
POST   /api/bug-tasks/validate          → { snippetId, submittedCode } → { correct: bool }
GET    /api/leaderboard?scope=global|friends
```

### 6.2 Expected real-time events (if using Socket.io)
```
client → server: 'run:start'      { level }
client → server: 'run:score'      { points, reason: 'rat_caught' | 'fire_fixed' }
server → client: 'leaderboard:update'
```

### 6.3 Integration instructions for the coding agent
- Build `api/client.ts` as an isolated axios instance with a base URL read from `import.meta.env.VITE_API_BASE_URL`, so backend URL is swappable per environment without code changes.
- Every backend call must have a local-fallback/mock mode (`VITE_USE_MOCK_API=true`) so frontend development and demoing are never blocked by backend availability — this is especially important for `bugTasks.ts` since bug-fix gameplay is core-loop-critical.
- Wrap all backend calls in try/catch with a toast/notification fallback (do not let a failed leaderboard fetch break the game loop).
- **Ask the user directly if the actual backend repo/API spec exists** before assuming the above contract — if you (the coding agent) have access to backend source code, read it first and generate this section's types from the real schema instead of the placeholder one above.

---

## 7. Accessibility & Polish Checklist
- All icon-only buttons (`Pause.svg`, `Bag.svg`, `Forward.svg`) need `aria-label` and keyboard focus states
- Respect `prefers-reduced-motion` — disable Framer Motion transitions and sprite bob/idle animations for users who request it
- Ensure Monaco editor modal traps focus (no tabbing out to the game behind it) while open
- Support both keyboard (desktop) and touch/virtual-joystick (mobile web) input from day one, not as a retrofit

---

## 8. Build Order (suggested milestones for the coding agent)

1. Scaffold Vite + TS + Tailwind + Zustand, import all SVGs via `vite-plugin-svgr`, verify every asset renders as a component without console errors
2. Build static `HomePage` + `LevelSelect` (no game logic yet) to validate UI/UX from the Figma frames
3. Build `GameCanvas` with fixed `HouseMap` for Easy level only, add `PlayerSprite` with keyboard movement, no collision yet
4. Add `CollisionObstacle` hitbox system + stun state
5. Add `RatSprite` + AI evasion state machine
6. Add `FireSystem` + `FireOverlay` escalation
7. Add `BugFixModal` with mocked local bug snippets (no backend dependency yet)
8. Wire `NavBar`/HUD to live game state
9. Add Medium/Hard maps + `difficultyConfig` scaling
10. Wire real backend endpoints once available, replacing all mocks
11. Add sound, polish animations, accessibility pass, responsive/mobile pass

---

## 9. Prompt block (paste this directly into your coding agent if you want it to just start building)

```
Build a React + TypeScript + Vite game called "Rat Chase" using the SVG assets 
already present in frontend/Assets/ (house maps, character sprites, rat sprites, 
fire escalation stages, dialogue reaction icons, and HUD icons — do not 
regenerate or replace these files, import and use them as-is via 
vite-plugin-svgr). 

Follow the full architecture, state machine, gameplay logic, layer stack, 
difficulty config, and backend API contract defined in this document exactly. 
Use Zustand for game state, a requestAnimationFrame-based custom game loop 
(not Framer Motion) for player/rat movement, and Monaco Editor for the 
in-game Python bug-fix minigame. Build in the milestone order specified in 
Section 8, and stop to ask me before making assumptions about: (1) missing 
left/right character sprites, (2) the misplaced Rat sprite folder location, 
(3) whether bug-fix validation should run client-side via Pyodide or via a 
backend endpoint, and (4) whether a real backend API already exists that you 
should read from instead of the placeholder contract in Section 6.
```
