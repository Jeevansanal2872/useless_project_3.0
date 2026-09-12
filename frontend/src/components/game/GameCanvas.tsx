import React, { useEffect, useRef } from 'react';
import { HouseMap } from './HouseMap';
import { PlayerSprite } from './PlayerSprite';
import { RatSprite } from './RatSprite';
import { FireOverlay } from './FireOverlay';
import { HitboxRenderer } from './HitboxRenderer';
import { startGameLoop, stopGameLoop } from '../../game-engine/gameLoop';
import { useSessionStore } from '../../store/sessionStore';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setStatus = useSessionStore(state => state.setStatus);
  const setMapRect = useSessionStore(state => state.setMapRect);
  const mapRect = useSessionStore(state => state.mapRect);

  useEffect(() => {
    if (useSessionStore.getState().status === 'IDLE') {
      setStatus('PLAYING');
    }
    startGameLoop();
    return () => {
      stopGameLoop();
    };
  }, [setStatus]);

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scaleX = windowWidth / GAME_WIDTH;
      const scaleY = windowHeight / GAME_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      
      setMapRect({
        width: GAME_WIDTH * scale,
        height: GAME_HEIGHT * scale,
        scale,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [setMapRect]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-900 flex items-center justify-center">
      <div 
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          width: `${mapRect.width}px`,
          height: `${mapRect.height}px`,
        }}
      >
        <div className="absolute inset-0 z-0">
          <HouseMap />
        </div>

        <HitboxRenderer />
        <FireOverlay />
        <RatSprite />
        <PlayerSprite />
      </div>
    </div>
  );
};
