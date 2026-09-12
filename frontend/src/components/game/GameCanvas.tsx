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
      
      // Use "cover" scaling — scale to fill viewport completely, no black bars
      // This stretches the map to always fill 100vw x 100vh
      const scaleX = windowWidth / GAME_WIDTH;
      const scaleY = windowHeight / GAME_HEIGHT;
      // "cover" picks the LARGER scale so the map fills edge-to-edge
      const scale = Math.max(scaleX, scaleY);
      
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

  const mapRect = useSessionStore(state => state.mapRect);

  return (
    // Full-screen container — clips overflow from cover scaling
    <div className="fixed inset-0 overflow-hidden bg-zinc-900">
      {/* Centered map that fills or overflows the viewport */}
      <div
        ref={containerRef}
        className="absolute"
        style={{
          width: `${mapRect.width}px`,
          height: `${mapRect.height}px`,
          // Center the oversized map so overflow is clipped symmetrically
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Background map SVG */}
        <div className="absolute inset-0 z-0">
          <HouseMap />
        </div>

        {/* Debug hitboxes overlay (enabled with ?debug in URL) */}
        <HitboxRenderer />
        {/* Fire SVG spawned on map */}
        <FireOverlay />
        {/* Game entities */}
        <RatSprite />
        <PlayerSprite />
      </div>
    </div>
  );
};
