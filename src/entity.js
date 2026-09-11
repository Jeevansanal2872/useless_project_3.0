// entity.js
// Minimal shared base for anything that lives on the map and has a
// rectangular collision body plus a facing angle.

export class Entity {
  constructor({ x, y, width = 22, height = 22 }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.facingAngle = 0; // radians, 0 = facing +x (east)
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  /** Axis-aligned bounding box in the shape the collision helpers expect. */
  rect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  position() {
    return { x: this.centerX, y: this.centerY };
  }
}
