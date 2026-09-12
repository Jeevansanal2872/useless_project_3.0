import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const FireMeter: React.FC = () => {
  const fireLevel = useGameStore((state) => state.fireLevel);
  const MAX_FIRE = 7;

  return (
    <div className="flex flex-col items-center gap-1 bg-zinc-800/80 p-2 rounded-lg border border-zinc-700">
      <div className="text-orange-500 font-bold text-sm tracking-wider uppercase">Fire Lvl</div>
      <div className="flex gap-1">
        {Array.from({ length: MAX_FIRE }).map((_, i) => {
          const isActive = i < fireLevel;
          return (
            <div
              key={i}
              className={`w-4 h-6 rounded-sm transition-colors duration-300 ${
                isActive 
                  ? i > 4 ? 'bg-red-500' : i > 2 ? 'bg-orange-500' : 'bg-yellow-500' 
                  : 'bg-zinc-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
