# Fix Prompt — Rat Chase Game Frontend Bugs

Paste this directly to your coding agent (Antigravity/Claude Code/etc). It lists every bug from the current build, the root cause to check, and the exact fix expected — so the agent debugs systematically instead of patching symptoms.

---

## Context
The current build at `localhost:5174` has the core game rendering but several critical layout, input, and collision bugs. Go through each issue below **in order**, fix it, and verify visually before moving to the next — do not attempt all fixes in one blind pass.

---

## Bug 1 — Map is not fullscreen / canvas sizing is wrong

**Symptom:** The house map renders as a fixed-size box with large empty black space on both left and right sides of the browser window, instead of filling the viewport.

**Likely root cause:** The map SVG/container has a hardcoded pixel width/height instead of scaling to the viewport, and the parent container isn't set to `100vw`/`100vh`.

**Fix required:**
- Make the root game container (`#root` or the top-level `GameCanvas` wrapper) `width: 100vw; height: 100vh; overflow: hidden;`
- The `HouseMap` SVG should use `viewBox` (already presumably set) and scale via `width: 100%; height: 100%; object-fit: contain;` — or if you want it to fill edge-to-edge with cropping, `object-fit: cover;` — pick `contain` first so no gameplay-relevant map area gets cropped off-screen.
- All child layers (player, rat, fire, obstacles, HUD) must be positioned using **percentage or viewBox-relative coordinates**, not fixed pixel coordinates, so they scale together with the map when the window resizes. If positions are currently hardcoded in px against a specific map render size, that's the actual bug — refactor to a shared coordinate system (see Bug 4 for why this matters twice).
- Add a `ResizeObserver` or `window.resize` listener that recalculates the map's rendered bounding box on every resize, and re-derive all game-object positions from that bounding box rather than assuming a fixed canvas size.

---

## Bug 2 — Duplicate/scattered HUD buttons, some inside the map bounds and some outside

**Symptom:** There are two flame/fire icons, multiple orange circular buttons floating both on top of the map and outside it in the black empty space, and a "QUIT" button off to the side disconnected from everything else.

**Likely root cause:** HUD components are not consolidated into a single `<NavBar />`/`<HUD />` component with one clear positioning strategy — they look like they were added incrementally with ad-hoc `position: absolute` values relative to different parents (some relative to the map, some relative to the page body).

**Fix required:**
- Consolidate ALL HUD elements (pause, speed-toggle, bag/inventory, score badge, fire meter, quit button) into a single `<NavBar />` component.
- `<NavBar />` must be `position: fixed`, `top: 0`, `left: 0`, `width: 100%`, `z-index` above the map layer, and internally use `display: flex; justify-content: space-between;` to place left-cluster (pause/speed/bag/score) vs right-cluster (fire meter/quit) — so there is exactly ONE instance of each button, and none of them are ever rendered as children of `HouseMap` or positioned relative to the black background area.
- Delete/remove whatever duplicate fire icon component is currently being rendered a second time near the top-right — audit the JSX tree for `<FireIcon />` or similar being mounted twice (once probably inside an old HUD attempt, once in a newer one that wasn't cleaned up).

---

## Bug 3 — In-map buttons are not functional (no click handlers firing)

**Symptom:** Pause, speed-toggle, and bag icons render visually but clicking them does nothing.

**Likely root cause:** One or more of: (a) the SVGs are imported as raw `<img>` tags with no wrapping clickable element, (b) `onClick` handlers were written but never actually connected to the Zustand store's pause/inventory actions, (c) a z-index issue where an invisible layer (like the collision hitbox layer) sits on top of the buttons and intercepts the click before it reaches the button.

**Fix required:**
- Wrap every icon SVG in a proper `<button>` element (not a bare `<img>` or `<div>`), so it's natively focusable/clickable and gets default browser button behavior (cursor, keyboard activation).
- Verify each button's `onClick` actually calls a real store action (e.g. `gameStore.togglePause()`), not a stub/placeholder function or `console.log` left over from scaffolding.
- Check computed z-index in devtools: if the collision-hitbox debug layer or the fire-overlay layer has a higher z-index than the HUD and covers the same screen area, it will silently eat click events even though the button is visually on top. Fix the z-index stacking order to match the layer order already defined in the project spec (Map → Collision → Fire → Sprites → HUD → Modals), and make sure the collision layer has `pointer-events: none` since it should only be used for hit-testing in JS, never intercept real clicks.

---

## Bug 4 — Fire mechanic is completely wrong: it's a clickable icon instead of a meter that fills from random floor fires

**Symptom:** There are two flame icons that appear to just be clickable buttons, rather than the intended mechanic: a meter that gradually fills as fire spreads after a missed slap, spawning at a random floor location.

**Likely root cause:** The fire system was implemented as a static UI toggle instead of the actual game-state-driven escalation system.

**Fix required — rebuild this feature correctly:**
- Remove both existing flame icon buttons entirely.
- Implement `fireSystem.ts` (or fix the existing one) so that:
  1. A missed slap attempt has a defined trigger condition (player attack input registered, but distance-to-rat check fails) that calls `spawnFire(randomFloorPosition)`.
  2. `randomFloorPosition` must be chosen from a **valid walkable floor tile list per map** (not literally any x/y — it must land inside a room's floor area, not inside a wall or piece of furniture). If you don't yet have a floor-tile map for each house SVG, generate one: a simple array of walkable rectangle regions per room, defined once per map file.
  3. Once spawned, render the corresponding fire SVG stage (`Level0.svg` → `Level7.svg`) **at that specific (x, y) position on the map**, not as a fixed HUD icon.
  4. A single **fire meter UI element** (a horizontal or circular gauge, NOT a clickable icon) reflects the current fire's severity level (0–7), filling as time passes, exactly as originally specified. This meter is read-only feedback — it should never itself be clickable. The clickable interaction is walking the player character to the fire's actual (x, y) location on the map and pressing an "interact" key/button there, which then opens `BugFixModal`.
  5. If the fire reaches `Level7` before being fixed, trigger the house-burned fail state.

---

## Bug 5 — Rat can leave the house (walks outside the walls)

**Symptom:** The rat's position is not constrained to the interior floor area — it can wander into the exterior garden/black space.

**Likely root cause:** The rat AI's movement/steering logic has no boundary check against the house's outer wall polygon — it's probably only avoiding the player, not checking whether its next position is inside the valid interior region at all.

**Fix required:**
- Define the house's interior boundary as an explicit polygon (or a set of room rectangles) per map, separate from individual furniture obstacles.
- Before applying any movement step to the rat (or the player, for defense-in-depth), check whether the resulting position falls inside the interior boundary polygon. If not, clamp the position to the nearest valid point inside the boundary or reject the movement step and pick a new wander direction.
- This is the same underlying system needed for Bug 6 below (obstacle collision) — build one unified `collisionSystem.ts` that handles both "is this point inside the house" and "does this point overlap a piece of furniture," rather than two separate ad-hoc checks.

---

## Bug 6 — No collision detection against walls/furniture — player and rat pass through everything

**Symptom:** Walls, sofas, beds, etc. are purely visual — there is no hitbox data backing them, so both characters clip straight through.

**Likely root cause:** `CollisionObstacle` component and `collisionSystem.ts` either don't exist yet or exist but were never populated with real hitbox coordinates extracted from the actual map SVGs — this is very likely the single biggest missing piece, since it's foundational to the "stun on collision" mechanic described in the original spec.

**Fix required:**
- For each house map (`House-Easy.svg`, `House-Medium.svg`, `House-Hard.svg`), manually define a hitbox data file (e.g. `houseMapHitboxes.ts`) containing an array of rectangles (or polygons) for: (a) exterior + interior walls, (b) every piece of furniture that should block movement (bed, sofa, dining table, kitchen counters, etc.). These coordinates should be authored against the SVG's `viewBox` coordinate space so they scale correctly with Bug 1's fix.
- Implement AABB (axis-aligned bounding box) collision checks in `collisionSystem.ts`: before moving the player or rat, test the character's next bounding box against every hitbox rectangle; if overlapping, reject the movement (or clamp to the boundary edge, sliding along it, which feels better than a hard stop).
- Wire the stun mechanic: if the player is in `sprinting` state and a collision is detected, trigger the `Unconsious.svg` state and freeze input for the configured duration (see `difficultyConfig.ts` `stunDurationMs`) instead of just blocking movement silently.
- Add a dev-mode visual toggle (e.g. a keyboard shortcut or `?debug=hitboxes` URL param) that renders all hitbox rectangles as semi-transparent red overlays, so hitbox authoring/tuning can be verified visually without guessing — this will make it much faster to get the hitbox coordinates right for all three difficulty maps.

---

## Bug 7 — Not all character SVGs are being used despite being available in the assets folder

**Symptom:** Only a subset of the character sprite states are rendering; sprites like `Tired.svg`, `Winner.svg`, `Angry.svg`, `Hero.svg` (dialogue reactions), and possibly `Up-1.svg` as the alternate run-cycle frame aren't wired up anywhere.

**Likely root cause:** The sprite-state switch statement/logic in `PlayerSprite.tsx` only handles a couple of states (e.g. idle + one run direction) and was never extended to cover the full state machine — and the `Dialogues/character/` reaction sprites were probably never connected to any trigger events at all.

**Fix required:**
- Audit `PlayerSprite.tsx` and confirm it has a complete state → sprite mapping:
  - `Up.svg` / `Up-1.svg` → alternate every N frames during upward movement for a walk-cycle effect (not just showing one static frame while moving)
  - `Down.svg` → downward movement
  - Left/right → mirror `Up`/`Down`/`sprinting` via `transform: scaleX(-1)` combined with a horizontal-vs-vertical velocity check (per the gap flagged earlier — confirm this is really the intended approach, or add real left/right assets if not)
  - `sprinting.svg` → active only above the sprint-speed threshold
  - `Tired.svg` → should trigger after some stamina/sprint-cooldown condition if that mechanic exists, or after repeated sprint use — confirm intended trigger with design doc; if no stamina system exists yet, this sprite currently has no trigger condition and needs one defined
  - `Unconsious.svg` → collision/stun state (Bug 6)
- Wire up `Dialogues/character/Angry.svg`, `Hero.svg`, `Winner.svg` as a `DialogueBox` component that pops up briefly on specific game events (e.g. `Angry` on a missed slap or fire escalation, `Hero`/determined pose on successfully landing a hit, `Winner` on level-complete) — these currently have zero code referencing them, which is why they're unused.
- Do the same audit for the rat's directional sprites (`Front.svg`, `left.svg`, `Right.svg`, `Top.svg` in `Dialogues/rat/`, plus whatever lives in the `in-game/fire/Rat/` folder) — confirm every exported rat sprite has a mapped state, and fix the likely-misplaced `Rat` folder path (currently nested inside `fire/`) so imports aren't pointing at a confusing/wrong directory.

---

## Suggested Fix Order (don't do these out of order — later fixes depend on earlier ones)

1. Bug 1 (fullscreen/coordinate system) — everything else's positioning math depends on this being correct first
2. Bug 6 (collision system + hitbox data) — foundational, and Bug 5 (rat boundary) reuses the same system
3. Bug 5 (rat boundary containment)
4. Bug 2 (consolidate HUD into one NavBar) 
5. Bug 3 (fix click handlers, now that HUD is consolidated and z-index stacking is clean)
6. Bug 4 (rebuild fire mechanic properly)
7. Bug 7 (wire up all remaining unused sprites)

---

## Prompt block — paste this directly to your coding agent

```
Debug and fix the Rat Chase game frontend currently running at localhost:5174. 
Go through these 7 issues in this exact order, since later fixes depend on 
earlier ones being correct first, and verify each one visually before moving 
to the next:

1. The map is not filling the browser viewport — fix the container/canvas 
   sizing so HouseMap fills 100vw/100vh with a proper coordinate system that 
   all game-object positions (player, rat, fire, HUD) derive from, so 
   everything scales together on resize.

2. There are duplicate and scattered HUD buttons, some rendered inside the 
   map bounds and some outside in the empty background — consolidate every 
   HUD element (pause, speed toggle, bag, score, fire meter, quit) into one 
   single NavBar component, fixed to the top of the viewport, and remove any 
   duplicate fire icon components.

3. In-map buttons don't fire onClick — audit for missing/stubbed click 
   handlers and z-index stacking issues where an invisible collision layer 
   may be intercepting clicks (that layer must have pointer-events: none).

4. The fire mechanic is wrong — it's currently a clickable icon. Rebuild it 
   so fire spawns at a random valid walkable floor position after a missed 
   slap, escalates through Level0–Level7 SVGs rendered at that map position 
   over time, and is reflected by a read-only fire meter UI (not a button). 
   The player must walk to the fire's location and interact there to open 
   the bug-fix modal.

5. The rat can walk outside the house exterior walls — add house-boundary 
   containment so neither character can leave the interior polygon.

6. There is no collision detection against walls or furniture at all — 
   author hitbox rectangle data for every house map's walls and furniture, 
   implement AABB collision checking before applying any movement, and wire 
   the existing stun/Unconsious.svg mechanic to trigger on sprint collisions.

7. Many character and rat SVGs in the assets folder are never used — audit 
   the sprite-state mapping in PlayerSprite and RatSprite and wire up every 
   available sprite (Tired, Winner, Angry, Hero dialogue reactions, Up-1 
   run-cycle alternate frame, all rat directional sprites) to a real trigger 
   condition, asking me to clarify the intended trigger if one isn't obvious 
   from existing game logic (e.g. what should trigger Tired.svg).

Add a dev-mode debug toggle that visualizes all collision hitboxes as 
semi-transparent overlays, since that will make tuning the wall/furniture 
hitboxes for all three difficulty maps much faster and more accurate.
```
