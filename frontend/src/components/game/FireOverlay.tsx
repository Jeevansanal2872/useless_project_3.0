import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';
import Fire1 from '../../assets/icons/in-game/fire/Level1.svg?react';
import Fire2 from '../../assets/icons/in-game/fire/Level2.svg?react';
import Fire3 from '../../assets/icons/in-game/fire/Level3.svg?react';
import Fire4 from '../../assets/icons/in-game/fire/Level4.svg?react';
import Fire5 from '../../assets/icons/in-game/fire/Level5.svg?react';
import Fire6 from '../../assets/icons/in-game/fire/Level6.svg?react';
import Fire7 from '../../assets/icons/in-game/fire/Level7.svg?react';

const FireIcons = [null, Fire1, Fire2, Fire3, Fire4, Fire5, Fire6, Fire7];

export const FireOverlay: React.FC = () => {
  const fireLevel = useGameStore((state) => state.fireLevel);
  const firePos = useGameStore((state) => state.firePos);

  if (fireLevel === 0 || !firePos) return null;

  const opacity = (fireLevel / 7) * 0.5;
  const ActiveFireIcon = FireIcons[fireLevel];

  return (
    <>
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 z-10"
        style={{
          backgroundColor: 'rgba(255, 100, 0, 1)',
          opacity: opacity,
          mixBlendMode: 'overlay',
        }}
      />
      {ActiveFireIcon && (
        <div 
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${(firePos.x / GAME_WIDTH) * 100}%`,
            top: `${(firePos.y / GAME_HEIGHT) * 100}%`,
            width: '128px',
            height: '128px',
            marginLeft: '-64px',
            marginTop: '-64px',
          }}
        >
          <ActiveFireIcon className="w-full h-full object-contain animate-pulse text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
        </div>
      )}
    </>
  );
};
