import { updatePlayer } from './playerController';
import { checkRatCollision } from './collisionSystem';
import { updateRat } from './ratAI';
import { useSessionStore } from '../store/sessionStore';
import { initKeyboardControls } from '../hooks/useKeyboardControls';

let animationFrameId: number;
let lastTime: number = 0;
let cleanupKeyboard: (() => void) | null = null;

const loop = (time: number) => {
  if (!lastTime) lastTime = time;
  const deltaTime = time - lastTime;
  lastTime = time;

  const status = useSessionStore.getState().status;
  if (status === 'PLAYING') {
    updatePlayer(deltaTime);
    updateRat(deltaTime);
    
    if (checkRatCollision()) {
      useSessionStore.getState().setStatus('BUG_FIXING');
    }
  }

  animationFrameId = requestAnimationFrame(loop);
};

export const startGameLoop = () => {
  if (animationFrameId) return;
  if (!cleanupKeyboard) {
    cleanupKeyboard = initKeyboardControls();
  }
  lastTime = 0;
  animationFrameId = requestAnimationFrame(loop);
};

export const stopGameLoop = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
  if (cleanupKeyboard) {
    cleanupKeyboard();
    cleanupKeyboard = null;
  }
};
