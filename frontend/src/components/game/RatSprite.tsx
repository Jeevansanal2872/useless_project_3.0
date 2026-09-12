import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import gsap from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/houseMapHitboxes';
import RatIdle from '../../assets/icons/in-game/Rat/idle.svg?react';
import RatRun from '../../assets/icons/in-game/Rat/run.svg?react';
import RatSprint from '../../assets/icons/in-game/Rat/sprint.svg?react';
import RatJump1 from '../../assets/icons/in-game/Rat/Jump1.svg?react';
import RatJump2 from '../../assets/icons/in-game/Rat/Jump2.svg?react';

// Same two-div pattern as PlayerSprite: outer for GSAP position, inner for React transform

let jumpFrame = 0;

export const RatSprite: React.FC = () => {
  const { ratPos, ratDirection, ratState } = useGameStore();
  const posRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (posRef.current) {
      gsap.to(posRef.current, {
        left: `${(ratPos.x / GAME_WIDTH) * 100}%`,
        top: `${(ratPos.y / GAME_HEIGHT) * 100}%`,
        duration: 0.1,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }
    if (ratState === 'evading') {
      jumpFrame = (jumpFrame + 1) % 4;
    }
  }, [ratPos, ratState]);

  let SpriteComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  let scaleX = 1;

  if (ratState === 'evading') {
    // Alternate between jump frames for a running animation
    if (jumpFrame < 2) {
      SpriteComponent = RatJump1;
    } else {
      SpriteComponent = RatJump2;
    }
  } else {
    SpriteComponent = RatIdle;
  }

  if (ratDirection === 'Left') scaleX = -1;

  return (
    <div
      ref={posRef}
      className="absolute z-20"
      style={{
        left: `${(ratPos.x / GAME_WIDTH) * 100}%`,
        top: `${(ratPos.y / GAME_HEIGHT) * 100}%`,
        width: 0,
        height: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '44px',
          height: '44px',
          marginLeft: '-22px',
          marginTop: '-22px',
          transform: `scaleX(${scaleX})`,
          transition: 'transform 0.1s ease',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
        }}
      >
        <SpriteComponent className="w-full h-full object-contain" />
      </div>
    </div>
  );
};
