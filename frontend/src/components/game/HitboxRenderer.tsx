import React from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { houseMapHitboxes, GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';

export const HitboxRenderer: React.FC = () => {
  const currentLevel = useSessionStore(state => state.currentLevel);
  const debugHitboxes = useSessionStore(state => state.debugHitboxes);

  if (!debugHitboxes || !currentLevel) return null;

  const hitboxes = houseMapHitboxes[currentLevel] || [];

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {hitboxes.map((rect, i) => (
        <div
          key={i}
          className="absolute border-2 border-red-500"
          style={{
            left: `${(rect.x / GAME_WIDTH) * 100}%`,
            top: `${(rect.y / GAME_HEIGHT) * 100}%`,
            width: `${(rect.w / GAME_WIDTH) * 100}%`,
            height: `${(rect.h / GAME_HEIGHT) * 100}%`,
            backgroundColor: 'rgba(255, 0, 0, 0.25)',
          }}
        >
          {rect.label && (
            <span className="text-white text-[8px] leading-tight px-0.5 bg-black/60 whitespace-nowrap">
              {rect.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
