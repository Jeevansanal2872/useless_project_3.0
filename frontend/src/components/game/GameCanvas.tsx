import React, { useEffect } from 'react';
import { HouseMap } from './HouseMap';
import { PlayerSprite } from './PlayerSprite';
import { RatSprite } from './RatSprite';
import { FireOverlay } from './FireOverlay';
import { HitboxRenderer } from './HitboxRenderer';
import { InMapHUD } from './InMapHUD';
import { startGameLoop, stopGameLoop } from '../../game-engine/gameLoop';
import { useSessionStore } from '../../store/sessionStore';
import { useGameStore, LEVEL_SPAWN } from '../../store/gameStore';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';

export const GameCanvas: React.FC = () => {
  const setStatus   = useSessionStore(state => state.setStatus);
  const setMapRect   = useSessionStore(state => state.setMapRect);
  const currentLevel = useSessionStore(state => state.currentLevel);
  const setPlayerPos = useGameStore(state => state.setPlayerPos);
  const setRatPos    = useGameStore(state => state.setRatPos);

  useEffect(() => {
    // Apply per-level safe spawn positions
    const level = (currentLevel ?? 'easy') as keyof typeof LEVEL_SPAWN;
    const spawn = LEVEL_SPAWN[level] ?? LEVEL_SPAWN.easy;
    setPlayerPos(spawn.player);
    setRatPos(spawn.rat);

    if (useSessionStore.getState().status === 'IDLE') {
      setStatus('PLAYING');
    }
    startGameLoop();
    return () => {
      stopGameLoop();
    };
  }, [setStatus, setPlayerPos, setRatPos, currentLevel]);

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Stretch to fully fill viewport (no letterboxing, both axes independent)
      const scaleX = w / GAME_WIDTH;
      const scaleY = h / GAME_HEIGHT;
      // Use min scale for a "contain" feel — but user asked for fullscreen stretch
      // We pass scale = 1 since the map container itself is 100vw×100vh;
      // percentage-based child positions automatically scale with the container.
      setMapRect({ width: w, height: h, scale: Math.min(scaleX, scaleY) });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [setMapRect]);

  return (
    // Full-screen container — map stretches to fill exactly 100vw × 100vh
    <div className="fixed inset-0 overflow-hidden bg-zinc-900">
      {/* Map container: always 100% of viewport, SVG stretches with preserveAspectRatio="none" */}
      <div
        className="absolute inset-0"
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Background map SVG — stretched to fill */}
        <div className="absolute inset-0 z-0">
          <HouseMap />
        </div>

        {/* In-map interactive button hotspots (layered over SVG icons) */}
        <InMapHUD />

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
