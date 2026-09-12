export const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowLeft: false,
  ArrowDown: false,
  ArrowRight: false,
  Shift: false,
  ' ': false, // Spacebar
};

export const initKeyboardControls = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key in keys) {
      keys[e.key as keyof typeof keys] = true;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key in keys) {
      keys[e.key as keyof typeof keys] = false;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
};
