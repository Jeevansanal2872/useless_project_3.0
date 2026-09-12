// collision.js
// Small, dependency-free geometry helpers. Everything here is a pure
// function so it's trivial to unit test in isolation from the game loop.

/** Axis-aligned bounding box intersection test. */
export function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** True if `rect` collides with any rectangle in `walls`. */
export function collidesWithAny(rect, walls) {
  for (const wall of walls) {
    if (rectsIntersect(rect, wall)) return true;
  }
  return false;
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Attempts to move a rectangular body by (dx, dy) against the ORIGINAL
 * position on every axis check (not sequentially), sliding along a wall
 * when just one axis is blocked. Returns the resolved position plus flags
 * describing what happened, so callers (e.g. the player) can decide
 * whether a "direct" hit — no axis at all offered a way through, i.e. a
 * dead-on hit into a wall or boxed-in corner — should stun.
 *
 * @param {{x:number,y:number,width:number,height:number}} body
 * @param {number} dx
 * @param {number} dy
 * @param {Array<{x:number,y:number,width:number,height:number}>} walls
 */
export function moveWithSliding(body, dx, dy, walls) {
  const { x, y, width, height } = body;

  if (dx === 0 && dy === 0) {
    return { x, y, xBlocked: false, yBlocked: false, directHit: false };
  }

  const combinedRect = { x: x + dx, y: y + dy, width, height };
  if (!collidesWithAny(combinedRect, walls)) {
    return { x: combinedRect.x, y: combinedRect.y, xBlocked: false, yBlocked: false, directHit: false };
  }

  // The full diagonal move is blocked — see if sliding along a single axis
  // still works, checked independently from the original position.
  const xOnlyBlocked = dx !== 0 && collidesWithAny({ x: x + dx, y, width, height }, walls);
  if (dx !== 0 && !xOnlyBlocked) {
    return { x: x + dx, y, xBlocked: false, yBlocked: true, directHit: false };
  }

  const yOnlyBlocked = dy !== 0 && collidesWithAny({ x, y: y + dy, width, height }, walls);
  if (dy !== 0 && !yOnlyBlocked) {
    return { x, y: y + dy, xBlocked: true, yBlocked: false, directHit: false };
  }

  // Neither the diagonal nor either individual axis had any give — a
  // genuine dead-on hit into a wall/corner with nowhere to slide.
  const directHit = dx !== 0 && dy !== 0;
  return { x, y, xBlocked: true, yBlocked: true, directHit };
}
