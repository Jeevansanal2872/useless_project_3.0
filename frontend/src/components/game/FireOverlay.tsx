import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSessionStore } from '../../store/sessionStore';
import { getFireTiles } from '../../game-engine/fireSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';
import { NaturalFire } from './NaturalFire';

export const FireOverlay: React.FC = () => {
  const fireLevel = useGameStore((state) => state.fireLevel);
  const firePos = useGameStore((state) => state.firePos);
  const setStatus = useSessionStore((state) => state.setStatus);
  const tiles = getFireTiles();

  if (fireLevel === 0 && tiles.length === 0) return null;

  // Ambient house glow intensity
  const opacity = Math.min(0.4, (fireLevel / 7) * 0.4);

  const handleFireClick = () => {
    // Open BugTask Modal window to solve Python bug and extinguish fire
    setStatus('BUG_FIXING');
  };

  return (
    <>
      {/* Ambient house heat overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 z-10"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 1)',
          opacity: opacity,
          mixBlendMode: 'color-dodge',
        }}
      />

      {/* Render natural flickering fires on the floor */}
      {tiles.length > 0 ? (
        tiles.map((tile) => (
          <NaturalFire
            key={tile.id}
            x={(tile.x / GAME_WIDTH) * 100}
            y={(tile.y / GAME_HEIGHT) * 100}
            intensity={tile.intensity}
            onClick={handleFireClick}
          />
        ))
      ) : (
        // Fallback for single fire position
        firePos && (
          <NaturalFire
            x={(firePos.x / GAME_WIDTH) * 100}
            y={(firePos.y / GAME_HEIGHT) * 100}
            intensity={1}
            onClick={handleFireClick}
          />
        )
      )}
    </>
  );
};
