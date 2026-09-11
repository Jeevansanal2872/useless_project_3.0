// inputController.js
// Wraps raw keyboard events into two kinds of signal the game engine cares
// about: a continuous movement vector (WASD / arrows), and one-shot
// "just pressed" actions (attack, interact, pause-task) that shouldn't
// re-fire every single frame while the key is held down.

const MOVE_KEYS = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

const ACTION_KEYS = {
  Space: 'attack',
  KeyE: 'interact',
  Escape: 'pauseTask',
};

export class InputController {
  constructor(target = window) {
    this._down = new Set();
    this._pressedThisFrame = new Set();
    this._target = target;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  attach() {
    this._target.addEventListener('keydown', this._onKeyDown);
    this._target.addEventListener('keyup', this._onKeyUp);
  }

  detach() {
    this._target.removeEventListener('keydown', this._onKeyDown);
    this._target.removeEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(e) {
    if ((MOVE_KEYS[e.code] || ACTION_KEYS[e.code]) && !e.repeat) {
      this._pressedThisFrame.add(e.code);
    }
    if (MOVE_KEYS[e.code] || ACTION_KEYS[e.code]) e.preventDefault();
    this._down.add(e.code);
  }

  _onKeyUp(e) {
    this._down.delete(e.code);
  }

  /** Normalized-ish {x,y} movement vector from currently held keys. */
  getMoveVector() {
    let x = 0;
    let y = 0;
    if (this._down.has('KeyW') || this._down.has('ArrowUp')) y -= 1;
    if (this._down.has('KeyS') || this._down.has('ArrowDown')) y += 1;
    if (this._down.has('KeyA') || this._down.has('ArrowLeft')) x -= 1;
    if (this._down.has('KeyD') || this._down.has('ArrowRight')) x += 1;
    return { x, y };
  }

  /** True exactly once, on the frame an action key was first pressed. */
  consumeAction(actionName) {
    for (const [code, name] of Object.entries(ACTION_KEYS)) {
      if (name === actionName && this._pressedThisFrame.has(code)) {
        return true;
      }
    }
    return false;
  }

  /** Call once per frame after the engine has read this frame's actions. */
  endFrame() {
    this._pressedThisFrame.clear();
  }
}
